import { users, doctors, organizations, patients, records } from "@shared/schema";
import type { 
  User, InsertUser, 
  Doctor, InsertDoctor, 
  Organization, InsertOrganization,
  Patient, InsertPatient,
  Record, InsertRecord
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Doctor methods
  getDoctorByUserId(userId: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  getDoctorByEmail(email: string): Promise<(Doctor & User) | undefined>;
  getDoctorsByOrganizationId(organizationId: number): Promise<(Doctor & User)[]>;
  removeDoctor(id: number): Promise<boolean>;
  
  // Organization methods
  getOrganizationByUserId(userId: number): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganizationById(id: number): Promise<Organization | undefined>;
  
  // Patient methods
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByName(name: string): Promise<Patient | undefined>;
  
  // Record methods
  createRecord(record: InsertRecord): Promise<Record>;
  getRecordById(id: number): Promise<Record | undefined>;
  getRecordByRecordId(recordId: string): Promise<Record | undefined>;
  getRecordsByDoctorId(doctorId: number): Promise<(Record & { patient: Patient })[]>;
  getRecordsByOrganizationId(organizationId: number): Promise<(Record & { patient: Patient, doctor: Doctor & User })[]>;
  countRecordsByDoctorId(doctorId: number): Promise<number>;
  countRecordsByDoctorIdThisMonth(doctorId: number): Promise<number>;
  countRecordsByGrade(doctorId: number, grade: string): Promise<number>;
  countRecordsByDoctorAndOrganization(organizationId: number): Promise<{ doctorId: number, count: number }[]>;
  countTotalRecordsToday(organizationId: number): Promise<number>;
  countTotalRecordsThisMonth(organizationId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctors: Map<number, Doctor>;
  private organizations: Map<number, Organization>;
  private patients: Map<number, Patient>;
  private records: Map<number, Record>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.organizations = new Map();
    this.patients = new Map();
    this.records = new Map();
    this.currentId = {
      users: 1,
      doctors: 1,
      organizations: 1,
      patients: 1,
      records: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Doctor methods
  async getDoctorByUserId(userId: number): Promise<Doctor | undefined> {
    return Array.from(this.doctors.values()).find(doctor => doctor.userId === userId);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentId.doctors++;
    const doctor: Doctor = { ...insertDoctor, id, createdAt: new Date() };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorByEmail(email: string): Promise<(Doctor & User) | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user || user.userType !== 'doctor') return undefined;
    
    const doctor = await this.getDoctorByUserId(user.id);
    if (!doctor) return undefined;

    return { ...doctor, ...user };
  }

  async getDoctorsByOrganizationId(organizationId: number): Promise<(Doctor & User)[]> {
    const doctorsInOrg = Array.from(this.doctors.values())
      .filter(doctor => doctor.organizationId === organizationId);
    
    const doctorsWithUserInfo = await Promise.all(
      doctorsInOrg.map(async (doctor) => {
        const user = await this.getUser(doctor.userId);
        if (!user) throw new Error(`User not found for doctor ${doctor.id}`);
        return { ...doctor, ...user };
      })
    );
    
    return doctorsWithUserInfo;
  }

  async removeDoctor(id: number): Promise<boolean> {
    const doctor = await this.getDoctorById(id);
    if (!doctor) return false;
    
    this.doctors.delete(id);
    return true;
  }

  // Organization methods
  async getOrganizationByUserId(userId: number): Promise<Organization | undefined> {
    return Array.from(this.organizations.values())
      .find(org => org.userId === userId);
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    const id = this.currentId.organizations++;
    const organization: Organization = { ...insertOrganization, id, createdAt: new Date() };
    this.organizations.set(id, organization);
    return organization;
  }

  async getOrganizationById(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  // Patient methods
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentId.patients++;
    const patient: Patient = { ...insertPatient, id, createdAt: new Date() };
    this.patients.set(id, patient);
    return patient;
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByName(name: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values())
      .find(patient => patient.name.toLowerCase() === name.toLowerCase());
  }

  // Record methods
  async createRecord(insertRecord: InsertRecord): Promise<Record> {
    const id = this.currentId.records++;
    let recordId = insertRecord.recordId || this.generateRecordId();
    const record: Record = { ...insertRecord, id, recordId, createdAt: new Date() };
    this.records.set(id, record);
    return record;
  }

  private generateRecordId(): string {
    const year = new Date().getFullYear();
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LIV-${year}${randomPart}`;
  }

  async getRecordById(id: number): Promise<Record | undefined> {
    return this.records.get(id);
  }

  async getRecordByRecordId(recordId: string): Promise<Record | undefined> {
    return Array.from(this.records.values())
      .find(record => record.recordId === recordId);
  }

  async getRecordsByDoctorId(doctorId: number): Promise<(Record & { patient: Patient })[]> {
    const doctorRecords = Array.from(this.records.values())
      .filter(record => record.doctorId === doctorId);
    
    const recordsWithPatients = await Promise.all(
      doctorRecords.map(async (record) => {
        const patient = await this.getPatientById(record.patientId);
        if (!patient) throw new Error(`Patient not found for record ${record.id}`);
        return { ...record, patient };
      })
    );
    
    return recordsWithPatients;
  }

  async getRecordsByOrganizationId(organizationId: number): Promise<(Record & { patient: Patient, doctor: Doctor & User })[]> {
    // First, get all doctors in the organization
    const doctorsInOrg = await this.getDoctorsByOrganizationId(organizationId);
    const doctorIds = doctorsInOrg.map(doctor => doctor.id);
    
    // Then, find all records from these doctors
    const orgRecords = Array.from(this.records.values())
      .filter(record => doctorIds.includes(record.doctorId));
    
    // Finally, combine with patient and doctor information
    const recordsWithDetails = await Promise.all(
      orgRecords.map(async (record) => {
        const patient = await this.getPatientById(record.patientId);
        if (!patient) throw new Error(`Patient not found for record ${record.id}`);
        
        const doctor = doctorsInOrg.find(doc => doc.id === record.doctorId);
        if (!doctor) throw new Error(`Doctor not found for record ${record.id}`);
        
        return { ...record, patient, doctor };
      })
    );
    
    return recordsWithDetails;
  }

  async countRecordsByDoctorId(doctorId: number): Promise<number> {
    return Array.from(this.records.values())
      .filter(record => record.doctorId === doctorId)
      .length;
  }

  async countRecordsByDoctorIdThisMonth(doctorId: number): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.records.values())
      .filter(record => 
        record.doctorId === doctorId && 
        record.createdAt >= firstDayOfMonth
      )
      .length;
  }

  async countRecordsByGrade(doctorId: number, grade: string): Promise<number> {
    return Array.from(this.records.values())
      .filter(record => 
        record.doctorId === doctorId && 
        record.grade === grade
      )
      .length;
  }

  async countRecordsByDoctorAndOrganization(organizationId: number): Promise<{ doctorId: number, count: number }[]> {
    // First, get all doctors in the organization
    const doctorsInOrg = await this.getDoctorsByOrganizationId(organizationId);
    const doctorIds = doctorsInOrg.map(doctor => doctor.id);
    
    // Count records for each doctor
    const counts = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const count = await this.countRecordsByDoctorId(doctorId);
        return { doctorId, count };
      })
    );
    
    return counts;
  }

  async countTotalRecordsToday(organizationId: number): Promise<number> {
    // First, get all doctors in the organization
    const doctorsInOrg = await this.getDoctorsByOrganizationId(organizationId);
    const doctorIds = doctorsInOrg.map(doctor => doctor.id);
    
    // Define today's date (start of day)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Count records created today
    return Array.from(this.records.values())
      .filter(record => 
        doctorIds.includes(record.doctorId) && 
        record.createdAt >= startOfDay
      )
      .length;
  }

  async countTotalRecordsThisMonth(organizationId: number): Promise<number> {
    // First, get all doctors in the organization
    const doctorsInOrg = await this.getDoctorsByOrganizationId(organizationId);
    const doctorIds = doctorsInOrg.map(doctor => doctor.id);
    
    // Define first day of the month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count records created this month
    return Array.from(this.records.values())
      .filter(record => 
        doctorIds.includes(record.doctorId) && 
        record.createdAt >= firstDayOfMonth
      )
      .length;
  }
}

export const storage = new MemStorage();
