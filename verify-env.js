import 'dotenv/config';

console.log('Environment Variables Status:');
console.log('---------------------------');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not Set');
