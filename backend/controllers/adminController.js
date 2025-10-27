const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Project = require('../models/Project');

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'collabboard_secret_key';
    const token = jwt.sign(
      { userId: admin._id, userType: 'admin' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get all pending teachers
const getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await Teacher.find({ status: 'Pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(pendingTeachers);
  } catch (error) {
    console.error('Get pending teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teachers (with all statuses)
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(teachers);
  } catch (error) {
    console.error('Get all teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve teacher
const approveTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.status = 'Approved';
    await teacher.save();

    res.json({
      message: 'Teacher approved successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Approve teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject teacher
const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.status = 'Rejected';
    await teacher.save();

    res.json({
      message: 'Teacher rejected successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        status: teacher.status
      }
    });
  } catch (error) {
    console.error('Reject teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get admin from database
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin statistics
const getAdminStatistics = async (req, res) => {
  try {
    // Count totals
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments({ status: 'Approved' });
    const totalProjects = await Project.countDocuments();
    
    // Count projects by status
    const pendingProjects = await Project.countDocuments({ status: 'Pending' });
    const reviewedProjects = await Project.countDocuments({ status: 'Reviewed' });
    const approvedProjects = await Project.countDocuments({ status: 'Approved' });
    
    // Count pending teachers
    const pendingTeachers = await Teacher.countDocuments({ status: 'Pending' });
    
    // Get recent projects
    const recentProjects = await Project.find()
      .populate('student_id', 'name email roll_no')
      .sort({ submission_date: -1 })
      .limit(5);

    res.json({
      totalStudents,
      totalTeachers,
      totalProjects,
      pendingTeachers,
      projectsByStatus: {
        pending: pendingProjects,
        reviewed: reviewedProjects,
        approved: approvedProjects
      },
      recentProjects
    });
  } catch (error) {
    console.error('Get admin statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  loginAdmin,
  getPendingTeachers,
  getAllTeachers,
  approveTeacher,
  rejectTeacher,
  getAdminProfile,
  changeAdminPassword,
  getAdminStatistics
};

