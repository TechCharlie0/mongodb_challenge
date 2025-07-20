const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');

module.exports = function (passport, users) { // 'users' array is passed from app.js

    // --- Passport Serialization and Deserialization ---
    // These functions determine what user data to store in the session
    // and how to retrieve the user object from the session.

    // Serialize user: Store only the user ID in the session
    passport.serializeUser((user, done) => {
        done(null, user.id); // 'user.id' is the unique identifier for the user
    });

    // Deserialize user: Retrieve the full user object from the ID stored in the session
    passport.deserializeUser((id, done) => {
        const user = users.find(u => u.id === id); // Find user by ID in our in-memory array
        if (user) {
            done(null, user); // User found, return the user object
        } else {
            done(new Error('User not found'), null); // User not found
        }
    }
    );

    // --- Local Strategy (Email/Password) ---
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            // Find user by email in our in-memory array
            const user = users.find(u => u.email === email);

            if (!user) {
                return done(null, false, { message: 'No user found with that email.' });
            }

            // Compare provided password with stored hashed password
            try {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user); // Passwords match, authentication successful
                } else {
                    return done(null, false, { message: 'Password incorrect.' });
                }
            } catch (err) {
                return done(err); // Handle any errors during password comparison
            }
        })
    );

    // --- Google OAuth 2.0 Strategy ---
    passport.use(
        new GoogleStrategy(
            {
                clientID: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
                clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your actual Google Client Secret
                callbackURL: '/auth/google/callback', // This must match your Google Console redirect URI
            },
            async (accessToken, refreshToken, profile, done) => {
                // Check if a user with this Google ID already exists
                let user = users.find(u => u.googleId === profile.id);

                if (user) {
                    return done(null, user); // User found, return existing user
                } else {
                    // If no user, create a new one
                    const newUser = {
                        id: users.length + 1, // Simple ID generation
                        googleId: profile.id,
                        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
                        name: profile.displayName || (profile.emails && profile.emails.length > 0 ? profile.emails[0].value.split('@')[0] : 'Google User'), // Use display name or email part
                        profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : 'https://placehold.co/120x120/ffffff/000000?text=Profile',
                        gender: 'N/A', // Google might not provide gender directly, prompt user later
                        location: 'N/A', // Google might not provide location directly, prompt user later
                        bio: 'Joined via Google!',
                        age: 'N/A',
                    };
                    users.push(newUser); // Add new user to our in-memory array
                    console.log('New user registered via Google:', newUser);
                    return done(null, newUser); // Return the newly created user
                }
            }
        )
    );

    // --- Facebook Strategy ---
    passport.use(
        new FacebookStrategy(
            {
                clientID: 'YOUR_FACEBOOK_APP_ID', // Replace with your actual Facebook App ID
                clientSecret: 'YOUR_FACEBOOK_APP_SECRET', // Replace with your actual Facebook App Secret
                callbackURL: '/auth/facebook/callback', // This must match your Facebook App redirect URI
                profileFields: ['id', 'displayName', 'photos', 'email'], // Request these fields from Facebook
            },
            async (accessToken, refreshToken, profile, done) => {
                // Check if a user with this Facebook ID already exists
                let user = users.find(u => u.id === profile.id); // Changed from facebookId to id for consistency with in-memory users array

                if (user) {
                    return done(null, user); // User found, return existing user
                } else {
                    // If no user, create a new one
                    const newUser = {
                        id: users.length + 1, // Simple ID generation
                        facebookId: profile.id,
                        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
                        name: profile.displayName || (profile.emails && profile.emails.length > 0 ? profile.emails[0].value.split('@')[0] : 'Facebook User'), // Use display name or email part
                        profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : 'https://placehold.co/120x120/ffffff/000000?text=Profile',
                        gender: 'N/A', // Facebook might not provide gender directly, prompt user later
                        location: 'N/A', // Facebook might not provide location directly, prompt user later
                        bio: 'Joined via Facebook!',
                        age: 'N/A',
                    };
                    users.push(newUser); // Add new user to our in-memory array
                    console.log('New user registered via Facebook:', newUser);
                    return done(null, newUser); // Return the newly created user
                }
            }
        )
    );
};
