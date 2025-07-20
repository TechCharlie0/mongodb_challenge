const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs'); // For password hashing
const bodyParser = require('body-parser');

// Assuming you have a User model (e.g., using Mongoose for MongoDB)
// const User = require('./models/User'); // Create this file

// Connect to your database here (e.g., Mongoose.connect('your_db_uri'))

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public')); // For static assets like CSS, JS
app.use(
    session({
        secret: 'your_secret_key', // Replace with a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
);
app.use(passport.initialize());
app.use(passport.session());

// --- Passport Local Strategy (for Email/Password Login) ---
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

// --- Passport Google OAuth Strategy ---
passport.use(
    new GoogleStrategy(
        {
            clientID: 'YOUR_GOOGLE_CLIENT_ID',
            clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName,
                        profilePic: profile.photos[0].value,
                        // You might need to ask for gender/location after initial signup
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// --- Passport Facebook OAuth Strategy ---
passport.use(
    new FacebookStrategy(
        {
            clientID: 'YOUR_FACEBOOK_APP_ID',
            clientSecret: 'YOUR_FACEBOOK_APP_SECRET',
            callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ facebookId: profile.id });
                if (!user) {
                    user = new User({
                        facebookId: profile.id,
                        email: profile.emails ? profile.emails[0].value : null, // Email might not always be available
                        name: profile.displayName,
                        profilePic: profile.photos ? profile.photos[0].value : null,
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

// Serialize and Deserialize user (required by Passport)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// --- Routes ---

// Signup Page
app.get('/signup', (req, res) => {
    res.render('signup', { error: req.flash('error') }); // Use connect-flash for error messages
});

// Handle Signup POST
app.post('/signup', async (req, res) => {
    const { email, password, gender, location } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already registered.');
            return res.redirect('/signup');
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password
        const newUser = new User({
            email,
            password: hashedPassword,
            gender,
            location,
            // Default values for other profile fields
            profilePic: 'https://placehold.co/120x120/ffffff/000000?text=Profile',
            bio: 'Ready to find my heartmatch!',
            age: 'N/A', // Or prompt user to enter age later
        });
        await newUser.save();
        req.login(newUser, (err) => {
            // Automatically log in after signup
            if (err) return next(err);
            res.redirect('/'); // Redirect to profile page after successful signup
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/signup');
    }
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error') });
});

// Handle Login POST
app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/', // Redirect to profile page on successful login
        failureRedirect: '/login',
        failureFlash: true, // Show flash messages for errors
    })
);

// Google OAuth routes
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login',
    })
);

// Facebook OAuth routes
app.get(
    '/auth/facebook',
    passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login',
    })
);

// Logout Route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        // req.logout is asynchronous in newer Passport versions
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

// Profile Page (requires authentication)
app.get('/', (req, res) => {
    if (!req.isAuthenticated()) {
        // Check if user is authenticated
        return res.redirect('/login');
    }
    res.render('index', { user: req.user }); // Pass user object to EJS
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});