import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Organization from '../models/Organization.js';
import Doctor from '../models/Doctor.js';
import MedicalImage from '../models/MedicalImage.js';

// @desc    Get organization dashboard data
// @route   GET /api/organization/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Get all organizations for demo (in real app, you'd filter by user's org)
    const organizations = await Organization.find();
    
    // Get total doctors
    const totalDoctors = await Doctor.countDocuments();

    // Get today's records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalRecordsToday = await MedicalImage.countDocuments({
      uploadedAt: { $gte: today, $lt: tomorrow }
    });

    // Get this month's records
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalRecordsMonth = await MedicalImage.countDocuments({
      uploadedAt: { $gte: startOfMonth }
    });

    // Get doctors with their patient counts
    const doctors = await Doctor.find()
      .select('fullName specialty patients createdAt')
      .populate('patients', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format doctors data
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      fullName: doctor.fullName,
      specialty: doctor.specialty || 'General',
      patientCount: doctor.patients.length,
      joinedDate: new Date(doctor.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDoctors,
          doctorsChange: '+1 from last month', // This would be calculated
          totalRecordsToday,
          recordsTodayChange: '+2 from yesterday', // This would be calculated
          totalRecordsMonth,
          recordsMonthChange: '+5 from last month' // This would be calculated
        },
        doctors: formattedDoctors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organization dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get all organizations
// @route   GET /api/organization/all
// @access  Private
export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organizations',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get single organization
// @route   GET /api/organization/:id
// @access  Private
export const getOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Get doctors in this organization
    const doctors = await Doctor.find({ organization: id })
      .select('-password')
      .populate('patients', 'fullName');

    res.status(200).json({
      success: true,
      data: {
        organization,
        doctors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Create new organization
// @route   POST /api/organization
// @access  Private
export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Organization name and email are required'
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
      message: 'Organization created successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organization/:id
// @access  Private
export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if email is already taken by another organization
    if (email && email !== organization.email) {
      const existingOrg = await Organization.findOne({ email });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another organization'
        });
      }
    }

    // Update fields
    if (name !== undefined) organization.name = name;
    if (email !== undefined) organization.email = email;

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organization/:id
// @access  Private
export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Set all doctors in this organization to independent (organization: null)
    await Doctor.updateMany(
      { organization: id },
      { organization: null }
    );

    // Delete organization
    await Organization.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get doctors in organization
// @route   GET /api/organization/:id/doctors
// @access  Private
export const getDoctorsInOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const doctors = await Doctor.find({ organization: id })
      .select('-password')
      .populate('patients', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting doctors in organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Add doctor to organization
// @route   POST /api/organization/:id/doctors
// @access  Private
export const addDoctorToOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, specialty } = req.body;

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
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

    // Create doctor with organization
    const doctor = await Doctor.create({
      fullName,
      email,
      password,
      specialty,
      organization: id
    });

    // Return doctor without password
    const doctorResponse = await Doctor.findById(doctor._id)
      .select('-password')
      .populate('organization', 'name');

    res.status(201).json({
      success: true,
      message: 'Doctor added to organization successfully',
      data: doctorResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding doctor to organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Remove doctor from organization
// @route   DELETE /api/organization/:id/doctors/:doctorId
// @access  Private
export const removeDoctorFromOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id, doctorId } = req.params;

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Verify doctor exists and belongs to this organization
    const doctor = await Doctor.findOne({ _id: doctorId, organization: id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in this organization'
      });
    }

    // Set doctor as independent (remove organization)
    doctor.organization = null;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor removed from organization successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error removing doctor from organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
