import { Request, Response } from 'express';
import Doctor from '../models/Doctor.js';
import Organization from '../models/Organization.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';

// @desc    Login doctor
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if doctor exists and include password
    const doctor = await Doctor.findOne({ email }).select('+password').populate('organization', 'name');

    if (!doctor || !(await doctor.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(doctor._id!.toString());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        organization: doctor.organization,
        type: 'doctor'
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Register new doctor
// @route   POST /api/auth/signup/doctor
// @access  Public
export const signupDoctor = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, specialty, organizationId } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, and password'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with this email'
      });
    }

    // Validate organization if provided
    let organization = null;
    if (organizationId) {
      organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organization ID'
        });
      }
    }

    // Create doctor
    const doctor = await Doctor.create({
      fullName,
      email,
      password,
      specialty,
      organization: organizationId || null
    });

    // Generate token
    const token = generateToken(doctor._id!.toString());

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: {
        id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        organization: organization,
        type: 'doctor'
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during doctor registration',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Register new organization
// @route   POST /api/auth/signup/organization
// @access  Public
export const signupOrganization = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization name and email'
      });
    }

    // Check if organization already exists
    const existingOrganization = await Organization.findOne({ email });
    if (existingOrganization) {
      return res.status(400).json({
        success: false,
        message: 'Organization already exists with this email'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Organization account created successfully',
      data: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        createdAt: organization.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during organization registration',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const doctor = req.doctor;
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        organization: doctor.organization,
        type: 'doctor'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting user info',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Logout doctor (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
