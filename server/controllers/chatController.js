const Chat = require('../models/Chat');

// FETCH CHAT HISTORY
exports.getChat = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const chatDoc = await Chat.findOne({ userId });
    
    // If the user has never chatted before, return an empty array
    if (!chatDoc) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: chatDoc.messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ success: false, error: 'Server Error fetching chat history' });
  }
};

// SAVE OR UPDATE CHAT HISTORY
exports.updateChat = async (req, res) => {
  try {
    const { userId, messages } = req.body;

    if (!userId || !messages) {
      return res.status(400).json({ success: false, error: 'User ID and messages array are required' });
    }

    // Upsert: If the document exists, update the messages array. 
    // If it does NOT exist, create a new document for this user.
    const updatedChat = await Chat.findOneAndUpdate(
      { userId },
      { messages },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updatedChat });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ success: false, error: 'Server Error saving chat history' });
  }
};

// CLEAR CHAT HISTORY
// SAVE OR UPDATE CHAT HISTORY
exports.updateChat = async (req, res) => {
  try {
    const { userId, messages } = req.body;

    if (!userId || !messages) {
      return res.status(400).json({ success: false, error: 'User ID and messages array are required' });
    }

    // FIXED: Swapped 'new: true' for 'returnDocument: 'after''
    const updatedChat = await Chat.findOneAndUpdate(
      { userId },
      { messages },
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json({ success: true, data: updatedChat });
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ success: false, error: 'Server Error saving chat history' });
  }
};

// CLEAR CHAT HISTORY
exports.clearChat = async (req, res) => {
  try {
    const { userId } = req.body; 

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // FIXED: Swapped 'new: true' for 'returnDocument: 'after''
    await Chat.findOneAndUpdate(
      { userId },
      { messages: [] }, 
      { returnDocument: 'after' }
    );

    res.status(200).json({ success: true, message: "Chat history cleared successfully." });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ success: false, error: 'Server Error clearing chat history' });
  }
};