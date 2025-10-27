const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, getStudentProfile } = require('../controllers/studentController');
const { authenticateToken, requireStudent } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Protected routes
router.get('/profile', authenticateToken, requireStudent, getStudentProfile);

module.exports = router;

