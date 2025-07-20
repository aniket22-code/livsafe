import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Organization from '../models/Organization.js';
import MedicalImage from '../models/MedicalImage.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Organization.deleteMany({});
    await MedicalImage.deleteMany({});
    console.log('Cleared existing data');

    // Create sample organization
    const organization = await Organization.create({
      name: 'City General Hospital',
      email: 'admin@citygeneral.com'
    });

    // Create sample doctors
    const doctors = await Doctor.create([
      {
        fullName: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@citygeneral.com',
        password: 'doctor123',
        specialty: 'Hepatology',
        organization: organization._id
      },
      {
        fullName: 'Dr. Michael Chen',
        email: 'michael.chen@citygeneral.com',
        password: 'doctor123',
        specialty: 'Radiology',
        organization: organization._id
      },
      {
        fullName: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@gmail.com',
        password: 'doctor123',
        specialty: 'Internal Medicine',
        organization: null // Independent doctor
      }
    ]);

    // Create sample patients
    const patients = await Patient.create([
      {
        fullName: 'John Doe',
        age: 45,
        gender: 'male',
        doctors: [doctors[0]._id, doctors[1]._id]
      },
      {
        fullName: 'Jane Smith',
        age: 32,
        gender: 'female',
        doctors: [doctors[0]._id]
      },
      {
        fullName: 'Robert Wilson',
        age: 58,
        gender: 'male',
        doctors: [doctors[1]._id, doctors[2]._id]
      },
      {
        fullName: 'Maria Garcia',
        age: 41,
        gender: 'female',
        doctors: [doctors[2]._id]
      }
    ]);

    // Update doctors with patient references
    await Doctor.findByIdAndUpdate(doctors[0]._id, { patients: [patients[0]._id, patients[1]._id] });
    await Doctor.findByIdAndUpdate(doctors[1]._id, { patients: [patients[0]._id, patients[2]._id] });
    await Doctor.findByIdAndUpdate(doctors[2]._id, { patients: [patients[2]._id, patients[3]._id] });

    // Create sample medical images (mock data)
    await MedicalImage.create([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        imageUrl: './uploads/medical-images/sample-liver-scan-1.jpg',
        description: 'Liver fibrosis assessment scan',
        grade: 'F2',
        confidence: 87,
        uploadedAt: new Date(2024, 0, 15) // January 15, 2024
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        imageUrl: './uploads/medical-images/sample-liver-scan-2.jpg',
        description: 'Follow-up liver examination',
        grade: 'F1',
        confidence: 92,
        uploadedAt: new Date(2024, 0, 20) // January 20, 2024
      },
      {
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        imageUrl: './uploads/medical-images/sample-liver-scan-3.jpg',
        description: 'Initial liver assessment',
        grade: 'F3',
        confidence: 78,
        uploadedAt: new Date(2024, 0, 25) // January 25, 2024
      }
    ]);

    console.log('✅ Sample data created successfully!');
    console.log('\n📊 Created:');
    console.log(`- ${1} Organization`);
    console.log(`- ${doctors.length} Doctors`);
    console.log(`- ${patients.length} Patients`);
    console.log(`- ${3} Medical Image Records`);

    console.log('\n🔐 Sample Doctor Credentials:');
    console.log('Email: sarah.johnson@citygeneral.com, Password: doctor123');
    console.log('Email: michael.chen@citygeneral.com, Password: doctor123');
    console.log('Email: emily.rodriguez@gmail.com, Password: doctor123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Organization.deleteMany({});
    await MedicalImage.deleteMany({});

    console.log('✅ All data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
