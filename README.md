MarkMate – Smart Attendance Management System

MarkMate is a full-stack smart attendance management system designed to automate classroom attendance and reduce common forms of proxy attendance.
The system combines role-based authentication, time-limited QR code verification, and geolocation-based validation to ensure that students can mark attendance only for an active session and from within the teacher-defined attendance radius.

-> Features

--Teacher Features
> Teacher registration and login
> Create and manage attendance sessions
> Set subject and session details
> Capture classroom location
> Configure an allowed attendance radius
> Generate secure QR codes for active sessions
> View live attendance updates
> View attendance records
> Manage past attendance sessions
> Export attendance data as CSV

-- Student Features
> Student registration and login
> Scan QR codes using a mobile device
> Browser-based geolocation verification
> Mark attendance for active sessions
> Duplicate attendance prevention
> View attendance history
> View subject-wise attendance statistics

--Proxy Attendance Prevention
MarkMate uses multiple validation layers instead of relying on a single attendance mechanism.
1. User Authentication
Users authenticate using JWT-based authentication.
The system supports separate roles for:
Teacher
Student
2. Role-Based Access Control
The application separates teacher and student functionality.
For example:
Only teachers can create attendance sessions.
Only teachers can generate session QR codes.
Only students can mark attendance.
3. Time-Limited QR Authentication
When a teacher starts an attendance session, the backend generates a JWT-secured QR token.
The QR token:
Contains information about the active session
Is cryptographically signed
Expires after 90 seconds
This helps reduce the reuse of old QR codes and limits the usefulness of previously captured QR screenshots.
4. Session Validation
When a student attempts to mark attendance, the backend verifies:
Whether the QR token is valid
Whether the QR token has expired
Whether the associated attendance session is active
Attendance cannot be marked for inactive or invalid sessions.
5. Duplicate Attendance Prevention
The system checks whether a student has already marked attendance for the current session.

6. Geolocation-Based Verification
When a teacher creates an attendance session, the system stores the classroom location and an allowed attendance radius.
When a student scans the QR code:
The student's current GPS coordinates are captured.
The coordinates are sent to the backend.
The backend calculates the distance between:
Student's location
Classroom/session location
The calculated distance is compared with the configured attendance radius.

The system uses the Haversine formula to calculate geographical distance between two latitude and longitude coordinates.

Student Location
       │
       ▼
Send GPS Coordinates
       │
       ▼
Calculate Distance
       │
       ▼
Within Allowed Radius?
       │
   ┌───┴────┐
   │        │
  YES       NO
   │        │
   ▼        ▼
Mark      Reject
Present   Attendance

The default attendance radius is 50 meters, and the teacher can configure the radius based on the session requirements.

🏗️ System Architecture
                        ┌──────────────────┐
                        │      USERS       │
                        │                  │
                        │ Teacher / Student│
                        └────────┬─────────┘
                                 │
                                 ▼
                  ┌──────────────────────────┐
                  │      React Frontend      │
                  │                          │
                  │ • Authentication         │
                  │ • Teacher Dashboard      │
                  │ • Student QR Scanner     │
                  │ • Attendance History     │
                  │ • Attendance Statistics  │
                  └────────────┬─────────────┘
                               │
                           REST APIs
                               │
                               ▼
                  ┌──────────────────────────┐
                  │   Node.js + Express API  │
                  │                          │
                  │ • Authentication         │
                  │ • Session Management     │
                  │ • QR Generation          │
                  │ • Attendance Validation  │
                  └────────────┬─────────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
      │ JWT + bcrypt│   │ QR Security │  │ Geolocation │
      │             │   │             │  │ Verification│
      │ Auth & Roles│   │ 90s Expiry  │  │ Haversine   │
      └─────────────┘   └─────────────┘  └─────────────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       MongoDB       │
                    │                     │
                    │ • Users             │
                    │ • Sessions          │
                    │ • Attendance        │
                    └─────────────────────┘
🤖 Face Verification Service

The project also includes a separate face verification service built using:

Python
Flask
DeepFace

The service can compare two face images and return a verification result.

      Input Images
           │
           ▼
    Flask API Service
           │
           ▼
        DeepFace
           │
           ▼
   Face Verification
           │
      ┌────┴────┐
      │         │
   Verified  Not Verified

Note: The face verification service is implemented as a separate module and can be integrated into the main attendance workflow as an additional identity-verification layer.

🔄 Application Workflow
Teacher Workflow
Teacher Login
      │
      ▼
Create Attendance Session
      │
      ▼
Enter Subject and Session Details
      │
      ▼
Capture Classroom Location
      │
      ▼
Configure Attendance Radius
      │
      ▼
