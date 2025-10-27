const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'collabboard_secret_key';
    console.log('Verifying token with secret...');
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decoded:', decoded);
    
    // Check if user exists (student, teacher, or admin)
    let user = await Student.findById(decoded.userId);
    let userType = 'student';
    
    if (!user) {
      user = await Teacher.findById(decoded.userId);
      userType = 'teacher';
    }

    if (!user) {
      user = await Admin.findById(decoded.userId);
      userType = 'admin';
    }

    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    console.log('User authenticated:', user.email);
    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
  }
};

// Middleware to check if user is a student
const requireStudent = (req, res, next) => {
  if (req.userType !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

// Middleware to check if user is a teacher
const requireTeacher = (req, res, next) => {
  if (req.userType !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access required' });
  }
  next();
};

// Middleware to check if user is an admin
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireStudent,
  requireTeacher,
  requireAdmin
};

