import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Question from './models/Question.js';
import Answer from './models/Answer.js';
import Comment from './models/Comment.js';
import 'dotenv/config';

// Indian names and locations for realistic data
const indianNames = [
    'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Anjali Singh', 'Vikram Gupta',
    'Kavita Reddy', 'Amit Jain', 'Sneha Agarwal', 'Rohit Verma', 'Pooja Shah',
    'Sandeep Joshi', 'Meera Iyer', 'Karan Malhotra', 'Divya Chopra', 'Rajesh Nair',
    'Sunita Rao', 'Vivek Bansal', 'Neha Kapoor', 'Sachin Yadav', 'Kiran Desai',
    'Mohan Pillai', 'Rekha Menon', 'Deepak Saxena', 'Asha Bhatt', 'Naveen Tiwari',
    'Lakshmi Venkatesh', 'Pradeep Kumar', 'Sarika Jain', 'Ravi Shankar', 'Maya Krishnan'
];

const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
    'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

const techTags = [
    'javascript', 'python', 'java', 'react', 'nodejs', 'mongodb', 'mysql',
    'html', 'css', 'angular', 'vuejs', 'django', 'flask', 'spring-boot',
    'android', 'ios', 'flutter', 'dart', 'machine-learning', 'ai', 'data-science',
    'blockchain', 'cloud', 'aws', 'azure', 'docker', 'kubernetes', 'git',
    'linux', 'windows', 'mobile-development', 'web-development', 'api', 'rest'
];

const programmingQuestions = [
    {
        title: 'How to implement JWT authentication in Node.js with MongoDB?',
        body: 'I am building a MERN stack application and need to implement secure authentication. Can someone guide me through implementing JWT tokens with refresh tokens in Node.js and storing user sessions in MongoDB?',
        tags: ['nodejs', 'jwt', 'mongodb', 'authentication', 'mern']
    },
    {
        title: 'React Native vs Flutter: Which is better for Indian market?',
        body: 'As a developer in India, I want to build cross-platform mobile apps. React Native and Flutter both seem promising. Which one has better community support, job opportunities, and performance for the Indian tech ecosystem?',
        tags: ['react-native', 'flutter', 'mobile-development', 'cross-platform']
    },
    {
        title: 'Best practices for handling large datasets in MongoDB with Node.js',
        body: 'My application deals with millions of records. How can I optimize MongoDB queries, implement proper indexing, and handle pagination efficiently in a Node.js application?',
        tags: ['mongodb', 'nodejs', 'performance', 'database', 'optimization']
    },
    {
        title: 'Machine Learning with Python: Getting started guide for beginners',
        body: 'I am a college student in India interested in ML. I know basic Python. What libraries should I learn first? Can you suggest a learning path for someone starting from scratch?',
        tags: ['python', 'machine-learning', 'beginner', 'data-science', 'tutorial']
    },
    {
        title: 'Building REST APIs with Express.js: Best security practices',
        body: 'I am developing a REST API using Express.js for an e-commerce platform. What are the essential security measures I should implement? Rate limiting, input validation, CORS, etc.',
        tags: ['express', 'rest-api', 'security', 'nodejs', 'backend']
    },
    {
        title: 'Android development: Kotlin vs Java in 2024',
        body: 'Should I learn Kotlin or stick with Java for Android development? I see many Indian companies still using Java. What are the pros and cons for the Indian job market?',
        tags: ['android', 'kotlin', 'java', 'mobile-development']
    },
    {
        title: 'Deploying Node.js applications on AWS: Cost-effective approach',
        body: 'I have a Node.js application with MongoDB. I want to deploy it on AWS but keep costs low. What services should I use? EC2, Lambda, Elastic Beanstalk? Any suggestions for Indian developers?',
        tags: ['aws', 'nodejs', 'deployment', 'cloud', 'cost-optimization']
    },
    {
        title: 'React performance optimization techniques',
        body: 'My React application is slow. I have large lists, complex components, and frequent re-renders. What optimization techniques should I implement? Memo, useCallback, virtualization?',
        tags: ['react', 'performance', 'optimization', 'frontend', 'javascript']
    },
    {
        title: 'Blockchain development in India: Opportunities and challenges',
        body: 'I am interested in blockchain development. What are the current opportunities in India? Which blockchain platforms are popular? Ethereum, Hyperledger, or others?',
        tags: ['blockchain', 'ethereum', 'hyperledger', 'career', 'india']
    },
    {
        title: 'Docker containerization for microservices architecture',
        body: 'I am designing a microservices architecture for an Indian fintech startup. How should I containerize my services using Docker? Best practices for multi-stage builds, networking, and orchestration?',
        tags: ['docker', 'microservices', 'containerization', 'kubernetes', 'devops']
    },
    {
        title: 'Data Science career path in India: Skills and certifications',
        body: 'I want to become a data scientist in India. What skills should I learn? Python, R, SQL, ML algorithms? Which certifications are valuable? Should I pursue higher education?',
        tags: ['data-science', 'career', 'python', 'machine-learning', 'certification']
    },
    {
        title: 'Flutter vs React Native: Performance comparison for Indian apps',
        body: 'I need to build apps for both Android and iOS for the Indian market. Which framework gives better performance? How do they handle device fragmentation in India?',
        tags: ['flutter', 'react-native', 'performance', 'mobile-development', 'india']
    },
    {
        title: 'Securing MERN stack applications: Complete guide',
        body: 'I have built a MERN stack application for an Indian e-commerce platform. What security measures should I implement? Helmet, rate limiting, input sanitization, JWT security, etc.',
        tags: ['mern', 'security', 'authentication', 'nodejs', 'mongodb']
    },
    {
        title: 'Python web frameworks: Django vs Flask for Indian startups',
        body: 'I am starting a tech startup in India. Should I use Django or Flask for web development? Which one scales better? What are the hiring challenges for each in India?',
        tags: ['python', 'django', 'flask', 'web-development', 'startup']
    },
    {
        title: 'Mobile app monetization strategies in India',
        body: 'I have built a mobile app for the Indian market. What are the best monetization strategies? In-app purchases, ads, subscriptions? Any legal considerations for Indian developers?',
        tags: ['mobile-development', 'monetization', 'startup', 'india', 'business']
    }
];

