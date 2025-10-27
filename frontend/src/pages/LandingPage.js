import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import axios from 'axios';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('student-login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roll_no: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage(''); // Clear message when user types
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(formData.email, formData.password, 'student');
    
    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(formData.email, formData.password, 'teacher');
    
    if (result.success) {
      navigate('/teacher/dashboard');
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      navigate('/admin/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Admin login failed');
    }
    setLoading(false);
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roll_no: formData.roll_no
    }, 'student');
    
    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/teachers/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department
      });

      setMessage(response.data.message);
      setFormData({ name: '', email: '', password: '', roll_no: '', department: '' });
      
      // Auto switch to teacher login tab after successful registration
      setTimeout(() => {
        setActiveTab('teacher-login');
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Teacher registration failed');
    }
    setLoading(false);
  };

  const getTabTitle = () => {
    switch(activeTab) {
      case 'student-login': return 'Student Login';
      case 'student-register': return 'Student Registration';
      case 'teacher-login': return 'Teacher Login';
      case 'teacher-register': return 'Teacher Registration';
      case 'admin-login': return 'Admin Login';
      default: return '';
    }
  };

  const getTabDescription = () => {
    switch(activeTab) {
      case 'student-login': return 'Sign in to your student account';
      case 'student-register': return 'Create a new student account';
      case 'teacher-login': return 'Sign in to your teacher account';
      case 'teacher-register': return 'Register as a teacher (requires admin approval)';
      case 'admin-login': return 'Admin portal access';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CollabBoard</h1>
          <p className="text-gray-600">Project Submission & Evaluation Portal</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={activeTab === 'student-login' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('student-login'); setMessage(''); }}
                size="sm"
              >
                Student Login
              </Button>
              <Button
                variant={activeTab === 'student-register' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('student-register'); setMessage(''); }}
                size="sm"
              >
                Student Register
              </Button>
              <Button
                variant={activeTab === 'teacher-login' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('teacher-login'); setMessage(''); }}
                size="sm"
              >
                Teacher Login
              </Button>
              <Button
                variant={activeTab === 'teacher-register' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('teacher-register'); setMessage(''); }}
                size="sm"
              >
                Teacher Register
              </Button>
              <Button
                variant={activeTab === 'admin-login' ? 'default' : 'outline'}
                onClick={() => { setActiveTab('admin-login'); setMessage(''); }}
                size="sm"
              >
                Admin Login
              </Button>
            </div>
            <CardTitle>{getTabTitle()}</CardTitle>
            <CardDescription>{getTabDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className={`mb-4 p-3 rounded-md ${
                message.includes('success') || message.includes('approval') 
                  ? 'bg-green-100 text-green-700' 
                  : message.includes('pending')
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={
              activeTab === 'student-login' ? handleStudentLogin :
              activeTab === 'student-register' ? handleStudentRegister :
              activeTab === 'teacher-login' ? handleTeacherLogin :
              activeTab === 'teacher-register' ? handleTeacherRegister :
              handleAdminLogin
            }>
              {(activeTab === 'student-register' || activeTab === 'teacher-register') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              {activeTab === 'student-register' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number
                  </label>
                  <Input
                    type="text"
                    name="roll_no"
                    value={formData.roll_no}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your roll number"
                  />
                </div>
              )}

              {activeTab === 'teacher-register' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your department"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : getTabTitle()}
              </Button>
            </form>
          </CardContent>
        </Card>

        {activeTab === 'admin-login' && (
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Default Admin Credentials:</p>
            <p>Email: admin@collabboard.com | Password: admin123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;


