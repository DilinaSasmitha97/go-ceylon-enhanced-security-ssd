import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LuUser } from 'react-icons/lu';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import { GrLocation } from 'react-icons/gr';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config/config";

const Login = () => {

  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#ffffff");
  }, []);

  const handleUserTypeChange = (type) => {
    setUserType(type);
    const routes = {
      Tourist: '/register1',
      Guide: '/register2',
      Businessman: '/register3',
    };
    navigate(routes[type]);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token } = response.data;

      // Save the token in localStorage
      localStorage.setItem('authToken', token);

      // Redirect user based on userType (optional)
      const userType = response.data.user.userType;
      if (userType === 'guide') {
        navigate('/guide');
      } else if (userType === 'tourist') {
        navigate('/user/');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard/');
      } else if (userType === 'business_user') {
        navigate('/business/');
      }
    } catch (err) {
      console.error('Login Failed:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center relative lg:bg-gray-100">
      <div className="bg-white bg-opacity-80 p-10 max-w-[400px] w-full z-10 relative lg:shadow-lg lg:rounded-lg">
        <div className="text-left mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">Login To GoCeylon</h2>
          <p className="text-sm mt-2 text-gray-500">Discover Sri Lanka’s stunning destinations, rich culture, and unforgettable tours.</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="h-4 w-4 text-[#007a55]" />
              <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
            </div>
            <Link to="/reset" className="text-sm text-[#007a55] hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-[#007a55] text-white py-3 rounded-lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4">
          <p className="text-center text-gray-500 text-sm">OR <Link to="/register" className="text-sm text-[#007a55] hover:underline">Sign Up</Link></p>
        </div>

      </div>
    </div>
  );
};

export default Login;
