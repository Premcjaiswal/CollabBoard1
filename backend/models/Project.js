const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  file_path: {
    type: String,
    default: null
  },
  github_link: {
    type: String,
    default: null,
    trim: true
  },
  submission_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Approved'],
    default: 'Pending'
  },
  marks: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: null,
    trim: true
  },
  comments: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);

