import React, { useState } from 'react';
import { Phone, Lock, Leaf } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setAuth }) {
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
      const response = await axios.post('https://farm-keep-pm47.onrender.com/api/users/login', credentials);
      
      // 1. Save to storage
      localStorage.setItem('farmerProfile', JSON.stringify(response.data.data));
      
      // 2. IMPORTANT: Update App.jsx state immediately
      setAuth(true);
      
      // 3. Navigate to dashboard
      navigate('/dashboard');
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
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Phone size={18} /></span>
              <input name="phoneNumber" type="tel" value={credentials.phoneNumber} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3" placeholder="07XX XXX XXX" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Lock size={18} /></span>
              <input name="pin" type="password" maxLength="4" value={credentials.pin} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3" placeholder="••••" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition mt-6">Log In</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/signup" className="text-green-600 font-bold hover:underline">Sign up here</Link></p>
      </div>
    </div>
  );
}