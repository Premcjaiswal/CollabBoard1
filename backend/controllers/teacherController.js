const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

// Register a new teacher
const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });

    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'Teacher with this email already exists' 
      });
    }

    // Create new teacher with Pending status
    const teacher = new Teacher({
      name,
      email,
      password,
      department,
      status: 'Pending'
    });

    await teacher.save();

    res.status(201).json({
      message: 'Registration successful! Your account is pending admin approval. You will be able to login once approved.',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Login teacher
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if teacher is approved
    if (teacher.status === 'Pending') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. Please wait for approval to login.' 
      });
    }

    if (teacher.status === 'Rejected') {
      return res.status(403).json({ 
        message: 'Your account has been rejected by admin. Please contact support.' 
      });
    }

    // Check password
    const isPasswordValid = await teacher.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'collabboard_secret_key';
    const token = jwt.sign(
      { userId: teacher._id, userType: 'teacher' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Teacher login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get teacher profile
const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id).select('-password');
    res.json(teacher);
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerTeacher,
  loginTeacher,
  getTeacherProfile
};

