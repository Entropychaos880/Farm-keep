import React, { useState } from 'react';
import { User, MapPin, TreePine, Leaf, Phone, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    pin: '',
    region: '',
    treeCount: ''
  });

  const [coffeeTypes, setCoffeeTypes] = useState({
    'SL-28': false, 'SL-34': false, 'Ruiru 11': false, 'Batian': false, 'K7': false
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setCoffeeTypes({ ...coffeeTypes, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const selectedTypes = Object.keys(coffeeTypes).filter(type => coffeeTypes[type]);

    const completeProfile = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      pin: formData.pin,
      region: formData.region,
      treeCount: Number(formData.treeCount),
      coffeeTypes: selectedTypes
    };

    try {
      const response = await axios.post('https://farm-keep-pm47.onrender.com/api/users/signup', completeProfile);
      localStorage.setItem('farmerProfile', JSON.stringify(response.data.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Could not save profile. Check the console for details.");
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-gray-50 flex items-center justify-center p-4 py-12 overflow-hidden">
      
      {/* BACKGROUND IMAGE: Pinned to the right, behind the form */}
      <div 
        className="absolute top-0 right-0 h-full w-full lg:w-[65%] bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=1400&auto=format&fit=crop')" }}
      >
        {/* Overlays to make it subtle and blend smoothly into the left side */}
        <div className="absolute inset-0 bg-green-950/30 mix-blend-multiply"></div>
        <div className="absolute inset-y-0 left-0 w-full lg:w-64 bg-gradient-to-r from-gray-50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent lg:hidden"></div>
      </div>

      {/* FORM CARD: Centered, floating over the background */}
      <div className="relative z-20 bg-white max-w-md w-full rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10">
        
        <div className="text-left mb-8">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 mb-6 shadow-sm">
            <Leaf size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Create Profile</h1>
          <p className="text-md text-gray-500 mt-2 font-medium">Set up your account to receive personalized AI advice.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={18} /></div>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="07XX XXX XXX" required />
            </div>
          </div>

          {/* 4-Digit PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Create 4-Digit PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={18} /></div>
              <input type="password" name="pin" maxLength="4" pattern="\d{4}" value={formData.pin} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 tracking-widest" placeholder="••••" required />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region / County</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={18} /></div>
              <input type="text" name="region" value={formData.region} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
            </div>
          </div>

          {/* Number of Trees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Number of Trees</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><TreePine size={18} /></div>
              <input type="number" name="treeCount" value={formData.treeCount} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
            </div>
          </div>

          {/* Coffee Varieties */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Coffee Varieties Grown</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(coffeeTypes).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name={type} checked={coffeeTypes[type]} onChange={handleCheckboxChange} className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500" />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition mt-6">
            Create Profile
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-green-600 font-bold hover:underline">Log in</Link>
        </p>
          
      </div>
    </div>
  );
}