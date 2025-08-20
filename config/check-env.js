// Production environment variable checker
console.log('Checking environment variables...');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('EMAIL_HOST exists:', !!process.env.EMAIL_HOST);
console.log('EMAIL_PORT exists:', !!process.env.EMAIL_PORT);

// Add this near the top of your app.js, right after dotenv import
if (!process.env.JWT_SECRET) {
    console.error('⚠️ JWT_SECRET is not set in environment variables!');
    process.exit(1); // This will prevent the app from starting without JWT_SECRET
}
