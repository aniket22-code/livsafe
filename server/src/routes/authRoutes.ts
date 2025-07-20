import express from 'express';
import { login, signupDoctor, signupOrganization, logout, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login doctor
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/signup/doctor
// @desc    Register new doctor
// @access  Public
router.post('/signup/doctor', signupDoctor);

// @route   POST /api/auth/signup/organization
// @desc    Register new organization
// @access  Public
router.post('/signup/organization', signupOrganization);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout doctor
// @access  Private
router.post('/logout', protect, logout);

export default router;