const sampleAnswers = [
    'Great question! For JWT authentication in Node.js, you should use the jsonwebtoken library. Here\'s a basic implementation...',
    'In my experience working with both frameworks, Flutter has better performance and a more consistent UI across platforms. However, React Native has a larger community in India.',
    'For large datasets, implement proper indexing on frequently queried fields. Use aggregation pipelines for complex queries and consider pagination with skip() and limit().',
    'Start with NumPy and Pandas for data manipulation, then move to scikit-learn for ML algorithms. TensorFlow or PyTorch for deep learning. Practice on Kaggle datasets.',
    'Essential security practices include: input validation with Joi, rate limiting with express-rate-limit, CORS configuration, helmet for security headers, and bcrypt for password hashing.',
    'Kotlin is definitely the future for Android development. It\'s more concise and has better null safety. Most Indian companies are transitioning to Kotlin.',
    'For cost-effective AWS deployment, use Elastic Beanstalk for simplicity or Lambda for serverless. Use EC2 free tier for development. Consider AWS Lightsail for small applications.',
    'Use React.memo for component memoization, useCallback for event handlers, and react-window for virtualizing large lists. Implement code splitting and lazy loading.',
    'Blockchain opportunities in India are growing, especially in fintech and supply chain. Ethereum is popular, but Hyperledger Fabric is gaining traction for enterprise solutions.',
    'Use multi-stage Docker builds to reduce image size. Implement proper networking with docker-compose. Use Kubernetes for orchestration in production environments.',
    'Focus on Python, SQL, statistics, and ML algorithms. Certifications like TensorFlow Developer Certificate are valuable. Many Indian companies hire based on skills rather than degrees.',
    'Flutter generally offers better performance due to its compiled nature. It handles device fragmentation well with its own rendering engine.',
    'Implement helmet for security headers, rate limiting, input validation, JWT with proper expiration, password hashing with bcrypt, and regular security audits.',
    'Django is better for rapid development and has more built-in features. Flask is more flexible but requires more setup. Django is easier to hire for in India.',
    'In-app purchases work well in India, but consider UPI integration. Freemium model with premium features. Be aware of Google Play and App Store policies for Indian developers.'
];

const sampleComments = [
    'This is very helpful, thanks!',
    'Can you provide a code example?',
    'I have the same question!',
    'Great explanation!',
    'This solved my problem.',
    'Could you elaborate on this point?',
    'Very comprehensive answer.',
    'I tried this but it didn\'t work.',
    'Perfect solution!',
    'Thanks for sharing this knowledge.'
];

