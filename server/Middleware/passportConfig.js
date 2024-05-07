const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sendWelcomeEmail = require('../Utility/mail');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 20,
    port: process.env.DB_PORT,
    waitForConnections: true
});

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    session: true // Enable session support
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const connection = await pool.getConnection();
        const [existingUser] = await connection.query("SELECT * FROM techcoach_lite.techcoach_task WHERE email=?", [profile.email]);
        connection.release();

        if (!existingUser || existingUser.length === 0) { // Check if existingUser is undefined or empty array
            // Insert the new user
            const user = await connection.query("INSERT INTO techcoach_lite.techcoach_task (displayname, email) VALUES (?, ?) RETURNING* ", [profile.displayName, profile.email]);
            // console.log(user,"jfjyfku")
            sendWelcomeEmail(user);
            logLoginHistory(user.user_id);

            return done(null, { id: user[0].user_id, email: profile.email }); // Pass user info along with token
        }

        logLoginHistory(existingUser.user_id); // Log login history
        console.log(logLoginHistory, 'history')
        // console.log(existingUser,"kkkkkkkkk")
        return done(null, { id: existingUser.user_id, email: profile.email }); // Pass user info along with token

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

// Function to log login history
async function logLoginHistory(userId) {
    try {
        const connection = await pool.getConnection();
        await connection.query("INSERT INTO techcoach_lite.techcoach_login_history (user_id, login_time) VALUES (?, NOW())", [userId]);
        connection.release();
    } catch (error) {
        console.error("Error logging login history:", error);
    }
}
module.exports = passport;

