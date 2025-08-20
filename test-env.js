import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Environment Variables Test\n');
console.log('=============================');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'Not set ❌');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set ❌');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'Not set ❌');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '********' : 'Not set ❌');
console.log('=============================\n');

// Check if .env file exists
import fs from 'fs';
const envPath = path.join(__dirname, '.env');
console.log('.env file exists:', fs.existsSync(envPath) ? 'Yes ✅' : 'No ❌');
if (fs.existsSync(envPath)) {
    console.log('\nFirst few characters of .env file (for verification):');
    const envContent = fs.readFileSync(envPath, 'utf8').slice(0, 50);
    console.log(envContent + '...');
}
