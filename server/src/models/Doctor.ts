import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDoctor extends Document {
  fullName: string;
  email: string;
  password: string;
  specialty?: string;
  organization?: mongoose.Types.ObjectId | null;
  patients: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const doctorSchema = new Schema<IDoctor>({
  fullName: {
    type: String,
    required: [true, 'Doctor full name is required'],
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password by default in queries
  },
  specialty: {
    type: String,
    trim: true,
    maxlength: [50, 'Specialty cannot exceed 50 characters']
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  patients: [{
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IDoctor>('Doctor', doctorSchema);
