const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher, getTeacherProfile } = require('../controllers/teacherController');
const { authenticateToken, requireTeacher } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

// Protected routes
router.get('/profile', authenticateToken, requireTeacher, getTeacherProfile);

module.exports = router;

