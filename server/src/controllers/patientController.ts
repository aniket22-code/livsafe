import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import MedicalImage from '../models/MedicalImage.js';
import mongoose from 'mongoose';

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    const searchQuery = search 
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { gender: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const patients = await Patient.find(searchQuery)
      .populate('doctors', 'fullName specialty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPatients = await Patient.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalPatients / limitNum);

    res.status(200).json({
      success: true,
      data: patients,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPatients,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting patients',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate('doctors', 'fullName specialty organization');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get medical images for this patient
    const medicalImages = await MedicalImage.find({ patient: id })
      .populate('doctor', 'fullName specialty')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient,
        medicalImages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting patient',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, gender, age } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Patient full name is required'
      });
    }

    // Create patient
    const patient = await Patient.create({
      fullName,
      gender: gender?.toLowerCase(),
      age: age ? parseInt(age) : undefined,
      doctors: [] // Will be populated when assigning doctors
    });

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating patient',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, gender, age } = req.body;

    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update fields
    if (fullName !== undefined) patient.fullName = fullName;
    if (gender !== undefined) patient.gender = gender.toLowerCase();
    if (age !== undefined) patient.age = parseInt(age);

    await patient.save();

    // Populate doctors for response
    await patient.populate('doctors', 'fullName specialty');

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating patient',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Remove patient from all doctors' patient lists
    await Doctor.updateMany(
      { patients: id },
      { $pull: { patients: id } }
    );

    // Delete all medical images associated with this patient
    await MedicalImage.deleteMany({ patient: id });

    // Delete patient
    await Patient.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting patient',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get patients assigned to a specific doctor
// @route   GET /api/patients/doctor/:doctorId
// @access  Private
export const getPatientsByDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const patients = await Patient.find({ doctors: doctorId })
      .populate('doctors', 'fullName specialty')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting patients by doctor',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
export const searchPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { q, age, gender } = req.query;

    let searchQuery: any = {};

    // Text search
    if (q) {
      searchQuery.$or = [
        { fullName: { $regex: q, $options: 'i' } }
      ];
    }

    // Age filter
    if (age) {
      const ageNum = parseInt(age as string);
      if (!isNaN(ageNum)) {
        searchQuery.age = ageNum;
      }
    }

    // Gender filter
    if (gender) {
      searchQuery.gender = (gender as string).toLowerCase();
    }

    const patients = await Patient.find(searchQuery)
      .populate('doctors', 'fullName specialty')
      .sort({ fullName: 1 })
      .limit(50); // Limit search results

    res.status(200).json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error searching patients',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
