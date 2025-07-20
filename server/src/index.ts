import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import medicalImageRoutes from './routes/medicalImageRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL || 'http://localhost:3000']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware (for serving uploaded images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/medical-images', medicalImageRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Medical Assistant API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      doctor: '/api/doctor',
      patients: '/api/patients',
      organization: '/api/organization',
      medicalImages: '/api/medical-images',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Unhandled Promise rejection');
  process.exit(1);
});

export default app;
