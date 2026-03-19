import React, { useState, useEffect } from 'react';
import { User, MapPin, TreePine, Phone, ArrowLeft, Save } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function EditProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    region: '',
    treeCount: ''
  });

  const [coffeeTypes, setCoffeeTypes] = useState({
    'SL-28': false, 'SL-34': false, 'Ruiru 11': false, 'Batian': false, 'K7': false
  });

  // Load existing profile data when the page opens
  useEffect(() => {
    const savedProfile = localStorage.getItem('farmerProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserId(profile._id);
      
      setFormData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        region: profile.region || '',
        treeCount: profile.treeCount || ''
      });

      // Check the boxes for the coffee types they already have
      if (profile.coffeeTypes) {
        const updatedTypes = { ...coffeeTypes };
        profile.coffeeTypes.forEach(type => {
          if (updatedTypes[type] !== undefined) updatedTypes[type] = true;
        });
        setCoffeeTypes(updatedTypes);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setCoffeeTypes({ ...coffeeTypes, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const selectedTypes = Object.keys(coffeeTypes).filter(type => coffeeTypes[type]);

    const updatedProfile = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      region: formData.region,
      treeCount: Number(formData.treeCount),
      coffeeTypes: selectedTypes
    };

    try {
      // 1. Send the data to your new Express backend route!
      const response = await axios.put(`http://localhost:5000/api/users/update/${userId}`, updatedProfile);
      
      // 2. Save the official, updated data straight from the database into local storage
      localStorage.setItem('farmerProfile', JSON.stringify(response.data.data));

      setSuccess("Profile updated successfully!");
      
      // 3. Send them back to the dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Could not update profile. Please try again.");
    }
};
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Edit Profile</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Update your farm details and personal info.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium mb-6">{success}</div>}

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
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" required />
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
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {Object.keys(coffeeTypes).map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name={type} checked={coffeeTypes[type]} onChange={handleCheckboxChange} className="w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500" />
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition mt-6 flex items-center justify-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}