import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalImage extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  imageUrl: string;
  description?: string;
  uploadedAt: Date;
  grade?: string;
  confidence?: number;
}

const medicalImageSchema = new Schema<IMedicalImage>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  grade: {
    type: String,
    enum: ['F0', 'F1', 'F2', 'F3', 'F4'],
    trim: true
  },
  confidence: {
    type: Number,
    min: [0, 'Confidence cannot be negative'],
    max: [100, 'Confidence cannot exceed 100%']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IMedicalImage>('MedicalImage', medicalImageSchema);
