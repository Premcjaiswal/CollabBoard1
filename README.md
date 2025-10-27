# CollabBoard - Project Submission & Evaluation Portal

A full-stack web application for colleges to manage project submissions and evaluations.

## Tech Stack

- **Frontend**: React + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas

## Features

### Student Module
- Register and login
- Upload projects (files + GitHub links)
- View submission status, marks, and feedback

### Teacher Module
- Login
- View all student submissions
- Evaluate projects (add marks + feedback)
- Download project files

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
PORT=5000
MONGO_URI=mongodb+srv://CollabBoard:Prem2005@cluster0.cxgvpwf.mongodb.net/
JWT_SECRET=collabboard_secret_key
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Student Routes
- `POST /api/students/register` - Register a new student
- `POST /api/students/login` - Student login
- `GET /api/students/profile` - Get student profile

### Teacher Routes
- `POST /api/teachers/login` - Teacher login
- `GET /api/teachers/profile` - Get teacher profile

### Project Routes
- `POST /api/projects/upload` - Upload project (Student only)
- `GET /api/projects/student/:id` - Get student's projects
- `GET /api/projects/teacher/all` - Get all projects (Teacher only)
- `PUT /api/projects/evaluate/:projectId` - Evaluate project (Teacher only)
- `GET /api/projects/download/:projectId` - Download project file

## Database Schema

### Students Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  roll_no: String
}
```

### Teachers Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  department: String
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  student_id: ObjectId,
  title: String,
  description: String,
  file_path: String,
  github_link: String,
  submission_date: Date,
  status: String, // "Pending" or "Reviewed"
  marks: Number,
  feedback: String
}
```

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Register as a student or login as a teacher
4. Students can upload projects and view their status
5. Teachers can view all submissions and evaluate them

## File Upload

- Supported file types: .zip, .rar, .7z, .pdf, .doc, .docx, .txt, .py, .js, .html, .css, .java, .cpp, .c
- Maximum file size: 50MB
- Files are stored in the `backend/uploads` directory

## Authentication

- JWT-based authentication
- Tokens expire after 7 days
- Protected routes require valid tokens



