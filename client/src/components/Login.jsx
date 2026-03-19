import React, { useState } from 'react';
import { Phone, Lock, Leaf } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ phoneNumber: '', pin: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', credentials);
      
      // Save the user profile to memory so the AI and Dashboard know who logged in
      localStorage.setItem('farmerProfile', JSON.stringify(response.data.data));
      
      // Redirect to Dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log in. Please check your details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-sm border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700 mx-auto mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">Log in to manage your farm and expenses.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input 
                type="tel" 
                name="phoneNumber"
                value={credentials.phoneNumber}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="07XX XXX XXX"
                required
              />
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                name="pin"
                maxLength="4"
                pattern="\d{4}"
                value={credentials.pin}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest"
                placeholder="••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition mt-6"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/signup" className="text-green-600 font-bold hover:underline">Sign up here</Link>
        </p>

      </div>
    </div>
  );
}