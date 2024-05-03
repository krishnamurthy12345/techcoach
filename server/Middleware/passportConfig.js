const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sendWelcomeEmail = require('../Utility/mail');
const getConnection = require('../Models/database');



const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    session: true // Enable session support
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const connection = await getConnection();
        const [existingUser] = await connection.query("SELECT * FROM techcoach_lite.techcoach_task WHERE email=?", [profile.email]);
        connection.release();
        
        if (!existingUser || existingUser.length === 0) { // Check if existingUser is undefined or empty array
            // Insert the new user
            const user=await connection.query("INSERT INTO techcoach_lite.techcoach_task (displayname, email) VALUES (?, ?) RETURNING* ", [ profile.displayName, profile.email]);
            // console.log(user,"jfjyfku")
            sendWelcomeEmail(user);
            if (connection) connection.release()
            return done(null, { id: user[0].user_id, email: profile.email}); // Pass user info along with token
        }
        // console.log(existingUser,"kkkkkkkkk")
        if (connection) connection.release() 

        return done(null, { id: existingUser.user_id, email: profile.email}); // Pass user info along with token
        
        // Sign JWT token with user id and email
        // const token = jwt.sign({ id: profile.id, email: profile.email }, "111")

    } catch (error) {
        console.error("Error during authentication:", error);
        return done(error, null);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user); // Serialize user data
});

passport.deserializeUser((user, done) => {
    done(null, user); // Deserialize user data
});

module.exports = passport;
