const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, index: true }, // Index added for faster logins
  pin: { type: String, required: true },
  region: { type: String, required: true },
  treeCount: { type: Number, required: true },
  coffeeTypes: [{ type: String }]
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('User', UserSchema);