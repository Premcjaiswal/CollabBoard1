const Project = require('../models/Project');
const Student = require('../models/Student');
const path = require('path');
const fs = require('fs');

// Upload project
const uploadProject = async (req, res) => {
  try {
    const { title, description, github_link } = req.body;
    const student_id = req.user._id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Project file is required' });
    }

    const project = new Project({
      student_id,
      title,
      description,
      file_path: req.file.path,
      github_link: github_link || null
    });

    await project.save();

    res.status(201).json({
      message: 'Project uploaded successfully',
      project: {
        id: project._id,
        title: project.title,
        description: project.description,
        file_path: project.file_path,
        github_link: project.github_link,
        submission_date: project.submission_date,
        status: project.status
      }
    });
  } catch (error) {
    console.error('Project upload error:', error);
    res.status(500).json({ message: 'Server error during project upload' });
  }
};

// Get projects by student
const getStudentProjects = async (req, res) => {
  try {
    const student_id = req.user._id;
    const projects = await Project.find({ student_id }).sort({ submission_date: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Get student projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all projects for teachers
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('student_id', 'name email roll_no')
      .sort({ submission_date: -1 });
    
    res.json(projects);
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Evaluate project (add marks, feedback, comments, and status)
const evaluateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { marks, feedback, comments, status } = req.body;

    if (!marks || marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Marks must be between 0 and 100' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.marks = marks;
    project.feedback = feedback || project.feedback;
    project.comments = comments || project.comments;
    project.status = status || 'Reviewed'; // Can be Reviewed or Approved

    await project.save();

    res.json({
      message: 'Project evaluated successfully',
      project: {
        id: project._id,
        title: project.title,
        marks: project.marks,
        feedback: project.feedback,
        comments: project.comments,
        status: project.status
      }
    });
  } catch (error) {
    console.error('Project evaluation error:', error);
    res.status(500).json({ message: 'Server error during evaluation' });
  }
};

// Helper function to get MIME type based on file extension
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Download project file
const downloadProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.file_path || !fs.existsSync(project.file_path)) {
      return res.status(404).json({ message: 'Project file not found' });
    }

    const filePath = path.resolve(project.file_path);
    const fileName = path.basename(filePath);
    const mimeType = getMimeType(fileName);

    // Set proper headers for file download with correct MIME type
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType);
    
    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Download project error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during download' });
    }
  }
};

module.exports = {
  uploadProject,
  getStudentProjects,
  getAllProjects,
  evaluateProject,
  downloadProject
};

