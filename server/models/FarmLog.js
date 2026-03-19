const mongoose = require('mongoose');

const FarmLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  activityType: { 
    type: String, 
    // Expanded to include the words the AI likes to use
    enum: ['Pruning', 'Spraying', 'Planting', 'Weeding', 'Fertilizing', 'Observation', 'Check-in', 'Note', 'Harvest', 'Other'], 
    required: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('FarmLog', FarmLogSchema);