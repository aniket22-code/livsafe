import os
import sqlite3
import datetime
import random

# Database constants
DATABASE_FOLDER = 'db'
MAIN_DB = 'livsafe.db'

def get_db():
    """Get the database connection for the current request."""
    if 'db' not in g:
        # Ensure DB folder exists
        os.makedirs(DATABASE_FOLDER, exist_ok=True)
        db_path = os.path.join(DATABASE_FOLDER, MAIN_DB)
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize the database with tables if they don't exist."""
    db = get_db()
    cursor = db.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            specialization TEXT,
            user_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create organizations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create doctors table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            organization_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (organization_id) REFERENCES organizations (id)
        )
    ''')
    
    # Create session table for Flask-Session
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL UNIQUE,
            data BLOB NOT NULL,
            expiry TIMESTAMP NOT NULL
        )
    ''')
    
    db.commit()

def generate_record_id():
    """Generate a unique record ID in the format LIV-YYYY### where ### is a random number."""
    year = datetime.datetime.now().year
    random_part = random.randint(1, 999)
    return f"LIV-{year}{random_part:03d}"

def get_doctor_db(doctor_id):
    """Get the database connection for a specific doctor."""
    db_path = os.path.join(DATABASE_FOLDER, f'doctor_{doctor_id}.db')
    if not os.path.exists(db_path):
        # If the doctor's DB doesn't exist, create it
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
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
        
        conn.commit()
        return conn
    else:
        return sqlite3.connect(db_path)

def get_organization_db(org_id):
    """Get the database connection for a specific organization."""
    db_path = os.path.join(DATABASE_FOLDER, f'org_{org_id}.db')
    if not os.path.exists(db_path):
        # If the organization's DB doesn't exist, create it
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
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
        
        cursor.execute('''
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
        
        conn.commit()
        return conn
    else:
        return sqlite3.connect(db_path)

def format_record_for_response(record, patient=None):
    """Format a record row to a consistent JSON response."""
    if not patient:
        # In a real implementation, we would fetch the patient
        patient = {"name": "Unknown", "age": 0, "gender": "unknown"}
    
    return {
        "id": record["record_id"],
        "patientName": patient["name"],
        "date": datetime.datetime.fromisoformat(record["created_at"]).strftime("%B %d, %Y"),
        "grade": record["grade"],
        "confidence": record["confidence"]
    }
