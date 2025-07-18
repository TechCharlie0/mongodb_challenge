const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        // Exclude sensitive data
        const { password, ...userData } = user;
        res.json(userData);
    } catch (err) {
        next(err);
    }
};

exports.updateUserProfile = async (req, res, next) => {
    const userId = req.user.id; // From auth middleware
    const { username, email, bio, profile_picture_url, gender, interested_in, dob, location } = req.body;

    try {
        const updatedUser = {};
        if (username) updatedUser.username = username;
        if (email) updatedUser.email = email;
        if (bio) updatedUser.bio = bio;
        if (profile_picture_url) updatedUser.profile_picture_url = profile_picture_url;
        if (gender) updatedUser.gender = gender;
        if (interested_in) updatedUser.interested_in = interested_in;
        if (dob) updatedUser.dob = dob;
        if (location) updatedUser.location = location;

        const success = await User.update(userId, updatedUser);
        if (!success) {
            return res.status(400).json({ msg: 'User update failed' });
        }

        res.json({ msg: 'Profile updated successfully' });
    } catch (err) {
        next(err);
    }
};

// Example for profile picture upload (requires `multer` setup)
exports.uploadProfilePicture = async (req, res, next) => {
    // This is a placeholder. You'd use `multer` middleware before this controller.
    // Example: app.post('/api/users/profile/picture', authMiddleware, upload.single('profilePicture'), userController.uploadProfilePicture);

    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const profile_picture_url = `/uploads/${req.file.filename}`; // Or a cloud storage URL

        const success = await User.update(req.user.id, { profile_picture_url });
        if (!success) {
            return res.status(500).json({ msg: 'Failed to update profile picture URL in database' });
        }

        res.json({ msg: 'Profile picture uploaded successfully', profile_picture_url });
    } catch (err) {
        next(err);
    }
};