const express = require('express');
const router = express.Router();

const users = [];

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    res.redirect('/login');
}

// Render login page
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/profile');
    res.render('login');
});

// Handle login post
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.render('login', { error: 'Invalid email or password.' });
    }

    req.session.user = { email };
    res.redirect('/profile');
});

// Render signup page
router.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/profile');
    res.render('signup');
});

// Handle signup post
router.post('/signup', (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.render('signup', { error: 'User already exists. Please login.' });
    }

    users.push({ email, password });
    res.redirect('/login');
});

// Profile page (protected)
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
