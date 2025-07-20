import express from 'express';
import {
  getDashboard,
  getAllDoctors,
  getDoctorProfile,
  assignPatientToDoctor,
  getRecords,
  getRecord
} from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/doctor/dashboard
// @desc    Get doctor dashboard data
// @access  Private
router.get('/dashboard', protect, getDashboard);

// @route   GET /api/doctor/all
// @desc    Get all doctors
// @access  Private
router.get('/all', protect, getAllDoctors);

// @route   GET /api/doctor/profile/:id
// @desc    Get doctor profile
// @access  Private
router.get('/profile/:id', protect, getDoctorProfile);

// @route   PUT /api/doctor/assign-patient
// @desc    Assign patient to doctor
// @access  Private
router.put('/assign-patient', protect, assignPatientToDoctor);

// @route   GET /api/doctor/records
// @desc    Get all medical records for a doctor
// @access  Private
router.get('/records', protect, getRecords);

// @route   GET /api/doctor/records/:id
// @desc    Get single medical record
// @access  Private
router.get('/records/:id', protect, getRecord);

export default router;