Start Session
      │
      ▼
Generate Time-Limited QR Code
      │
      ▼
Students Mark Attendance
      │
      ▼
View Live Attendance Updates
      │
      ▼
End Session
      │
      ▼
View / Export Attendance Records
Student Workflow
Student Login
      │
      ▼
Open QR Scanner
      │
      ▼
Capture Current GPS Location
      │
      ▼
Scan QR Code
      │
      ▼
Send QR Token + Location to Backend
      │
      ▼
Backend Validation
      │
      ├── Is User Authorized?
      │
      ├── Is QR Token Valid?
      │
      ├── Is QR Token Expired?
      │
      ├── Is Session Active?
      │
      ├── Has Student Already Marked Attendance?
      │
      └── Is Student Within Allowed Radius?
                │
        ┌───────┴────────┐
        │                │
      Valid            Invalid
        │                │
        ▼                ▼
 Mark Attendance    Reject Request

 
🛠️ Tech Stack
--> Frontend
    - React.js
    - Vite
    - React Router
    - Axios
    - Tailwind CSS
    - HTML5 QR Scanner
--> Backend
   - Node.js
   - Express.js
   - Database
   - MongoDB
   - Mongoose
--> Authentication & Security
   - JSON Web Tokens (JWT)
   - bcrypt
   - QR Code
   - JWT-secured QR tokens
   - QR code generation library
--> Geolocation
   - Browser Geolocation API
   - Haversine distance calculation
   - Optional AI / Face Verification Service
   - Python
   - Flask
   - DeepFace

📂 Project Structure

       MarkMate/
│
├── frontend/                     # React + Vite frontend
│   │
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── QRDisplay
│   │   │   ├── AttendanceTable
│   │   │   └── ProtectedRoute
│   │   │
│   │   ├── pages/                # Application pages
│   │   │   ├── Login
│   │   │   ├── Register
│   │   │   ├── TeacherDashboard
│   │   │   ├── StudentScan
│   │   │   └── StudentHistory
│   │   │
│   │   ├── api/                  # API service configuration
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/                      # Node.js + Express backend
│   │
│   ├── src/
│   │   ├── models/               # MongoDB models
│   │   │   ├── User.js
│   │   │   ├── Session.js
│   │   │   └── Attendance.js
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── auth.js
│   │   │   ├── sessions.js
│   │   │   ├── qr.js
│   │   │   └── attendance.js
│   │   │
│   │   ├── middleware/           # Authentication middleware
│   │   │   └── auth.js
│   │   │
│   │   └── utils/                # Utility functions
│   │
│   └── server.js
│
├── face-service/                 # Optional face verification service
│   ├── app.py
│   └── requirements.txt
│
└── README.md

🗄️ Database Design

The system primarily manages three main entities.

User
User
├── _id
├── name
├── email
├── passwordHash
├── role
│   ├── teacher
│   └── student
├── enrollmentNo
└── createdAt
Session
Session
├── _id
├── teacherId
├── subject
├── date
├── latitude
├── longitude
├── radiusMeters
├── startTime
├── endTime
└── isActive
Attendance
Attendance
├── _id
├── sessionId
├── studentId
├── markedAt
├── latitude
├── longitude
├── qrTokenHash
└── status
🔌 API Functionality

The backend handles APIs for:

Authentication
POST   /auth/register
POST   /auth/login
Attendance Sessions
Create Session
Get Active Session
Get Session Details
End Session
QR Management
Generate QR Token
Validate QR Token
Attendance
Mark Attendance
Check Duplicate Attendance
Validate Location
Fetch Attendance Records
⚙️ Installation
Prerequisites

Make sure you have the following installed:

Node.js
npm
MongoDB / MongoDB Atlas account
Python (optional, for face verification service)
1. Clone the Repository
    git clone https://github.com/sonali17sr/MarkMate.git
    cd MarkMate
2. Backend Setup
    Navigate to the backend directory:
    cd backend
    Install dependencies:
    npm install
    Create an environment file:
    .env
    Add the required environment variables:
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    Start the backend:
    npm run dev
    or:
    npm start
3. Frontend Setup
    Navigate to the frontend directory:
    cd frontend
    Install dependencies:
    npm install
    Start the development server:
    npm run dev

The application should now be available on the local development URL provided by Vite.

🤖 Face Verification Service Setup

    The face verification service is optional.
    Navigate to the service directory:
    cd face-service

    Create a virtual environment:
    
    python -m venv venv
    
    Activate the environment.

    Windows
    venv\Scripts\activate
    macOS/Linux
    source venv/bin/activate

Install dependencies:

    pip install -r requirements.txt
    Run the Flask service:
    python app.py






