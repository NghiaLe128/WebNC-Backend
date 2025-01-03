const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt")
dotenv.config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/Users'); 

// Authentication middleware
const authMiddleware = () => (req, res, next) => {
    const authHeader = req.headers['authorization']; // Use 'authorization' header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization token missing or invalid',
            status: 'ERR',
        });
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer'
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Your access token is invalid or expired',
                status: 'ERR',
            });
        }

        req.user = user; // Attach the user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Google OAuth2 strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            //callbackURL: 'https://web-backend-q0is.onrender.com/user/auth/google/callback',
            callbackURL: 'http://localhost:4000/user/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // If the user doesn't exist, create a new one
                    const hashedPassword = await bcrypt.hash("Abcde12345@", 10); // Hash the default password

                    user = await User.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        password: hashedPassword, // Save hashed password
                    });
                } else {
                    // If user exists, update the user record (avoid overwriting password)
                    user.email = profile.emails[0].value;
                    user.username = profile.displayName;
                    user.googleId = profile.id;
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    authMiddleware,
    passport
};
