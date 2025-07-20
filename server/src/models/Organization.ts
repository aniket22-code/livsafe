import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  email: string;
  createdAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IOrganization>('Organization', organizationSchema);
