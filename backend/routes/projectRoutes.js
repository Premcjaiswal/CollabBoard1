const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  uploadProject, 
  getStudentProjects, 
  getAllProjects, 
  evaluateProject, 
  downloadProject 
} = require('../controllers/projectController');
const { authenticateToken, requireStudent, requireTeacher } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common project file types (PDF, DOC, PPT, ZIP, images, etc.)
    const allowedTypes = /\.(zip|rar|7z|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg|gif)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR, 7Z, TXT, PNG, JPG, GIF'));
    }
  }
});

// Student routes
router.post('/upload', authenticateToken, requireStudent, upload.single('projectFile'), uploadProject);
router.get('/student/me', authenticateToken, requireStudent, getStudentProjects);
router.get('/student/:id', authenticateToken, requireStudent, getStudentProjects);

// Teacher routes
router.get('/teacher/all', authenticateToken, requireTeacher, getAllProjects);
router.put('/evaluate/:projectId', authenticateToken, requireTeacher, evaluateProject);
router.get('/download/:projectId', authenticateToken, downloadProject);

module.exports = router;

