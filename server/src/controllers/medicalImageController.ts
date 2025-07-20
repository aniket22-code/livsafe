import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import MedicalImage from '../models/MedicalImage.js';
import Patient from '../models/Patient.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/medical-images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `medical-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// @desc    Upload and create medical record
// @route   POST /api/medical-images/upload
// @access  Private
export const createRecord = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const { patientName, patientAge, patientGender, description } = req.body;
    const doctorId = req.doctor._id;

    // Validate required fields
    if (!patientName) {
      return res.status(400).json({
        success: false,
        message: 'Patient name is required'
      });
    }

    // Find or create patient
    let patient = await Patient.findOne({ fullName: patientName });
    
    if (!patient) {
      patient = await Patient.create({
        fullName: patientName,
        age: patientAge ? parseInt(patientAge) : undefined,
        gender: patientGender?.toLowerCase(),
        doctors: [doctorId]
      });

      // Add patient to doctor's patients array
      await req.doctor.updateOne({ $push: { patients: patient._id } });
    } else {
      // Add doctor to patient's doctors array if not already there
      if (!patient.doctors.includes(doctorId)) {
        patient.doctors.push(doctorId);
        await patient.save();
      }

      // Add patient to doctor's patients array if not already there
      if (!req.doctor.patients.includes(patient._id)) {
        await req.doctor.updateOne({ $push: { patients: patient._id } });
      }
    }

    // Generate mock analysis results (in real app, this would call your AI model)
    const grades = ['F0', 'F1', 'F2', 'F3', 'F4'];
    const mockGrade = grades[Math.floor(Math.random() * grades.length)];
    const mockConfidence = Math.floor(80 + Math.random() * 20); // 80-100%

    // Create medical image record
    const medicalImage = await MedicalImage.create({
      patient: patient._id,
      doctor: doctorId,
      imageUrl: req.file.path,
      description,
      grade: mockGrade,
      confidence: mockConfidence
    });

    // Generate record ID (like LIV-202501)
    const recordId = `LIV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(medicalImage._id).slice(-3)}`;

    // Populate the response
    await medicalImage.populate([
      { path: 'patient', select: 'fullName age gender' },
      { path: 'doctor', select: 'fullName specialty' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: {
        id: recordId,
        medicalImage,
        analysis: {
          grade: mockGrade,
          confidence: mockConfidence,
          status: 'completed'
        }
      }
    });
  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating medical record',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get all medical images
// @route   GET /api/medical-images
// @access  Private
export const getMedicalImages = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, doctorId, patientId } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query: any = {};
    
    if (doctorId) {
      query.doctor = doctorId;
    }
    
    if (patientId) {
      query.patient = patientId;
    }

    const medicalImages = await MedicalImage.find(query)
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialty')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalImages = await MedicalImage.countDocuments(query);
    const totalPages = Math.ceil(totalImages / limitNum);

    res.status(200).json({
      success: true,
      data: medicalImages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalImages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting medical images',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get single medical image
// @route   GET /api/medical-images/:id
// @access  Private
export const getMedicalImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const medicalImage = await MedicalImage.findById(id)
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialty organization');

    if (!medicalImage) {
      return res.status(404).json({
        success: false,
        message: 'Medical image not found'
      });
    }

    res.status(200).json({
      success: true,
      data: medicalImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting medical image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Update medical image
// @route   PUT /api/medical-images/:id
// @access  Private
export const updateMedicalImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, grade, confidence } = req.body;

    const medicalImage = await MedicalImage.findById(id);

    if (!medicalImage) {
      return res.status(404).json({
        success: false,
        message: 'Medical image not found'
      });
    }

    // Check if the current user is the doctor who created this record
    if (medicalImage.doctor.toString() !== req.doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }

    // Update fields
    if (description !== undefined) medicalImage.description = description;
    if (grade !== undefined) medicalImage.grade = grade;
    if (confidence !== undefined) medicalImage.confidence = confidence;

    await medicalImage.save();

    // Populate for response
    await medicalImage.populate([
      { path: 'patient', select: 'fullName age gender' },
      { path: 'doctor', select: 'fullName specialty' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Medical image updated successfully',
      data: medicalImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating medical image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Delete medical image
// @route   DELETE /api/medical-images/:id
// @access  Private
export const deleteMedicalImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const medicalImage = await MedicalImage.findById(id);

    if (!medicalImage) {
      return res.status(404).json({
        success: false,
        message: 'Medical image not found'
      });
    }

    // Check if the current user is the doctor who created this record
    if (medicalImage.doctor.toString() !== req.doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this record'
      });
    }

    // Delete image file from disk
    if (fs.existsSync(medicalImage.imageUrl)) {
      fs.unlinkSync(medicalImage.imageUrl);
    }

    // Delete record from database
    await MedicalImage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Medical image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting medical image',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Serve image files
// @route   GET /api/medical-images/file/:filename
// @access  Private
export const serveImageFile = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(process.cwd(), 'uploads', 'medical-images', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }

    // Send file
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error serving image file',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
