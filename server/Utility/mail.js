const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

function sendWelcomeEmail(user) {

    console.log("hdhhdhhdhdhd",user);
    if (Array.isArray(user) && user.length > 0) {
        user.forEach(singleUser => {
            const { email, displayname } = singleUser;
            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: process.env.USER_EMAILNAME,
                subject: 'New User Added Techcoach_lite(Decision_APP)',
                text: `Welcome, ${displayname}!\n\nThank you for registering with Techcoach_lite (Decision_APP).\nYour email: ${email}`
            };
        
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        });
    } else {
        console.error("User data is not in the expected format.");
    }
}

module.exports = sendWelcomeEmail;
