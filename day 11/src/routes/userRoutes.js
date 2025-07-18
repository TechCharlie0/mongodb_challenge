const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
// const multer = require('multer'); // Uncomment if using file uploads
// const upload = multer({ dest: 'uploads/' }); // Configure upload destination

router.get('/:id', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
// router.post('/profile/picture', authMiddleware, upload.single('profilePicture'), userController.uploadProfilePicture); // For image upload

module.exports = router;