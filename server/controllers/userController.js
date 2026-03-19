const User = require('../models/User');

// 1. SIGN UP
exports.registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: "This phone number is already registered." });
    }
    console.error("Failed to save user:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// 2. LOG IN
exports.loginUser = async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;
    
    const user = await User.findOne({ phoneNumber, pin });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid phone number or PIN." });
    }

    res.status(200).json({ success: true, data: user });
    
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: "Server error during login." });
  }
};

// 3. UPDATE PROFILE// 3. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params; 
    const updateData = req.body; 

    // FIXED: Swapped 'new: true' for 'returnDocument: 'after''
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { returnDocument: 'after', runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("🚨 PROFILE UPDATE ERROR:", error.message);
    res.status(500).json({ success: false, error: "Could not update profile on the server." });
  }
};