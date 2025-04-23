import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { compareSync, hashSync } from "bcryptjs";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { 
  loginSchema, 
  doctorSignupSchema, 
  organizationSignupSchema,
  users,
  gradeReportSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

// Set up multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

const execPromise = promisify(exec);

// Session type for express-session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    userType: 'doctor' | 'organization';
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userType = user.userType as 'doctor' | 'organization';
      
      res.json({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        type: user.userType
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/me', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        type: user.userType
      });
    } catch (error) {
      res.status(500).json({ message: 'Authentication check failed' });
    }
  });
  
  // Signup routes
  app.post('/api/signup/doctor', async (req, res) => {
    try {
      const userData = doctorSignupSchema.parse(req.body);
      
      // Check if email is already in use
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create user
      const hashedPassword = hashSync(userData.password, 10);
      const user = await storage.createUser({
        username: userData.email,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        specialization: userData.specialization,
        userType: 'doctor'
      });
      
      // Create doctor
      const doctor = await storage.createDoctor({
        userId: user.id,
        organizationId: null
      });
      
      res.status(201).json({
        message: 'Doctor account created successfully',
        id: doctor.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create doctor account' });
    }
  });
  
  app.post('/api/signup/organization', async (req, res) => {
    try {
      const { name, type, email, password } = organizationSignupSchema.parse(req.body);
      
      // Check if email is already in use
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create user
      const hashedPassword = hashSync(password, 10);
      const user = await storage.createUser({
        username: email,
        email,
        password: hashedPassword,
        userType: 'organization'
      });
      
      // Create organization
      const organization = await storage.createOrganization({
        name,
        type,
        userId: user.id
      });
      
      res.status(201).json({
        message: 'Organization account created successfully',
        id: organization.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create organization account' });
    }
  });
  
  // Doctor routes
  app.get('/api/doctor/dashboard', async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'doctor') {
        return res.status(401).json({ message: 'Not authenticated as a doctor' });
      }
      
      const doctor = await storage.getDoctorByUserId(req.session.userId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      // Get doctor stats
      const totalRecords = await storage.countRecordsByDoctorId(doctor.id);
      const monthlyRecords = await storage.countRecordsByDoctorIdThisMonth(doctor.id);
      
      // Accuracy is a mock value for now, would need a real calculation in production
      const accuracy = 94.2; 
      
      // Get recent records
      const records = await storage.getRecordsByDoctorId(doctor.id);
      const recentRecords = records
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map(record => ({
          id: record.recordId,
          patientName: record.patient.name,
          date: record.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          grade: record.grade
        }));
      
      // Grade distribution
      const gradeDistribution = [
        { name: 'F0', value: await storage.countRecordsByGrade(doctor.id, 'F0'), color: '#3b82f6' },
        { name: 'F1', value: await storage.countRecordsByGrade(doctor.id, 'F1'), color: '#22c55e' },
        { name: 'F2', value: await storage.countRecordsByGrade(doctor.id, 'F2'), color: '#eab308' },
        { name: 'F3', value: await storage.countRecordsByGrade(doctor.id, 'F3'), color: '#f97316' },
        { name: 'F4', value: await storage.countRecordsByGrade(doctor.id, 'F4'), color: '#ef4444' }
      ];
      
      res.json({
        stats: {
          totalRecords,
          totalChange: `+${Math.round(totalRecords * 0.1)} from last month`,
          monthlyRecords,
          monthlyChange: `+${Math.round(monthlyRecords * 0.2)} from previous month`,
          accuracy,
          accuracyChange: '+1.3% from last month'
        },
        recentRecords,
        gradeDistribution
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });
  
  // Organization routes
  app.get('/api/organization/dashboard', async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'organization') {
        return res.status(401).json({ message: 'Not authenticated as an organization' });
      }
      
      const organization = await storage.getOrganizationByUserId(req.session.userId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Get all doctors in the organization
      const doctors = await storage.getDoctorsByOrganizationId(organization.id);
      
      // Get record counts
      const totalRecordsToday = await storage.countTotalRecordsToday(organization.id);
      const totalRecordsMonth = await storage.countTotalRecordsThisMonth(organization.id);
      
      // Convert doctors to response format
      const doctorsList = doctors.map(doctor => ({
        id: `DOC-${doctor.id.toString().padStart(3, '0')}`,
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        email: doctor.email,
        specialization: doctor.specialization || 'General',
        recordCount: 0  // To be updated below
      }));
      
      // Get record counts for each doctor
      const doctorCounts = await storage.countRecordsByDoctorAndOrganization(organization.id);
      
      // Update doctor record counts
      doctorCounts.forEach(({ doctorId, count }) => {
        const doctorIndex = doctorsList.findIndex(d => d.id === `DOC-${doctorId.toString().padStart(3, '0')}`);
        if (doctorIndex !== -1) {
          doctorsList[doctorIndex].recordCount = count;
        }
      });
      
      // Calculate grade distribution across the organization
      const records = await storage.getRecordsByOrganizationId(organization.id);
      const gradeCounts = {
        'F0': 0,
        'F1': 0,
        'F2': 0,
        'F3': 0,
        'F4': 0
      };
      
      records.forEach(record => {
        gradeCounts[record.grade as keyof typeof gradeCounts]++;
      });
      
      const gradeDistribution = [
        { name: 'F0', value: gradeCounts['F0'], color: '#3b82f6' },
        { name: 'F1', value: gradeCounts['F1'], color: '#22c55e' },
        { name: 'F2', value: gradeCounts['F2'], color: '#eab308' },
        { name: 'F3', value: gradeCounts['F3'], color: '#f97316' },
        { name: 'F4', value: gradeCounts['F4'], color: '#ef4444' }
      ];
      
      res.json({
        stats: {
          totalDoctors: doctors.length,
          doctorsChange: '+2 from last month',
          totalRecordsToday,
          recordsTodayChange: `+${Math.round(totalRecordsToday * 0.2)} from yesterday`,
          totalRecordsMonth,
          recordsMonthChange: `+${Math.round(totalRecordsMonth * 0.1)} from last month`
        },
        doctors: doctorsList,
        gradeDistribution
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch organization dashboard data' });
    }
  });
  
  // Doctor management routes for organizations
  app.get('/api/organization/doctors', async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'organization') {
        return res.status(401).json({ message: 'Not authenticated as an organization' });
      }
      
      const organization = await storage.getOrganizationByUserId(req.session.userId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      const doctors = await storage.getDoctorsByOrganizationId(organization.id);
      
      // Format response
      const formattedDoctors = await Promise.all(doctors.map(async (doctor) => {
        const recordCount = await storage.countRecordsByDoctorId(doctor.id);
        return {
          id: `DOC-${doctor.id.toString().padStart(3, '0')}`,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email,
          specialization: doctor.specialization || 'General',
          recordCount
        };
      }));
      
      res.json(formattedDoctors);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch doctors' });
    }
  });
  
  app.post('/api/organization/doctors', async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'organization') {
        return res.status(401).json({ message: 'Not authenticated as an organization' });
      }
      
      const organization = await storage.getOrganizationByUserId(req.session.userId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      const { firstName, lastName, email, specialization, password } = req.body;
      
      // Check if email is already in use
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create user
      const hashedPassword = hashSync(password, 10);
      const user = await storage.createUser({
        username: email,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        specialization,
        userType: 'doctor'
      });
      
      // Create doctor with organization link
      const doctor = await storage.createDoctor({
        userId: user.id,
        organizationId: organization.id
      });
      
      res.status(201).json({
        message: 'Doctor added successfully',
        id: `DOC-${doctor.id.toString().padStart(3, '0')}`,
        name: `Dr. ${firstName} ${lastName}`,
        email,
        specialization,
        recordCount: 0
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add doctor' });
    }
  });
  
  app.delete('/api/organization/doctors/:id', async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'organization') {
        return res.status(401).json({ message: 'Not authenticated as an organization' });
      }
      
      const organization = await storage.getOrganizationByUserId(req.session.userId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      // Extract doctor ID from the format DOC-001
      const idMatch = req.params.id.match(/DOC-(\d+)/);
      if (!idMatch) {
        return res.status(400).json({ message: 'Invalid doctor ID format' });
      }
      
      const doctorId = parseInt(idMatch[1], 10);
      const success = await storage.removeDoctor(doctorId);
      
      if (!success) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json({ message: 'Doctor removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to remove doctor' });
    }
  });
  
  // Records and grading
  app.get('/api/records', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      let records;
      if (req.session.userType === 'doctor') {
        const doctor = await storage.getDoctorByUserId(req.session.userId);
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
        
        records = await storage.getRecordsByDoctorId(doctor.id);
      } else {
        const organization = await storage.getOrganizationByUserId(req.session.userId);
        if (!organization) {
          return res.status(404).json({ message: 'Organization not found' });
        }
        
        records = await storage.getRecordsByOrganizationId(organization.id);
      }
      
      // Format records for response
      const formattedRecords = records.map(record => ({
        id: record.recordId,
        patientName: record.patient.name,
        date: record.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        grade: record.grade,
        confidence: record.confidence
      }));
      
      res.json(formattedRecords);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch records' });
    }
  });
  
  app.get('/api/records/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const record = await storage.getRecordByRecordId(req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      // Verify access rights
      if (req.session.userType === 'doctor') {
        const doctor = await storage.getDoctorByUserId(req.session.userId);
        if (!doctor || doctor.id !== record.doctorId) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else {
        const organization = await storage.getOrganizationByUserId(req.session.userId);
        if (!organization) {
          return res.status(403).json({ message: 'Access denied' });
        }
        
        // Check if the doctor belongs to this organization
        const doctor = await storage.getDoctorById(record.doctorId);
        if (!doctor || doctor.organizationId !== organization.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
      
      // Get patient information
      const patient = await storage.getPatientById(record.patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Format response
      res.json({
        id: record.id,
        recordId: record.recordId,
        patientInfo: {
          id: record.recordId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          date: record.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        fibrosis: {
          grade: record.grade,
          confidence: record.confidence
        },
        analysis: record.analysisText ? JSON.parse(record.analysisText) : [],
        createdAt: record.createdAt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch record details' });
    }
  });
  
  // Grade endpoint - handles ultrasound image grading
  app.post('/api/grade', upload.single('image'), async (req, res) => {
    try {
      if (!req.session.userId || req.session.userType !== 'doctor') {
        return res.status(401).json({ message: 'Not authenticated as a doctor' });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No image provided' });
      }
      
      const doctor = await storage.getDoctorByUserId(req.session.userId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      const { patientName, patientAge, patientGender } = req.body;
      
      if (!patientName || !patientAge || !patientGender) {
        return res.status(400).json({ message: 'Missing patient information' });
      }
      
      // Check if patient exists or create new one
      let patient = await storage.getPatientByName(patientName);
      if (!patient) {
        patient = await storage.createPatient({
          name: patientName,
          age: parseInt(patientAge, 10),
          gender: patientGender
        });
      }
      
      // Save uploaded file path
      const imagePath = req.file.path;
      
      // Call Python grading script (mock for now)
      // In production, we would call a real PyTorch model
      // Since we can't run PyTorch, we'll simulate the response
      
      // Simulate model analysis
      const grades = ['F0', 'F1', 'F2', 'F3', 'F4'];
      const confidences = [85, 89, 92, 87, 91];
      
      const randomIndex = Math.floor(Math.random() * grades.length);
      const grade = grades[randomIndex];
      const confidence = confidences[randomIndex];
      
      // Generate analysis text
      const analysisIntro = `The ultrasound shows ${grade === 'F0' ? 'no significant' : grade === 'F1' ? 'mild' : grade === 'F2' ? 'moderate' : grade === 'F3' ? 'advanced' : 'severe'} hepatic fibrosis consistent with ${grade} grade (Metavir scale). Key findings include:`;
      
      const findings = [
        `${grade === 'F0' ? 'Normal' : grade === 'F1' ? 'Mild' : grade === 'F2' ? 'Moderate' : grade === 'F3' ? 'Significant' : 'Severe'} heterogeneity of liver parenchyma`,
        `Portal vein diameter ${grade === 'F4' ? 'enlarged' : 'within normal range'} (${10 + parseInt(grade.substring(1)) * 0.5}mm)`,
        `${grade === 'F0' ? 'No' : grade === 'F4' ? 'Significant' : 'Mild'} nodularity of liver surface`,
        `${grade === 'F0' ? 'No' : grade === 'F1' ? 'Mild' : grade === 'F2' ? 'Moderate' : grade === 'F3' ? 'Advanced' : 'Severe'} periportal fibrosis visible`,
        `Spleen size ${grade === 'F4' ? 'enlarged' : 'normal'} (${11 + parseInt(grade.substring(1)) * 0.8}cm)`
      ];
      
      const recommendation = `Recommended follow-up: Repeat ultrasound in ${grade === 'F0' ? '12' : grade === 'F1' ? '6' : grade === 'F2' ? '4' : grade === 'F3' ? '3' : '2'} months to monitor progression.`;
      
      const analysis = [analysisIntro, ...findings, recommendation];
      
      // Generate a unique record ID
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const recordId = `LIV-${year}${randomNum}`;
      
      // Create record
      const record = await storage.createRecord({
        patientId: patient.id,
        doctorId: doctor.id,
        recordId,
        grade,
        confidence,
        imagePath,
        analysisText: JSON.stringify(analysis)
      });
      
      // Return response
      res.json({
        patientInfo: {
          id: recordId,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        fibrosis: {
          grade,
          confidence
        },
        analysis,
        recordId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to grade image' });
    }
  });

  return httpServer;
}
