import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  fullName: string;
  gender?: string;
  age?: number;
  doctors: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const patientSchema = new Schema<IPatient>({
  fullName: {
    type: String,
    required: [true, 'Patient full name is required'],
    trim: true,
    maxlength: [100, 'Patient name cannot exceed 100 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150 years']
  },
  doctors: [{
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IPatient>('Patient', patientSchema);
