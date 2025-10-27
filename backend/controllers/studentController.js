const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Register a new student
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, roll_no } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { roll_no }] 
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or roll number already exists' 
      });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      password,
      roll_no
    });

    await student.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'collabboard_secret_key';
    const token = jwt.sign(
      { userId: student._id, userType: 'student' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        roll_no: student.roll_no
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Login student
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'collabboard_secret_key';
    const token = jwt.sign(
      { userId: student._id, userType: 'student' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        roll_no: student.roll_no
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');
    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  getStudentProfile
};