async function createMockUsers() {
    console.log('Creating mock users...');
    const users = [];

    for (let i = 0; i < 25; i++) {
        const name = indianNames[i % indianNames.length];
        const [firstName, lastName] = name.split(' ');
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`;
        const email = `${username}@gmail.com`;
        const location = indianCities[i % indianCities.length];

        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: Math.random() > 0.3, // 70% verified
            isAdmin: i === 0, // First user is admin
            reputation: Math.floor(Math.random() * 5000) + 100,
            badges: ['helpful', 'curious'][Math.floor(Math.random() * 2)],
            profile: {
                fullName: name,
                bio: `Software developer from ${location}. Passionate about technology and coding.`,
                location,
                website: `https://${username}.dev`,
                tags: techTags.slice(0, Math.floor(Math.random() * 5) + 1)
            },
            settings: {
                theme: ['light', 'dark', 'auto'][Math.floor(Math.random() * 3)],
                language: 'en',
                emailNotifications: Math.random() > 0.2,
                pushNotifications: Math.random() > 0.3
            }
        });

        await user.save();
        users.push(user);
        console.log(`Created user: ${name}`);
    }

    return users;
}

async function createMockQuestions(users) {
    console.log('Creating mock questions...');
    const questions = [];

    for (let i = 0; i < programmingQuestions.length; i++) {
        const question = programmingQuestions[i];
        const user = users[Math.floor(Math.random() * users.length)];

        const newQuestion = new Question({
            user: user._id,
            title: question.title,
            body: question.body,
            tags: question.tags,
            votes: Math.floor(Math.random() * 50),
            isActive: true
        });

        await newQuestion.save();
        questions.push(newQuestion);
        console.log(`Created question: ${question.title.substring(0, 50)}...`);
    }

    return questions;
}

async function createMockAnswers(users, questions) {
    console.log('Creating mock answers...');
    const answers = [];

    for (const question of questions) {
        // Each question gets 2-5 answers
        const numAnswers = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < numAnswers; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const answerText = sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)];

            const answer = new Answer({
                user: user._id,
                question: question._id,
                body: answerText,
                votes: Math.floor(Math.random() * 30),
                isAccepted: i === 0 && Math.random() > 0.7 // First answer sometimes accepted
            });

            await answer.save();
            answers.push(answer);

            // Add answer to question's answers array
            question.answers.push(answer._id);
            await question.save();
        }

        console.log(`Created ${numAnswers} answers for question: ${question.title.substring(0, 30)}...`);
    }

    return answers;
}

async function createMockComments(users, questions, answers) {
    console.log('Creating mock comments...');
    const comments = [];

    // Comments on questions
    for (const question of questions) {
        if (Math.random() > 0.5) { // 50% chance of having comments
            const numComments = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numComments; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];

                const comment = new Comment({
                    user: user._id,
                    body: commentText,
                    contentId: question._id,
                    contentType: 'question'
                });

                await comment.save();
                comments.push(comment);

                // Add comment to question's comments array
                question.comments.push(comment._id);
                await question.save();
            }
        }
    }

    // Comments on answers
    for (const answer of answers) {
        if (Math.random() > 0.6) { // 40% chance of having comments
            const numComments = Math.floor(Math.random() * 2) + 1;

            for (let i = 0; i < numComments; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];

                const comment = new Comment({
                    user: user._id,
                    body: commentText,
                    contentId: answer._id,
                    contentType: 'answer'
                });

                await comment.save();
                comments.push(comment);

                // Add comment to answer's comments array
                answer.comments.push(comment._id);
                await answer.save();
            }
        }
    }

    console.log(`Created ${comments.length} comments`);
    return comments;
}

async function createSocialConnections(users) {
    console.log('Creating social connections...');

    for (const user of users) {
        // Add some followers and following
        const numConnections = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < numConnections; i++) {
            const otherUser = users[Math.floor(Math.random() * users.length)];

            if (otherUser._id.toString() !== user._id.toString()) {
                // Add following
                if (!user.following.includes(otherUser._id)) {
                    user.following.push(otherUser._id);
                    otherUser.followers.push(user._id);
                }

                // Sometimes add as friends
                if (Math.random() > 0.8) {
                    if (!user.friends.includes(otherUser._id)) {
                        user.friends.push(otherUser._id);
                        otherUser.friends.push(user._id);
                    }
                }
            }
        }

        await user.save();
    }

    console.log('Social connections created');
}

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://labworkcharusataiml:54BdZtLCfVjVgesP@cluster0.ivruja7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Question.deleteMany({});
        await Answer.deleteMany({});
        await Comment.deleteMany({});

        // Create mock data
        const users = await createMockUsers();
        const questions = await createMockQuestions(users);
        const answers = await createMockAnswers(users, questions);
        const comments = await createMockComments(users, questions, answers);
        await createSocialConnections(users);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   👥 Users: ${users.length}`);
        console.log(`   ❓ Questions: ${questions.length}`);
        console.log(`   💡 Answers: ${answers.length}`);
        console.log(`   💬 Comments: ${comments.length}`);

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding function
seedDatabase();