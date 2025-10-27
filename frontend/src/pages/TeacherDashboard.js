import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [evaluationData, setEvaluationData] = useState({
    marks: '',
    feedback: '',
    comments: '',
    status: 'Reviewed'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/teacher/all');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleEvaluate = (project) => {
    setSelectedProject(project);
    // Pre-fill with existing evaluation data if project is already evaluated
    if (project.marks !== null && project.marks !== undefined) {
      setEvaluationData({
        marks: project.marks.toString(),
        feedback: project.feedback || '',
        comments: project.comments || '',
        status: project.status || 'Reviewed'
      });
    } else {
      setEvaluationData({ marks: '', feedback: '', comments: '', status: 'Reviewed' });
    }
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const isEditing = selectedProject.marks !== null && selectedProject.marks !== undefined;

    try {
      await axios.put(`http://localhost:5000/api/projects/evaluate/${selectedProject._id}`, {
        marks: parseInt(evaluationData.marks),
        feedback: evaluationData.feedback,
        comments: evaluationData.comments,
        status: evaluationData.status
      });
      
      setMessage(isEditing ? 'Evaluation updated successfully!' : 'Project evaluated successfully!');
      setSelectedProject(null);
      setEvaluationData({ marks: '', feedback: '', comments: '', status: 'Reviewed' });
      fetchProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || (isEditing ? 'Update failed' : 'Evaluation failed'));
    }
    setLoading(false);
  };

  const handleDownload = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/projects/download/${projectId}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Get filename from Content-Disposition header or use default
      let filename = `project-${projectId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Get content type from response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Create blob with correct MIME type and download
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-green-700';
    if (status === 'Reviewed') return 'text-blue-600';
    return 'text-yellow-600';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pendingProjects = projects.filter(p => p.status === 'Pending');
  const reviewedProjects = projects.filter(p => p.status === 'Reviewed' || p.status === 'Approved');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
              <div className="text-gray-600">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{pendingProjects.length}</div>
              <div className="text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{reviewedProjects.length}</div>
              <div className="text-gray-600">Reviewed</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Projects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pending Review</CardTitle>
            <CardDescription>
              Projects waiting for evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending projects.</p>
            ) : (
              <div className="space-y-4">
                {pendingProjects.map((project) => (
                  <div key={project._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          by {project.student_id?.name} ({project.student_id?.roll_no})
                        </p>
                      </div>
                      <span className={`font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <div className="text-sm text-gray-500 mb-2">
                      Submitted: {formatDate(project.submission_date)}
                    </div>
                    {project.github_link && (
                      <div className="mb-3">
                        <a 
                          href={project.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on GitHub
                        </a>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleDownload(project._id)}
                        variant="outline"
                        size="sm"
                      >
                        Download File
                      </Button>
                      <Button 
                        onClick={() => handleEvaluate(project)}
                        size="sm"
                      >
                        Evaluate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviewed Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Reviewed Projects</CardTitle>
            <CardDescription>
              Projects that have been evaluated
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewedProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviewed projects yet.</p>
            ) : (
              <div className="space-y-4">
                {reviewedProjects.map((project) => (
                  <div key={project._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <p className="text-sm text-gray-600">
                          by {project.student_id?.name} ({project.student_id?.roll_no})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <div className="text-lg font-bold text-green-600">
                          {project.marks}/100
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <div className="text-sm text-gray-500 mb-2">
                      Submitted: {formatDate(project.submission_date)}
                    </div>
                    {project.github_link && (
                      <div className="mb-3">
                        <a 
                          href={project.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View on GitHub
                        </a>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                      {project.feedback && (
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">Feedback: </span>
                          <p className="text-gray-800 mt-1">{project.feedback}</p>
                        </div>
                      )}
                      {project.comments && (
                        <div>
                          <span className="font-medium text-gray-700">Comments: </span>
                          <p className="text-gray-800 mt-1">{project.comments}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button 
                        onClick={() => handleDownload(project._id)}
                        variant="outline"
                        size="sm"
                      >
                        Download File
                      </Button>
                      <Button 
                        onClick={() => handleEvaluate(project)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        Edit Evaluation
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluation Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {selectedProject.marks !== null && selectedProject.marks !== undefined 
                    ? 'Edit Evaluation' 
                    : 'Evaluate Project'}
                </CardTitle>
                <CardDescription>
                  {selectedProject.title} by {selectedProject.student_id?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks (0-100)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={evaluationData.marks}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        marks: e.target.value
                      })}
                      required
                      placeholder="Enter marks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={evaluationData.feedback}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        feedback: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter feedback for the student"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={evaluationData.comments}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        comments: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Additional comments"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={evaluationData.status}
                      onChange={(e) => setEvaluationData({
                        ...evaluationData,
                        status: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Reviewed">Reviewed</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-md ${
                      message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading 
                        ? (selectedProject.marks !== null && selectedProject.marks !== undefined ? 'Updating...' : 'Evaluating...') 
                        : (selectedProject.marks !== null && selectedProject.marks !== undefined ? 'Update Evaluation' : 'Submit Evaluation')}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedProject(null);
                        setEvaluationData({ marks: '', feedback: '', comments: '', status: 'Reviewed' });
                        setMessage('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;


