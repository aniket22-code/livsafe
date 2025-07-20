import express from 'express';
import {
  createRecord,
  getMedicalImages,
  getMedicalImage,
  updateMedicalImage,
  deleteMedicalImage,
  serveImageFile,
  upload
} from '../controllers/medicalImageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/medical-images/file/:filename
// @desc    Serve image files
// @access  Private
router.get('/file/:filename', protect, serveImageFile);

// @route   POST /api/medical-images/upload
// @desc    Upload and create medical record
// @access  Private
router.post('/upload', protect, upload.single('image'), createRecord);

// @route   GET /api/medical-images
// @desc    Get all medical images
// @access  Private
router.get('/', protect, getMedicalImages);

// @route   GET /api/medical-images/:id
// @desc    Get single medical image
// @access  Private
router.get('/:id', protect, getMedicalImage);

// @route   PUT /api/medical-images/:id
// @desc    Update medical image
// @access  Private
router.put('/:id', protect, updateMedicalImage);

// @route   DELETE /api/medical-images/:id
// @desc    Delete medical image
// @access  Private
router.delete('/:id', protect, deleteMedicalImage);

export default router;
