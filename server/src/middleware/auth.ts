import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

export interface AuthRequest extends Request {
  doctor?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      // Get doctor from database
      const doctor = await Doctor.findById(decoded.id).select('-password');
      
      if (!doctor) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, doctor not found'
        });
      }

      req.doctor = doctor;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};
