import os
import json
import uuid
import sqlite3
import datetime
import numpy as np
import torch
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import LiverFibrosisModel
from utils import init_db, get_db, close_db, generate_record_id

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB max upload
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key_for_livsafe')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database
with app.app_context():
    init_db()

# Close database connection at the end of each request
app.teardown_appcontext(close_db)

# Initialize the model
model = LiverFibrosisModel()

# Routes
@app.route('/api/signup/doctor', methods=['POST'])
def signup_doctor():
    data = request.get_json()
    
    # Validate input
    required_fields = ['email', 'password', 'firstName', 'lastName', 'specialization']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if email already exists
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
    if cursor.fetchone():
        return jsonify({"error": "Email already registered"}), 400
    
    # Create user
    hashed_password = generate_password_hash(data['password'])
    cursor.execute(
        """
        INSERT INTO users (email, password, first_name, last_name, specialization, user_type)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (data['email'], hashed_password, data['firstName'], data['lastName'], data['specialization'], 'doctor')
    )
    user_id = cursor.lastrowid
    
    # Create doctor
    cursor.execute(
        """
        INSERT INTO doctors (user_id, organization_id)
        VALUES (?, NULL)
        """,
        (user_id,)
    )
    
    # Create doctor's database
    doctor_db_path = os.path.join('db', f'doctor_{user_id}.db')
    doctor_db = sqlite3.connect(doctor_db_path)
    doctor_cursor = doctor_db.cursor()
    
    # Create tables for doctor's records
    doctor_cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    doctor_cursor.execute('''
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            record_id TEXT NOT NULL UNIQUE,
            grade TEXT NOT NULL,
            confidence INTEGER NOT NULL,
            image_path TEXT NOT NULL,
            analysis_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
    ''')
    
    doctor_db.commit()
    doctor_db.close()
    
    db.commit()
    return jsonify({"message": "Doctor account created successfully", "id": user_id}), 201

@app.route('/api/signup/organization', methods=['POST'])
def signup_organization():
    data = request.get_json()
    
    # Validate input
    required_fields = ['name', 'type', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if email already exists
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
    if cursor.fetchone():
        return jsonify({"error": "Email already registered"}), 400
    
    # Create user
    hashed_password = generate_password_hash(data['password'])
    cursor.execute(
        """
        INSERT INTO users (email, password, user_type)
        VALUES (?, ?, ?)
        """,
        (data['email'], hashed_password, 'organization')
    )
    user_id = cursor.lastrowid
    
    # Create organization
    cursor.execute(
        """
        INSERT INTO organizations (name, type, user_id)
        VALUES (?, ?, ?)
        """,
        (data['name'], data['type'], user_id)
    )
    organization_id = cursor.lastrowid
    
    # Create organization's database
    org_db_path = os.path.join('db', f'org_{organization_id}.db')
    org_db = sqlite3.connect(org_db_path)
    org_cursor = org_db.cursor()
    
    # Create tables for organization's data
    org_cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            specialization TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    org_cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doctor_id INTEGER NOT NULL,
            total_records INTEGER DEFAULT 0,
            monthly_records INTEGER DEFAULT 0,
            grade_f0 INTEGER DEFAULT 0,
            grade_f1 INTEGER DEFAULT 0,
            grade_f2 INTEGER DEFAULT 0,
            grade_f3 INTEGER DEFAULT 0,
            grade_f4 INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        )
    ''')
    
    org_db.commit()
    org_db.close()
    
    db.commit()
    return jsonify({"message": "Organization account created successfully", "id": organization_id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        SELECT id, email, password, user_type, first_name, last_name
        FROM users
        WHERE email = ?
        """,
        (data['email'],)
    )
    user = cursor.fetchone()
    
    if not user or not check_password_hash(user[2], data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Return user info
    return jsonify({
        "id": user[0],
        "email": user[1],
        "name": f"{user[4] or ''} {user[5] or ''}".strip(),
        "type": user[3]
    }), 200

@app.route('/api/grade', methods=['POST'])
def grade_image():
    # Check if image is in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    # Get patient info
    patient_name = request.form.get('patientName')
    patient_age = request.form.get('patientAge')
    patient_gender = request.form.get('patientGender')
    
    if not patient_name or not patient_age or not patient_gender:
        return jsonify({"error": "Missing patient information"}), 400
    
    try:
        patient_age = int(patient_age)
    except ValueError:
        return jsonify({"error": "Age must be a number"}), 400
    
    # Save the image
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
    try:
        # Process image with model
        # Note: In a real production environment, we would use the actual model
        # Here we simulate the response for development purposes
        
        # Simulate model processing
        grades = ['F0', 'F1', 'F2', 'F3', 'F4']
        confidences = [85, 89, 92, 87, 91]
        
        # For realistic simulation, we'll use the model class
        grade, confidence = model.predict(file_path)
        
        # Generate analysis text
        analysis_intro = f"The ultrasound shows {'no significant' if grade == 'F0' else 'mild' if grade == 'F1' else 'moderate' if grade == 'F2' else 'advanced' if grade == 'F3' else 'severe'} hepatic fibrosis consistent with {grade} grade (Metavir scale). Key findings include:"
        
        findings = [
            f"{'Normal' if grade == 'F0' else 'Mild' if grade == 'F1' else 'Moderate' if grade == 'F2' else 'Significant' if grade == 'F3' else 'Severe'} heterogeneity of liver parenchyma",
            f"Portal vein diameter {'enlarged' if grade == 'F4' else 'within normal range'} ({10 + int(grade[1]) * 0.5}mm)",
            f"{'No' if grade == 'F0' else 'Significant' if grade == 'F4' else 'Mild'} nodularity of liver surface",
            f"{'No' if grade == 'F0' else 'Mild' if grade == 'F1' else 'Moderate' if grade == 'F2' else 'Advanced' if grade == 'F3' else 'Severe'} periportal fibrosis visible",
            f"Spleen size {'enlarged' if grade == 'F4' else 'normal'} ({11 + int(grade[1]) * 0.8}cm)"
        ]
        
        recommendation = f"Recommended follow-up: Repeat ultrasound in {'12' if grade == 'F0' else '6' if grade == 'F1' else '4' if grade == 'F2' else '3' if grade == 'F3' else '2'} months to monitor progression."
        
        analysis = [analysis_intro, *findings, recommendation]
        
        # Generate unique record ID
        record_id = generate_record_id()
        
        # Save to database (in production, would save to doctor's DB)
        # For now, we'll just return the result
        
        result = {
            "patientInfo": {
                "id": record_id,
                "name": patient_name,
                "age": patient_age,
                "gender": patient_gender,
                "date": datetime.datetime.now().strftime("%B %d, %Y")
            },
            "fibrosis": {
                "grade": grade,
                "confidence": confidence
            },
            "analysis": analysis,
            "recordId": record_id
        }
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

@app.route('/api/doctor/dashboard', methods=['GET'])
def doctor_dashboard():
    # In production, this would fetch real data from the doctor's database
    # For development, we'll return sample data
    
    # Sample data
    total_records = 147
    monthly_records = 23
    accuracy = 94.2
    
    recent_records = [
        {
            "id": "LIV-2023051",
            "patientName": "Sarah Johnson",
            "date": "May 12, 2023",
            "grade": "F1"
        },
        {
            "id": "LIV-2023047",
            "patientName": "Michael Chen",
            "date": "May 10, 2023",
            "grade": "F2"
        },
        {
            "id": "LIV-2023042",
            "patientName": "Robert Williams",
            "date": "May 8, 2023",
            "grade": "F3"
        }
    ]
    
    grade_distribution = [
        {"name": "F0", "value": 15, "color": "#3b82f6"},
        {"name": "F1", "value": 42, "color": "#22c55e"},
        {"name": "F2", "value": 58, "color": "#eab308"},
        {"name": "F3", "value": 27, "color": "#f97316"},
        {"name": "F4", "value": 5, "color": "#ef4444"}
    ]
    
    dashboard_data = {
        "stats": {
            "totalRecords": total_records,
            "totalChange": f"+{round(total_records * 0.1)} from last month",
            "monthlyRecords": monthly_records,
            "monthlyChange": f"+{round(monthly_records * 0.2)} from previous month",
            "accuracy": accuracy,
            "accuracyChange": "+1.3% from last month"
        },
        "recentRecords": recent_records,
        "gradeDistribution": grade_distribution
    }
    
    return jsonify(dashboard_data), 200

@app.route('/api/organization/dashboard', methods=['GET'])
def organization_dashboard():
    # In production, this would fetch real data from the organization's database
    # For development, we'll return sample data
    
    # Sample data
    total_doctors = 15
    total_records_today = 42
    total_records_month = 1247
    
    doctors = [
        {
            "id": "DOC-001",
            "name": "Dr. John Smith",
            "email": "john.smith@hospital.com",
            "specialization": "Radiology",
            "recordCount": 245
        },
        {
            "id": "DOC-002",
            "name": "Dr. Emily Wong",
            "email": "emily.wong@hospital.com",
            "specialization": "Hepatology",
            "recordCount": 189
        },
        {
            "id": "DOC-003",
            "name": "Dr. Michael Johnson",
            "email": "michael.johnson@hospital.com",
            "specialization": "Gastroenterology",
            "recordCount": 312
        },
        {
            "id": "DOC-004",
            "name": "Dr. Sarah Palmer",
            "email": "sarah.palmer@hospital.com",
            "specialization": "Internal Medicine",
            "recordCount": 178
        }
    ]
    
    grade_distribution = [
        {"name": "F0", "value": 221, "color": "#3b82f6"},
        {"name": "F1", "value": 389, "color": "#22c55e"},
        {"name": "F2", "value": 427, "color": "#eab308"},
        {"name": "F3", "value": 189, "color": "#f97316"},
        {"name": "F4", "value": 21, "color": "#ef4444"}
    ]
    
    dashboard_data = {
        "stats": {
            "totalDoctors": total_doctors,
            "doctorsChange": "+2 from last month",
            "totalRecordsToday": total_records_today,
            "recordsTodayChange": f"+{round(total_records_today * 0.2)} from yesterday",
            "totalRecordsMonth": total_records_month,
            "recordsMonthChange": f"+{round(total_records_month * 0.1)} from last month"
        },
        "doctors": doctors,
        "gradeDistribution": grade_distribution
    }
    
    return jsonify(dashboard_data), 200

@app.route('/api/records', methods=['GET'])
def get_records():
    # In production, this would fetch real records from the database
    # For development, we'll return sample data
    
    records = [
        {
            "id": "LIV-2023042",
            "patientName": "Robert Williams",
            "date": "May 8, 2023",
            "grade": "F3",
            "confidence": 89
        },
        {
            "id": "LIV-2023035",
            "patientName": "Emily Parker",
            "date": "May 3, 2023",
            "grade": "F0",
            "confidence": 95
        },
        {
            "id": "LIV-2023051",
            "patientName": "Sarah Johnson",
            "date": "May 12, 2023",
            "grade": "F1",
            "confidence": 92
        },
        {
            "id": "LIV-2023047",
            "patientName": "Michael Chen",
            "date": "May 10, 2023",
            "grade": "F2",
            "confidence": 87
        },
        {
            "id": "LIV-2023060",
            "patientName": "David Thompson",
            "date": "May 15, 2023",
            "grade": "F4",
            "confidence": 91
        }
    ]
    
    return jsonify(records), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
