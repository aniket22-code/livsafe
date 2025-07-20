# Medical Assistant Backend

A complete MERN stack backend for a hospital management system that manages organizations, doctors, patients, and medical images with AI-powered analysis.

## Features

- 🏥 **Organization Management**: Create and manage healthcare organizations
- 👨‍⚕️ **Doctor Management**: Doctor registration, authentication, and profile management
- 🏥 **Patient Management**: Full CRUD operations for patient records
- 🖼️ **Medical Image Processing**: Upload and analyze medical images with AI grading
- 🔐 **JWT Authentication**: Secure authentication system
- 📊 **Dashboard Analytics**: Real-time statistics and data visualization
- 🔍 **Advanced Search**: Search and filter patients, doctors, and records
- 📁 **File Management**: Secure image upload and storage

## Tech Stack

- **Node.js** with TypeScript
- **Express.js** - Web framework
- **MongoDB** with Mongoose - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd medical-assistant/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/medical_assistant
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_complex
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows with MongoDB installed
   mongod
   
   # Or using MongoDB Community Server
   # Start MongoDB service from Services
   ```

5. **Run the application**
   
   **Development mode:**
   ```bash
   npm run dev
   ```
   
   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Doctor login
- `POST /api/auth/signup/doctor` - Doctor registration
- `POST /api/auth/signup/organization` - Organization registration
- `POST /api/auth/logout` - Logout

### Doctor Management
- `GET /api/doctor/dashboard` - Get dashboard data
- `GET /api/doctor/all` - Get all doctors
- `GET /api/doctor/profile/:id` - Get doctor profile
- `PUT /api/doctor/assign-patient` - Assign patient to doctor
- `GET /api/doctor/records` - Get doctor's medical records
- `GET /api/doctor/records/:id` - Get single medical record

### Patient Management
- `GET /api/patients` - Get all patients (with pagination)
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/doctor/:doctorId` - Get patients by doctor
- `GET /api/patients/search` - Search patients

### Organization Management
- `GET /api/organization/dashboard` - Get organization dashboard
- `GET /api/organization/all` - Get all organizations
- `GET /api/organization/:id` - Get single organization
- `POST /api/organization` - Create new organization
- `PUT /api/organization/:id` - Update organization
- `DELETE /api/organization/:id` - Delete organization
- `GET /api/organization/:id/doctors` - Get doctors in organization
- `POST /api/organization/:id/doctors` - Add doctor to organization
- `DELETE /api/organization/:id/doctors/:doctorId` - Remove doctor from organization

### Medical Images
- `POST /api/medical-images/upload` - Upload and analyze medical image
- `GET /api/medical-images` - Get all medical images
- `GET /api/medical-images/:id` - Get single medical image
- `PUT /api/medical-images/:id` - Update medical image
- `DELETE /api/medical-images/:id` - Delete medical image
- `GET /api/medical-images/file/:filename` - Serve image files

### Health Check
- `GET /health` - Server health check

## Database Schema

### Organization
- `name`: String (required)
- `email`: String (required, unique)
- `createdAt`: Date

### Doctor
- `fullName`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `specialty`: String (optional)
- `organization`: ObjectId (optional, ref: Organization)
- `patients`: Array of ObjectId (ref: Patient)
- `createdAt`: Date

### Patient
- `fullName`: String (required)
- `gender`: String (enum: male, female, other)
- `age`: Number
- `doctors`: Array of ObjectId (ref: Doctor)
- `createdAt`: Date

### Medical Image
- `patient`: ObjectId (required, ref: Patient)
- `doctor`: ObjectId (required, ref: Doctor)
- `imageUrl`: String (required)
- `description`: String (optional)
- `grade`: String (enum: F0, F1, F2, F3, F4)
- `confidence`: Number (0-100)
- `uploadedAt`: Date

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── doctorController.ts  # Doctor management
│   │   ├── patientController.ts # Patient management
│   │   ├── organizationController.ts # Organization management
│   │   └── medicalImageController.ts # Image upload & analysis
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   └── errorHandler.ts      # Error handling
│   ├── models/
│   │   ├── Doctor.ts            # Doctor schema
│   │   ├── Patient.ts           # Patient schema
│   │   ├── Organization.ts      # Organization schema
│   │   └── MedicalImage.ts      # Medical image schema
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth routes
│   │   ├── doctorRoutes.ts      # Doctor routes
│   │   ├── patientRoutes.ts     # Patient routes
│   │   ├── organizationRoutes.ts # Organization routes
│   │   └── medicalImageRoutes.ts # Medical image routes
│   └── index.ts                 # Main server file
├── uploads/                     # Uploaded files directory
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

## Testing API Endpoints

You can test the API using tools like Postman, curl, or any HTTP client. Here are some example requests:

### 1. Register a Doctor
```bash
curl -X POST http://localhost:5000/api/auth/signup/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Dr. John Smith",
    "email": "john.smith@example.com",
    "password": "securepassword123",
    "specialty": "Cardiology"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@example.com",
    "password": "securepassword123"
  }'
```

### 3. Get Dashboard (requires authentication)
```bash
curl -X GET http://localhost:5000/api/doctor/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Upload Medical Image
```bash
curl -X POST http://localhost:5000/api/medical-images/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg" \
  -F "patientName=John Doe" \
  -F "patientAge=45" \
  -F "patientGender=male" \
  -F "description=Liver scan analysis"
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are hashed using bcryptjs
- **Rate Limiting**: Prevents abuse with request rate limiting
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error handling middleware
- **File Upload Security**: Restricted file types and sizes

## Development

### Scripts
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

### Adding New Features
1. Create appropriate models in `src/models/`
2. Add controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Update main server file to include new routes

## Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET in production
- [ ] Configure MongoDB connection string for production
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up proper logging
- [ ] Configure SSL/TLS
- [ ] Set up monitoring

### Environment Variables
```env
# Database
MONGO_URI=mongodb://localhost:27017/medical_assistant

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key

# Server
PORT=5000
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or run into issues, please create an issue in the repository or contact the development team.
