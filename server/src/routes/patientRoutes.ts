import express from 'express';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientsByDoctor,
  searchPatients
} from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/patients/search
// @desc    Search patients
// @access  Private
router.get('/search', protect, searchPatients);

// @route   GET /api/patients/doctor/:doctorId
// @desc    Get patients assigned to a specific doctor
// @access  Private
router.get('/doctor/:doctorId', protect, getPatientsByDoctor);

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private
router.get('/', protect, getPatients);

// @route   GET /api/patients/:id
// @desc    Get single patient
// @access  Private
router.get('/:id', protect, getPatient);

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private
router.post('/', protect, createPatient);

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', protect, updatePatient);

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private
router.delete('/:id', protect, deletePatient);

export default router;
