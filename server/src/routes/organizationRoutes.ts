import express from 'express';
import {
  getDashboard,
  getAllOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getDoctorsInOrganization,
  addDoctorToOrganization,
  removeDoctorFromOrganization
} from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/organization/dashboard
// @desc    Get organization dashboard data
// @access  Private
router.get('/dashboard', protect, getDashboard);

// @route   GET /api/organization/all
// @desc    Get all organizations
// @access  Private
router.get('/all', protect, getAllOrganizations);

// @route   GET /api/organization/:id/doctors
// @desc    Get doctors in organization
// @access  Private
router.get('/:id/doctors', protect, getDoctorsInOrganization);

// @route   POST /api/organization/:id/doctors
// @desc    Add doctor to organization
// @access  Private
router.post('/:id/doctors', protect, addDoctorToOrganization);

// @route   DELETE /api/organization/:id/doctors/:doctorId
// @desc    Remove doctor from organization
// @access  Private
router.delete('/:id/doctors/:doctorId', protect, removeDoctorFromOrganization);

// @route   GET /api/organization/:id
// @desc    Get single organization
// @access  Private
router.get('/:id', protect, getOrganization);

// @route   POST /api/organization
// @desc    Create new organization
// @access  Private
router.post('/', protect, createOrganization);

// @route   PUT /api/organization/:id
// @desc    Update organization
// @access  Private
router.put('/:id', protect, updateOrganization);

// @route   DELETE /api/organization/:id
// @desc    Delete organization
// @access  Private
router.delete('/:id', protect, deleteOrganization);

export default router;
