import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [pendingRes, allRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/teachers/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/admin/teachers/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setPendingTeachers(pendingRes.data);
      setAllTeachers(allRes.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleApprove = async (teacherId) => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/teachers/approve/${teacherId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage('Teacher approved successfully!');
      fetchTeachers();
      fetchStatistics();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Approval failed');
    }
    setLoading(false);
  };

  const handleReject = async (teacherId) => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/teachers/reject/${teacherId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage('Teacher rejected successfully!');
      fetchTeachers();
      fetchStatistics();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Rejection failed');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/admin/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Password change failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const approvedTeachers = allTeachers.filter(t => t.status === 'Approved');
  const rejectedTeachers = allTeachers.filter(t => t.status === 'Rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage teacher approvals</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowPasswordChange(true)} variant="outline">
                Change Password
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{allTeachers.length}</div>
              <div className="text-gray-600">Total Teachers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">{pendingTeachers.length}</div>
              <div className="text-gray-600">Pending Approval</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{approvedTeachers.length}</div>
              <div className="text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{rejectedTeachers.length}</div>
              <div className="text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveView('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeView === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveView('pending')}
          >
            Pending Requests
          </Button>
          <Button
            variant={activeView === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveView('all')}
          >
            All Teachers
          </Button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md ${
            message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Overview Dashboard */}
        {activeView === 'overview' && statistics && (
          <div className="space-y-6">
            {/* Project Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Project Submission Status</CardTitle>
                <CardDescription>
                  Overview of all project submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{statistics.projectsByStatus.pending}</div>
                    <div className="text-gray-600">Pending Review</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {((statistics.projectsByStatus.pending / statistics.totalProjects) * 100 || 0).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{statistics.projectsByStatus.reviewed}</div>
                    <div className="text-gray-600">Reviewed</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {((statistics.projectsByStatus.reviewed / statistics.totalProjects) * 100 || 0).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{statistics.projectsByStatus.approved}</div>
                    <div className="text-gray-600">Approved</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {((statistics.projectsByStatus.approved / statistics.totalProjects) * 100 || 0).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Project Submissions</CardTitle>
                <CardDescription>
                  Latest 5 project submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statistics.recentProjects.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No projects submitted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {statistics.recentProjects.map((project) => (
                      <div key={project._id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <p className="text-sm text-gray-600">
                              by {project.student_id?.name} ({project.student_id?.roll_no})
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted: {new Date(project.submission_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'Approved' ? 'bg-green-100 text-green-600' :
                            project.status === 'Reviewed' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        {project.marks !== null && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Marks: </span>
                            <span className="text-green-600 font-bold">{project.marks}/100</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Teachers */}
        {activeView === 'pending' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Teacher Approvals</CardTitle>
              <CardDescription>
                Review and approve/reject teacher registration requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTeachers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending teacher requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingTeachers.map((teacher) => (
                    <div key={teacher._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{teacher.name}</h3>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          <p className="text-sm text-gray-600">Department: {teacher.department}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Registered: {formatDate(teacher.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teacher.status)}`}>
                          {teacher.status}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() => handleApprove(teacher._id)}
                          disabled={loading}
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(teacher._id)}
                          disabled={loading}
                          variant="destructive"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Teachers */}
        {activeView === 'all' && (
          <Card>
            <CardHeader>
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>
                View all registered teachers and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allTeachers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teachers registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {allTeachers.map((teacher) => (
                    <div key={teacher._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{teacher.name}</h3>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          <p className="text-sm text-gray-600">Department: {teacher.department}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Registered: {formatDate(teacher.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teacher.status)}`}>
                          {teacher.status}
                        </span>
                      </div>
                      {teacher.status === 'Pending' && (
                        <div className="flex space-x-2 mt-4">
                          <Button
                            onClick={() => handleApprove(teacher._id)}
                            disabled={loading}
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(teacher._id)}
                            disabled={loading}
                            variant="destructive"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Admin Password</CardTitle>
              <CardDescription>
                Update your admin account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
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
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
  );
};

export default AdminDashboard;

