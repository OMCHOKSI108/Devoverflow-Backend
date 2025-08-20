import 'dotenv/config';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Test JWT
console.log('\n🔑 Testing JWT Configuration:');
try {
    const token = jwt.sign({ test: true }, process.env.JWT_SECRET);
    console.log('✅ JWT Token generation successful');
} catch (error) {
    console.log('❌ JWT Error:', error.message);
}

// Test Email Configuration
console.log('\n📧 Testing Email Configuration:');
const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

console.log('Email Configuration:', {
    ...emailConfig,
    auth: {
        user: emailConfig.auth.user,
        pass: '********' // Hide password in logs
    }
});

// Test email connection
const transporter = nodemailer.createTransport(emailConfig);

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email Error:', error.message);
    } else {
        console.log('✅ Email server connection successful');
    }
});
