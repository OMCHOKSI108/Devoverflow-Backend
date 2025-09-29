import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Question from './models/Question.js';
import Answer from './models/Answer.js';
import Comment from './models/Comment.js';
import Bookmark from './models/Bookmark.js';
import Group from './models/Group.js';
import Notification from './models/Notification.js';
import 'dotenv/config';

// Professional Indian user data
const indianUsers = [
    // Software Engineers
    {
        fullName: 'Arjun Sharma',
        username: 'arjun_sharma',
        email: 'arjun.sharma.dev@gmail.com',
        password: 'SecurePass123!',
        bio: 'Senior Software Engineer at Infosys with 5+ years experience in full-stack development. Passionate about clean code and scalable architectures.',
        location: 'Bangalore, Karnataka',
        website: 'https://arjunsharma.dev',
        tags: ['javascript', 'nodejs', 'react', 'mongodb', 'aws'],
        reputation: 1250,
        badges: ['Top Contributor', 'Problem Solver'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Priya Patel',
        username: 'priya_patel',
        email: 'priya.patel.engineer@gmail.com',
        password: 'SecurePass123!',
        bio: 'Full Stack Developer at TCS. Expert in MERN stack and cloud technologies. Love mentoring junior developers and contributing to open source.',
        location: 'Mumbai, Maharashtra',
        website: 'https://priyapatel.tech',
        tags: ['react', 'nodejs', 'python', 'docker', 'kubernetes'],
        reputation: 980,
        badges: ['Mentor', 'Code Reviewer'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Rahul Kumar',
        username: 'rahul_kumar',
        email: 'rahul.kumar.ml@gmail.com',
        password: 'SecurePass123!',
        bio: 'Machine Learning Engineer at Wipro. Specializing in computer vision and NLP. Published research papers on deep learning applications.',
        location: 'Hyderabad, Telangana',
        website: 'https://rahulkumar.ai',
        tags: ['python', 'machine-learning', 'tensorflow', 'computer-vision', 'nlp'],
        reputation: 1450,
        badges: ['AI Expert', 'Research Contributor'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Anjali Singh',
        username: 'anjali_singh',
        email: 'anjali.singh.mobile@gmail.com',
        password: 'SecurePass123!',
        bio: 'Mobile App Developer at HCL Technologies. Flutter and React Native specialist. Built 15+ apps for Indian startups and enterprises.',
        location: 'Delhi, NCR',
        website: 'https://anjalisingh.app',
        tags: ['flutter', 'react-native', 'dart', 'android', 'ios'],
        reputation: 1100,
        badges: ['Mobile Expert', 'App Developer'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Vikram Gupta',
        username: 'vikram_gupta',
        email: 'vikram.gupta.cloud@gmail.com',
        password: 'SecurePass123!',
        bio: 'Cloud Architect at Cognizant. AWS certified solutions architect. Helped 50+ Indian companies migrate to cloud infrastructure.',
        location: 'Pune, Maharashtra',
        website: 'https://vikramgupta.cloud',
        tags: ['aws', 'azure', 'cloud', 'devops', 'terraform'],
        reputation: 1350,
        badges: ['Cloud Expert', 'Architect'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Kavita Reddy',
        username: 'kavita_reddy',
        email: 'kavita.reddy.data@gmail.com',
        password: 'SecurePass123!',
        bio: 'Data Scientist at Tech Mahindra. Expert in Python, R, and big data analytics. Led data science projects for Indian banking sector.',
        location: 'Chennai, Tamil Nadu',
        website: 'https://kavitareddy.data',
        tags: ['python', 'r', 'data-science', 'sql', 'tableau'],
        reputation: 1180,
        badges: ['Data Scientist', 'Analytics Expert'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Amit Jain',
        username: 'amit_jain',
        email: 'amit.jain.security@gmail.com',
        password: 'SecurePass123!',
        bio: 'Cybersecurity Specialist at Deloitte India. CEH certified. Conducted security audits for 100+ Indian organizations.',
        location: 'Gurgaon, Haryana',
        website: 'https://amitjain.security',
        tags: ['cybersecurity', 'ethical-hacking', 'penetration-testing', 'owasp'],
        reputation: 920,
        badges: ['Security Expert', 'Auditor'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Sneha Agarwal',
        username: 'sneha_agarwal',
        email: 'sneha.agarwal.ui@gmail.com',
        password: 'SecurePass123!',
        bio: 'UI/UX Designer and Frontend Developer at Accenture. Created user experiences for Indian e-commerce giants and fintech startups.',
        location: 'Kolkata, West Bengal',
        website: 'https://snehaagarwal.design',
        tags: ['ui-ux', 'figma', 'adobe-xd', 'html', 'css', 'javascript'],
        reputation: 780,
        badges: ['Designer', 'Frontend Developer'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Rohit Verma',
        username: 'rohit_verma',
        email: 'rohit.verma.blockchain@gmail.com',
        password: 'SecurePass123!',
        bio: 'Blockchain Developer at IBM India. Smart contract expert on Ethereum and Hyperledger. Built DApps for Indian supply chain companies.',
        location: 'Ahmedabad, Gujarat',
        website: 'https://rohitverma.blockchain',
        tags: ['blockchain', 'ethereum', 'solidity', 'hyperledger', 'smart-contracts'],
        reputation: 1050,
        badges: ['Blockchain Expert', 'DApp Developer'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    {
        fullName: 'Pooja Shah',
        username: 'pooja_shah',
        email: 'pooja.shah.qa@gmail.com',
        password: 'SecurePass123!',
        bio: 'Quality Assurance Lead at Capgemini. SDET with expertise in automation testing. Improved testing efficiency by 70% in Indian projects.',
        location: 'Jaipur, Rajasthan',
        website: 'https://poojashah.qa',
        tags: ['selenium', 'automation-testing', 'cypress', 'jest', 'postman'],
        reputation: 650,
        badges: ['QA Expert', 'Automation Specialist'],
        privileges: ['vote_up', 'vote_down', 'comment', 'answer']
    },
    // Students and Junior Developers
    {
        fullName: 'Sandeep Joshi',
        username: 'sandeep_joshi',
        email: 'sandeep.joshi.student@gmail.com',
        password: 'SecurePass123!',
        bio: 'Computer Science student at IIT Delhi. Learning full-stack development. Aspiring to work in AI/ML after graduation.',
        location: 'Delhi, NCR',
        website: 'https://sandeepjoshi.github.io',
        tags: ['javascript', 'python', 'react', 'student', 'beginner'],
        reputation: 150,
        badges: ['Student', 'Enthusiast'],
        privileges: ['vote_up', 'comment', 'answer']
    },
    {
        fullName: 'Meera Iyer',
        username: 'meera_iyer',
        email: 'meera.iyer.intern@gmail.com',
        password: 'SecurePass123!',
        bio: 'Software Engineering intern at Zoho. Final year CSE student at Anna University. Passionate about web technologies and open source.',
        location: 'Chennai, Tamil Nadu',
        website: 'https://meeraiyer.dev',
        tags: ['java', 'spring-boot', 'mysql', 'intern', 'student'],
        reputation: 95,
        badges: ['Intern', 'Contributor'],
        privileges: ['vote_up', 'comment', 'answer']
    },
    {
        fullName: 'Karan Malhotra',
        username: 'karan_malhotra',
        email: 'karan.malhotra.fresher@gmail.com',
        password: 'SecurePass123!',
        bio: 'Fresh graduate from BITS Pilani. Full-stack developer looking for opportunities in Indian tech companies. Strong foundation in MERN stack.',
        location: 'Pilani, Rajasthan',
        website: 'https://karanmalhotra.dev',
        tags: ['mern', 'mongodb', 'express', 'react', 'nodejs'],
        reputation: 75,
        badges: ['Fresher', 'Graduate'],
        privileges: ['vote_up', 'comment', 'answer']
    },
    {
        fullName: 'Divya Chopra',
        username: 'divya_chopra',
        email: 'divya.chopra.trainee@gmail.com',
        password: 'SecurePass123!',
        bio: 'Trainee Software Developer at Infosys. Learning Java and microservices. Excited to start my career in software development.',
        location: 'Mysore, Karnataka',
        website: 'https://divyachopra.tech',
        tags: ['java', 'microservices', 'spring', 'trainee', 'beginner'],
        reputation: 45,
        badges: ['Trainee', 'Learner'],
        privileges: ['vote_up', 'comment']
    },
    {
        fullName: 'Rajesh Nair',
        username: 'rajesh_nair',
        email: 'rajesh.nair.bootcamp@gmail.com',
        password: 'SecurePass123!',
        bio: 'Completed Masai School full-stack bootcamp. Building projects and looking for junior developer roles in Indian startups.',
        location: 'Thiruvananthapuram, Kerala',
        website: 'https://rajeshnair.dev',
        tags: ['javascript', 'react', 'nodejs', 'bootcamp', 'portfolio'],
        reputation: 120,
        badges: ['Bootcamp Graduate', 'Project Builder'],
        privileges: ['vote_up', 'comment', 'answer']
    }
];

const professionalQuestions = [
    {
        title: 'Implementing JWT Authentication in MERN Stack for Indian FinTech Startup',
        body: 'I\'m developing a secure banking application for an Indian FinTech startup using MERN stack. How should I implement JWT authentication with refresh tokens? What are the security best practices specific to Indian banking regulations? Should I use Redis for token storage or stick with MongoDB?',
        tags: ['mern', 'jwt', 'authentication', 'security', 'fintech', 'india']
    },
    {
        title: 'Optimizing React Native App Performance for Low-End Android Devices in Rural India',
        body: 'My team is building an agricultural marketplace app targeting farmers in rural India who use low-end Android devices. The app is slow and crashes frequently. What optimization techniques should we implement? Should we consider Flutter instead? How can we reduce APK size while maintaining functionality?',
        tags: ['react-native', 'performance', 'android', 'optimization', 'rural-development']
    },
    {
        title: 'Building Scalable Microservices Architecture for Indian E-commerce Platform',
        body: 'We\'re designing a microservices architecture for a large Indian e-commerce platform similar to Flipkart. What technology stack would you recommend? How should we handle inter-service communication? What about service discovery, API gateway, and distributed transactions? Any experience with Indian-scale deployments?',
        tags: ['microservices', 'scalability', 'e-commerce', 'architecture', 'distributed-systems']
    },
    {
        title: 'Machine Learning for Fraud Detection in Indian Digital Payments',
        body: 'Working on fraud detection for UPI and digital payment systems in India. What ML algorithms work best for detecting payment fraud? How should we handle imbalanced datasets? What features are most important for Indian payment patterns? Any experience with NPCI data or Indian banking APIs?',
        tags: ['machine-learning', 'fraud-detection', 'payments', 'upi', 'indian-banking']
    },
    {
        title: 'Securing MERN Stack Applications Against Common Indian Cyber Threats',
        body: 'Developing a healthcare management system for Indian hospitals. What security measures should we implement to protect against common cyber threats in India? How should we handle data encryption for medical records? What compliance requirements apply for healthcare data under Indian laws?',
        tags: ['security', 'healthcare', 'encryption', 'compliance', 'indian-laws']
    },
    {
        title: 'Flutter vs React Native: Best Choice for Indian Government App Development',
        body: 'The Indian government is planning to develop a citizen services app. Which framework should we choose - Flutter or React Native? What are the considerations for government-scale deployments? How do they handle offline functionality for rural areas with poor connectivity?',
        tags: ['flutter', 'react-native', 'government', 'offline-first', 'scalability']
    },
    {
        title: 'Implementing Multi-Language Support for Indian Education Technology Platform',
        body: 'Building an EdTech platform for Indian students supporting 12 major Indian languages plus English. How should we implement i18n? What database design works best for multi-language content? How to handle RTL languages like Urdu and Arabic? Any experience with Indian language processing?',
        tags: ['i18n', 'localization', 'education', 'multi-language', 'indian-languages']
    },
    {
        title: 'Optimizing AWS Costs for Indian Startup with Variable Traffic',
        body: 'Running a SaaS platform on AWS serving Indian SMBs. Traffic varies greatly by time zone and season. How can we optimize costs while maintaining performance? Should we use spot instances, reserved instances, or serverless? What monitoring tools work best for Indian developers?',
        tags: ['aws', 'cost-optimization', 'serverless', 'monitoring', 'indian-startup']
    },
    {
        title: 'Building Real-time Collaboration Features for Indian Remote Teams',
        body: 'Developing a project management tool for distributed Indian development teams. How should we implement real-time collaboration features like live editing, notifications, and video calls? What technologies work best with unreliable Indian internet connections? How to handle timezone differences across India?',
        tags: ['real-time', 'collaboration', 'websockets', 'remote-work', 'indian-teams']
    },
    {
        title: 'Data Analytics for Indian Agricultural Supply Chain Optimization',
        body: 'Working with Indian farmers and retailers to optimize agricultural supply chain. What data analytics techniques should we use? How to predict demand and reduce wastage? What IoT sensors work best in Indian farming conditions? How to handle data from rural areas with poor connectivity?',
        tags: ['data-analytics', 'agriculture', 'supply-chain', 'iot', 'rural-connectivity']
    },
    {
        title: 'Implementing UPI Integration in React Native Mobile App',
        body: 'Building a payment app for Indian users requiring UPI integration. How should we implement UPI payment flows? What are the security requirements? How to handle different UPI apps (Google Pay, PhonePe, Paytm)? Any experience with NPCI integration?',
        tags: ['upi', 'payments', 'react-native', 'integration', 'npci']
    },
    {
        title: 'Blockchain Solutions for Indian Land Registry Modernization',
        body: 'The Indian government is modernizing land registry systems. How can blockchain improve transparency and reduce fraud? Which blockchain platform is suitable for government use? How to handle legacy data migration? What are the legal implications in Indian context?',
        tags: ['blockchain', 'government', 'land-registry', 'transparency', 'indian-law']
    },
    {
        title: 'AI-Powered Career Counseling for Indian Engineering Students',
        body: 'Developing an AI system to provide career counseling for Indian engineering students. What ML models work best for career prediction? How to incorporate Indian job market data? How to handle regional language preferences? What ethical considerations apply for career guidance?',
        tags: ['ai', 'career-counseling', 'education', 'indian-job-market', 'ethics']
    },
    {
        title: 'Progressive Web App Development for Indian Rural Internet Users',
        body: 'Building a PWA for agricultural information targeting rural Indian farmers with slow/expensive internet. How to optimize for poor connectivity? What caching strategies work best? How to handle offline functionality? Any experience with Indian rural deployments?',
        tags: ['pwa', 'offline-first', 'rural-development', 'caching', 'slow-networks']
    },
    {
        title: 'DevOps Pipeline for Indian Banking Application Deployments',
        body: 'Setting up CI/CD pipeline for a banking application serving Indian customers. What tools should we use? How to ensure compliance with RBI guidelines? How to handle database migrations safely? What monitoring and logging is required for financial applications?',
        tags: ['devops', 'ci-cd', 'banking', 'compliance', 'monitoring']
    }
];

const professionalAnswers = [
    'For Indian FinTech applications, implement JWT with short-lived access tokens (15 minutes) and longer refresh tokens (7 days). Use Redis for token blacklisting. Always encrypt sensitive data at rest and in transit. For RBI compliance, implement two-factor authentication and audit logging.',
    'Optimize React Native by implementing FlatList virtualization, image optimization, and code splitting. Use Hermes engine for better performance. Consider Flutter for its better low-end device support. Implement APK splitting and dynamic feature modules to reduce initial download size.',
    'Use Kubernetes for orchestration with Istio service mesh. Implement event-driven architecture with Kafka. Use API Gateway with rate limiting and authentication. Consider AWS EKS or Azure AKS for managed Kubernetes in India. Implement circuit breakers and distributed tracing.',
    'Use ensemble methods like Random Forest and XGBoost for fraud detection. Handle imbalanced data with SMOTE oversampling. Key features include transaction amount, frequency, location, device fingerprinting, and behavioral patterns. Implement real-time scoring with Apache Kafka.',
    'Implement OWASP security headers, input validation with Joi, rate limiting, and encryption. Use HIPAA-inspired security for healthcare data. Implement role-based access control and audit trails. Regular security audits and penetration testing are essential.',
    'Flutter offers better performance and smaller app size. It has excellent offline support with SQLite. For government apps, consider Flutter\'s better maintainability and single codebase. Implement proper data encryption for offline storage.',
    'Use React i18n with ICU message format. Store translations in MongoDB with language-specific collections. Implement RTL support with CSS logical properties. Use Google Translate API for dynamic translations. Consider regional language preferences in user profiles.',
    'Use AWS Lambda for variable workloads with provisioned concurrency. Implement auto-scaling with Application Auto Scaling. Use CloudWatch for monitoring and Cost Explorer for optimization. Consider spot instances for non-critical workloads during off-peak hours.',
    'Implement WebSockets with Socket.io for real-time features. Use Operational Transforms for collaborative editing. Implement offline-first architecture with conflict resolution. Use WebRTC for video calls with fallback to audio-only for poor connections.',
    'Implement time series analysis for demand forecasting. Use IoT sensors for soil moisture, temperature, and humidity. Deploy edge computing for rural areas. Use computer vision for crop disease detection. Implement blockchain for supply chain transparency.',
    'Use UPI deep linking and intent handling. Implement secure callback URLs. Handle multiple UPI apps with App Links. Use NPCI\'s UPI SDK for Android. Implement transaction status tracking and proper error handling for failed payments.',
    'Use Hyperledger Fabric for permissioned blockchain suitable for government use. Implement smart contracts for property transfers. Use IPFS for document storage. Ensure compliance with Indian IT Act and data protection laws.',
    'Use collaborative filtering and content-based recommendation systems. Incorporate Indian job market data from Naukri, LinkedIn, and Glassdoor. Implement multi-language support for regional preferences. Ensure unbiased algorithms and transparent decision-making.',
    'Implement service worker caching with Cache API. Use background sync for offline actions. Implement progressive loading and lazy loading. Use local storage with IndexedDB. Optimize images and implement CDN for faster loading.',
    'Use Jenkins or GitLab CI with security scanning. Implement blue-green deployments. Use HashiCorp Vault for secrets management. Implement comprehensive logging with ELK stack. Regular security audits and compliance monitoring required.'
];

const professionalComments = [
    'Excellent explanation! This covers the Indian context very well.',
    'Could you share a code example for this implementation?',
    'This is very relevant for Indian developers working on similar projects.',
    'Great insights on Indian market requirements and regulations.',
    'Have you considered the regional language requirements for Indian users?',
    'This approach aligns well with Indian banking security standards.',
    'Very comprehensive answer covering both technical and business aspects.',
    'The scalability considerations for Indian user base are well addressed.',
    'This solution works well for the diverse Indian technology landscape.',
    'Excellent coverage of compliance requirements for Indian businesses.',
    'The offline-first approach is crucial for Indian rural deployments.',
    'This addresses the unique challenges of Indian digital transformation.',
    'Great perspective on cost optimization for Indian startups.',
    'The multi-language support considerations are very relevant.',
    'This covers the regulatory landscape for Indian financial technology.'
];

const externalBookmarks = [
    {
        title: 'Indian Tech Stack Guide 2024',
        excerpt: 'Comprehensive guide to technology stacks popular in Indian software companies including TCS, Infosys, Wipro, and startups.',
        link: 'https://indiantechstack.dev',
        tags: ['india', 'tech-stack', 'companies', 'career']
    },
    {
        title: 'UPI Integration Best Practices',
        excerpt: 'Complete guide for integrating UPI payments in Indian applications with security considerations and NPCI compliance.',
        link: 'https://upi-integration.guide',
        tags: ['upi', 'payments', 'integration', 'security', 'npci']
    },
    {
        title: 'Flutter Localization for Indian Languages',
        excerpt: 'Step-by-step guide for implementing multi-language support in Flutter apps for 12 major Indian languages.',
        link: 'https://flutter-indic.dev',
        tags: ['flutter', 'localization', 'indian-languages', 'i18n']
    },
    {
        title: 'AWS Cost Optimization for Indian Startups',
        excerpt: 'Practical strategies for reducing AWS costs while maintaining performance, specifically tailored for Indian market conditions.',
        link: 'https://aws-india-costs.dev',
        tags: ['aws', 'cost-optimization', 'startups', 'india', 'cloud']
    },
    {
        title: 'Indian Cybersecurity Compliance Guide',
        excerpt: 'Understanding CERT-In guidelines, IT Act 2000, and data protection requirements for Indian software development.',
        link: 'https://indian-cybersecurity.law',
        tags: ['cybersecurity', 'compliance', 'indian-law', 'cert-in', 'data-protection']
    }
];

const indianGroups = [
    {
        name: 'MERN Stack Developers India',
        description: 'Community for MERN stack developers in India. Discuss best practices, share resources, and collaborate on Indian projects.',
        tags: ['mern', 'nodejs', 'react', 'mongodb', 'india']
    },
    {
        name: 'Indian Flutter Developers',
        description: 'Flutter developers from India sharing experiences, tutorials, and job opportunities in the Indian mobile development ecosystem.',
        tags: ['flutter', 'dart', 'mobile-development', 'india', 'cross-platform']
    },
    {
        name: 'Data Science India',
        description: 'Indian data scientists and ML engineers discussing projects, sharing datasets, and exploring career opportunities in India.',
        tags: ['data-science', 'machine-learning', 'python', 'india', 'analytics']
    },
    {
        name: 'Indian DevOps Community',
        description: 'DevOps engineers in India sharing experiences with AWS, Azure, GCP deployments, CI/CD pipelines, and cloud infrastructure.',
        tags: ['devops', 'ci-cd', 'cloud', 'aws', 'azure', 'india']
    },
    {
        name: 'Cybersecurity Professionals India',
        description: 'Indian cybersecurity experts discussing threats, compliance, ethical hacking, and security best practices for Indian organizations.',
        tags: ['cybersecurity', 'ethical-hacking', 'compliance', 'india', 'cert-in']
    }
];

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://labworkcharusataiml:54BdZtLCfVjVgesP@cluster0.ivruja7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Create users with proper hashing and verification
const createUsers = async () => {
    console.log('👥 Creating professional Indian users...');
    const users = [];

    for (const userData of indianUsers) {
        try {
            // Hash password
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                isVerified: true, // Auto-verify for demo
                isAdmin: userData.username === 'arjun_sharma', // Make first user admin
                reputation: userData.reputation,
                badges: userData.badges,
                privileges: userData.privileges,
                profile: {
                    fullName: userData.fullName,
                    bio: userData.bio,
                    location: userData.location,
                    website: userData.website,
                    tags: userData.tags
                },
                settings: {
                    theme: 'light',
                    language: 'en',
                    emailNotifications: true,
                    pushNotifications: true
                },
                emailVerifiedAt: new Date()
            });

            users.push(user);
            console.log(`✅ Created user: ${userData.fullName} (${userData.username})`);

        } catch (error) {
            console.log(`❌ Error creating user ${userData.username}:`, error.message);
        }
    }

    return users;
};

// Create questions
const createQuestions = async (users) => {
    console.log('❓ Creating professional questions...');
    const questions = [];

    for (let i = 0; i < professionalQuestions.length; i++) {
        const questionData = professionalQuestions[i];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        try {
            const question = await Question.create({
                user: randomUser._id,
                title: questionData.title,
                body: questionData.body,
                tags: questionData.tags,
                votes: Math.floor(Math.random() * 50) + 1,
                isActive: true
            });

            questions.push(question);
            console.log(`✅ Created question: "${questionData.title.substring(0, 50)}..."`);

        } catch (error) {
            console.log(`❌ Error creating question:`, error.message);
        }
    }

    return questions;
};

// Create answers
const createAnswers = async (questions, users) => {
    console.log('💬 Creating professional answers...');
    const answers = [];

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const numAnswers = Math.floor(Math.random() * 3) + 1; // 1-3 answers per question

        for (let j = 0; j < numAnswers; j++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            // Avoid user answering their own question
            if (randomUser._id.toString() === question.user.toString()) continue;

            const answerData = professionalAnswers[Math.floor(Math.random() * professionalAnswers.length)];

            try {
                const answer = await Answer.create({
                    user: randomUser._id,
                    question: question._id,
                    body: answerData,
                    votes: Math.floor(Math.random() * 30) + 1,
                    isAccepted: j === 0 && Math.random() > 0.7 // First answer sometimes accepted
                });

                // Update question with answer reference
                await Question.findByIdAndUpdate(question._id, {
                    $push: { answers: answer._id }
                });

                answers.push(answer);
                console.log(`✅ Created answer for question: ${question.title.substring(0, 30)}...`);

            } catch (error) {
                console.log(`❌ Error creating answer:`, error.message);
            }
        }
    }

    return answers;
};

// Create comments
const createComments = async (questions, answers, users) => {
    console.log('💭 Creating professional comments...');
    const comments = [];

    // Comments on questions
    for (const question of questions.slice(0, 10)) { // Comment on first 10 questions
        const numComments = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numComments; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const commentText = professionalComments[Math.floor(Math.random() * professionalComments.length)];

            try {
                const comment = await Comment.create({
                    user: randomUser._id,
                    body: commentText,
                    contentId: question._id,
                    contentType: 'question'
                });

                // Update question with comment reference
                await Question.findByIdAndUpdate(question._id, {
                    $push: { comments: comment._id }
                });

                comments.push(comment);
                console.log(`✅ Created comment on question`);

            } catch (error) {
                console.log(`❌ Error creating question comment:`, error.message);
            }
        }
    }

    // Comments on answers
    for (const answer of answers.slice(0, 15)) { // Comment on first 15 answers
        if (Math.random() > 0.6) { // 40% chance of comment
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const commentText = professionalComments[Math.floor(Math.random() * professionalComments.length)];

            try {
                const comment = await Comment.create({
                    user: randomUser._id,
                    body: commentText,
                    contentId: answer._id,
                    contentType: 'answer'
                });

                // Update answer with comment reference
                await Answer.findByIdAndUpdate(answer._id, {
                    $push: { comments: comment._id }
                });

                comments.push(comment);
                console.log(`✅ Created comment on answer`);

            } catch (error) {
                console.log(`❌ Error creating answer comment:`, error.message);
            }
        }
    }

    return comments;
};

// Create bookmarks
const createBookmarks = async (users) => {
    console.log('🔖 Creating external bookmarks...');
    const bookmarks = [];

    for (const bookmarkData of externalBookmarks) {
        const randomUser = users[Math.floor(Math.random() * users.length)];

        try {
            const bookmark = await Bookmark.create({
                user: randomUser._id,
                title: bookmarkData.title,
                excerpt: bookmarkData.excerpt,
                link: bookmarkData.link,
                tags: bookmarkData.tags,
                isPublic: Math.random() > 0.5
            });

            bookmarks.push(bookmark);
            console.log(`✅ Created bookmark: ${bookmarkData.title}`);

        } catch (error) {
            console.log(`❌ Error creating bookmark:`, error.message);
        }
    }

    return bookmarks;
};

// Create groups
const createGroups = async (users) => {
    console.log('👥 Creating professional groups...');
    const groups = [];

    for (const groupData of indianGroups) {
        const creator = users[Math.floor(Math.random() * users.length)];

        try {
            const group = await Group.create({
                name: groupData.name,
                description: groupData.description,
                createdBy: creator._id,
                tags: groupData.tags,
                members: [{
                    user: creator._id,
                    role: 'admin'
                }],
                memberCount: 1
            });

            groups.push(group);
            console.log(`✅ Created group: ${groupData.name}`);

        } catch (error) {
            console.log(`❌ Error creating group:`, error.message);
        }
    }

    return groups;
};

// Create social connections (following, friends)
const createSocialConnections = async (users) => {
    console.log('🤝 Creating social connections...');

    for (const user of users) {
        const numFollowing = Math.floor(Math.random() * 5) + 2; // Follow 2-6 users
        const numFriends = Math.floor(Math.random() * 3) + 1; // 1-3 friends

        // Create following relationships
        const followingUsers = users
            .filter(u => u._id.toString() !== user._id.toString())
            .sort(() => 0.5 - Math.random())
            .slice(0, numFollowing);

        for (const followUser of followingUsers) {
            try {
                await User.findByIdAndUpdate(user._id, {
                    $addToSet: { following: followUser._id }
                });
                await User.findByIdAndUpdate(followUser._id, {
                    $addToSet: { followers: user._id }
                });
            } catch (error) {
                console.log(`❌ Error creating follow relationship:`, error.message);
            }
        }

        // Create friend relationships (mutual following)
        const friendUsers = followingUsers
            .sort(() => 0.5 - Math.random())
            .slice(0, numFriends);

        for (const friendUser of friendUsers) {
            try {
                await User.findByIdAndUpdate(user._id, {
                    $addToSet: { friends: friendUser._id }
                });
                await User.findByIdAndUpdate(friendUser._id, {
                    $addToSet: { friends: user._id }
                });
            } catch (error) {
                console.log(`❌ Error creating friend relationship:`, error.message);
            }
        }
    }

    console.log('✅ Social connections created');
};

// Create notifications
const createNotifications = async (users, questions, answers) => {
    console.log('🔔 Creating notifications...');
    const notifications = [];

    for (const user of users) {
        const numNotifications = Math.floor(Math.random() * 3) + 1; // 1-3 notifications per user

        for (let i = 0; i < numNotifications; i++) {
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

            const notificationTypes = [
                { type: 'new_answer', message: `New answer on "${randomQuestion.title.substring(0, 30)}..."`, data: { questionId: randomQuestion._id } },
                { type: 'question_upvote', message: `Your question "${randomQuestion.title.substring(0, 30)}..." received an upvote`, data: { questionId: randomQuestion._id } },
                { type: 'answer_upvote', message: `Your answer received an upvote`, data: { answerId: randomAnswer._id } },
                { type: 'follow', message: `Someone started following you`, data: {} },
                { type: 'badge_earned', message: `You earned a new badge!`, data: { badge: 'Contributor' } }
            ];

            const notificationData = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
            const sender = users[Math.floor(Math.random() * users.length)];

            try {
                const notification = await Notification.create({
                    recipient: user._id,
                    sender: sender._id,
                    type: notificationData.type,
                    title: notificationData.type.replace('_', ' ').toUpperCase(),
                    message: notificationData.message,
                    data: notificationData.data,
                    isRead: Math.random() > 0.6 // 40% read
                });

                notifications.push(notification);

            } catch (error) {
                console.log(`❌ Error creating notification:`, error.message);
            }
        }
    }

    console.log(`✅ Created ${notifications.length} notifications`);
    return notifications;
};

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting comprehensive database seeding...');
        console.log('📊 This will create professional Indian developer community data');

        // Create all entities in order
        const users = await createUsers();
        console.log(`✅ Created ${users.length} users`);

        const questions = await createQuestions(users);
        console.log(`✅ Created ${questions.length} questions`);

        const answers = await createAnswers(questions, users);
        console.log(`✅ Created ${answers.length} answers`);

        const comments = await createComments(questions, answers, users);
        console.log(`✅ Created ${comments.length} comments`);

        const bookmarks = await createBookmarks(users);
        console.log(`✅ Created ${bookmarks.length} bookmarks`);

        const groups = await createGroups(users);
        console.log(`✅ Created ${groups.length} groups`);

        await createSocialConnections(users);

        const notifications = await createNotifications(users, questions, answers);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('📈 Summary:');
        console.log(`   👥 Users: ${users.length}`);
        console.log(`   ❓ Questions: ${questions.length}`);
        console.log(`   💬 Answers: ${answers.length}`);
        console.log(`   💭 Comments: ${comments.length}`);
        console.log(`   🔖 Bookmarks: ${bookmarks.length}`);
        console.log(`   👥 Groups: ${groups.length}`);
        console.log(`   🔔 Notifications: ${notifications.length}`);
        console.log('\n🚀 Ready for testing!');

    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        throw error;
    }
};

// Main execution
const runSeeding = async () => {
    try {
        console.log('🚀 Starting seedDatabase script...');
        console.log('📊 This will create professional Indian developer community data');

        console.log('🔌 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');

        console.log('🌱 Starting database seeding...');
        await seedDatabase();
        console.log('\n✅ Database seeding script completed successfully!');
    } catch (error) {
        console.error('❌ Database seeding script failed:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        console.log('🔌 Closing database connection...');
        await mongoose.connection.close();
        console.log('✅ Database connection closed.');
    }
};

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.js')) {
    runSeeding();
}