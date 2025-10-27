import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    github_link: '',
    projectFile: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/projects/student/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === 'projectFile') {
      setUploadData({
        ...uploadData,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setUploadData({
        ...uploadData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Get token first to ensure we have authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Error: Authentication token is missing. Please log in again.');
      setLoading(false);
      return;
    }

    // Validate file type before uploading
    if (uploadData.projectFile) {
      const fileName = uploadData.projectFile.name.toLowerCase();
      const validExtensions = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.7z'];
      const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidFile) {
        setMessage('Error: Only PDF, DOC, DOCX, ZIP, RAR, and 7Z files are allowed.');
        setLoading(false);
        return;
      }
    } else {
      setMessage('Error: Please select a file to upload.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('github_link', uploadData.github_link);
    formData.append('projectFile', uploadData.projectFile);

    try {
      // Set axios default headers before making the request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.post('http://localhost:5000/api/projects/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // Add the new project to the projects list immediately
      const newProject = response.data.project;
      setProjects(prevProjects => [newProject, ...prevProjects]);
      
      setMessage('Project uploaded successfully!');
      setUploadData({ title: '', description: '', github_link: '', projectFile: null });
      setShowUploadForm(false);
      // Also fetch all projects to ensure everything is up to date
      fetchProjects();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Project</CardTitle>
            <CardDescription>
              Submit your project files and GitHub repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showUploadForm ? (
              <Button onClick={() => setShowUploadForm(true)}>
                Upload Project
              </Button>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <Input
                    name="title"
                    value={uploadData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={uploadData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe your project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Link (Optional)
                  </label>
                  <Input
                    name="github_link"
                    type="url"
                    value={uploadData.github_link}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repository"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project File
                  </label>
                  <Input
                    name="projectFile"
                    type="file"
                    onChange={handleInputChange}
                    required
                    accept=".zip,.rar,.7z,.pdf,.doc,.docx,.txt,.py,.js,.html,.css,.java,.cpp,.c"
                  />
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
                    {loading ? 'Uploading...' : 'Upload Project'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>
              View your submitted projects and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No projects submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <span className={`font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <div className="text-sm text-gray-500 mb-2">
                      Submitted: {formatDate(project.submission_date)}
                    </div>
                    {project.github_link && (
                      <div className="mb-2">
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
                    {(project.status === 'Reviewed' || project.status === 'Approved') && project.marks !== null && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-4 mb-2">
                          <div>
                            <span className="font-medium text-gray-700">Marks: </span>
                            <span className="text-xl font-bold text-green-600">
                              {project.marks}/100
                            </span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {project.status}
                          </div>
                        </div>
                        {project.feedback && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Feedback: </span>
                            <p className="text-gray-800 mt-1">{project.feedback}</p>
                          </div>
                        )}
                        {project.comments && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Comments: </span>
                            <p className="text-gray-800 mt-1">{project.comments}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

