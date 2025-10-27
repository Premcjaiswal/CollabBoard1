const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  getPendingTeachers, 
  getAllTeachers, 
  approveTeacher, 
  rejectTeacher,
  getAdminProfile,
  changeAdminPassword,
  getAdminStatistics
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginAdmin);

// Protected routes (Admin only)
router.get('/profile', authenticateToken, requireAdmin, getAdminProfile);
router.put('/change-password', authenticateToken, requireAdmin, changeAdminPassword);
router.get('/statistics', authenticateToken, requireAdmin, getAdminStatistics);
router.get('/teachers/pending', authenticateToken, requireAdmin, getPendingTeachers);
router.get('/teachers/all', authenticateToken, requireAdmin, getAllTeachers);
router.put('/teachers/approve/:teacherId', authenticateToken, requireAdmin, approveTeacher);
router.put('/teachers/reject/:teacherId', authenticateToken, requireAdmin, rejectTeacher);

module.exports = router;

