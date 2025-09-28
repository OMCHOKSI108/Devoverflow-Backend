import mongoose from 'mongoose';
import User from './models/User.js';
import Question from './models/Question.js';
import Answer from './models/Answer.js';
import Comment from './models/Comment.js';
import 'dotenv/config';

async function verifySeededData() {
    try {
        console.log('🔍 Verifying seeded data...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://labworkcharusataiml:54BdZtLCfVjVgesP@cluster0.ivruja7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✅ Connected to MongoDB');

        // Count documents
        const userCount = await User.countDocuments();
        const questionCount = await Question.countDocuments();
        const answerCount = await Answer.countDocuments();
        const commentCount = await Comment.countDocuments();

        console.log('\n📊 Database Statistics:');
        console.log(`   👥 Total Users: ${userCount}`);
        console.log(`   ❓ Total Questions: ${questionCount}`);
        console.log(`   💡 Total Answers: ${answerCount}`);
        console.log(`   💬 Total Comments: ${commentCount}`);

        // Sample data verification
        console.log('\n🔍 Sample Data Check:');

        // Check users
        const sampleUsers = await User.find().limit(3).select('username profile.fullName profile.location reputation');
        console.log('\n👥 Sample Users:');
        sampleUsers.forEach(user => {
            console.log(`   - ${user.profile.fullName} (${user.username}) from ${user.profile.location} - ${user.reputation} rep`);
        });

        // Check questions
        const sampleQuestions = await Question.find().limit(3).select('title tags votes').populate('user', 'username');
        console.log('\n❓ Sample Questions:');
        sampleQuestions.forEach(q => {
            console.log(`   - "${q.title.substring(0, 50)}..." (${q.votes} votes) - Tags: ${q.tags.join(', ')}`);
        });

        // Check answers
        const sampleAnswers = await Answer.find().limit(3).select('body votes isAccepted').populate('user', 'username');
        console.log('\n💡 Sample Answers:');
        sampleAnswers.forEach(a => {
            console.log(`   - "${a.body.substring(0, 50)}..." (${a.votes} votes) ${a.isAccepted ? '[ACCEPTED]' : ''}`);
        });

        // Check social connections
        const userWithConnections = await User.findOne().select('username following followers friends');
        console.log('\n🤝 Social Connections Sample:');
        console.log(`   User: ${userWithConnections.username}`);
        console.log(`   Following: ${userWithConnections.following.length} users`);
        console.log(`   Followers: ${userWithConnections.followers.length} users`);
        console.log(`   Friends: ${userWithConnections.friends.length} users`);

        // Check admin user
        const adminUser = await User.findOne({ isAdmin: true }).select('username profile.fullName isAdmin');
        console.log('\n👑 Admin User:');
        console.log(`   ${adminUser.profile.fullName} (${adminUser.username}) - Admin: ${adminUser.isAdmin}`);

        console.log('\n✅ Data verification completed successfully!');
        console.log('🎉 Your DevOverflow database is ready with Indian mock data!');

        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error verifying data:', error);
        process.exit(1);
    }
}

// Run verification
verifySeededData();