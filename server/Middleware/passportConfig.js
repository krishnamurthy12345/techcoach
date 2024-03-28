const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mariadb = require('mariadb');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 5,
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
        const [existingUser] = await connection.query("SELECT * FROM techcoach_lite.task1 WHERE googleId=?", [profile.id]);
        if (!existingUser) {
            await connection.query("INSERT INTO techcoach_lite.task1 (googleId, displayName, email) VALUES (?, ?, ?)", [profile.id, profile.displayName, profile.email]);
        }
        connection.release();
        const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET_KEY);
        return done(null, profile);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;
