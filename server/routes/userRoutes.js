const express = require('express');
const router = express.Router();

// Import the exact names from your controller
const { registerUser, loginUser, updateProfile } = require('../controllers/userController'); 

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.put('/update/:id', updateProfile); // Our new update route!

module.exports = router;