import mongoose from 'mongoose';
import Doctor from './src/models/Doctor.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the specific doctor
    const doctor = await Doctor.findOne({ email: 'sarah.johnson@citygeneral.com' }).select('+password');
    
    if (doctor) {
      console.log('✅ Doctor found:');
      console.log('- ID:', doctor._id);
      console.log('- Email:', doctor.email);
      console.log('- Full Name:', doctor.fullName);
      console.log('- Specialty:', doctor.specialty);
      console.log('- Password Hash:', doctor.password ? 'Present' : 'Missing');
      
      // Test password comparison
      const isPasswordCorrect = await doctor.comparePassword('doctor123');
      console.log('- Password Test:', isPasswordCorrect ? '✅ CORRECT' : '❌ WRONG');
      
    } else {
      console.log('❌ Doctor not found in database');
    }
    
    // List all doctors
    const allDoctors = await Doctor.find().select('email fullName');
    console.log('\n📋 All doctors in database:');
    allDoctors.forEach(doc => {
      console.log(`- ${doc.email} (${doc.fullName})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

verifyData();
