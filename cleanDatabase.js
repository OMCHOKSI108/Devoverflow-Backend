import mongoose from 'mongoose';
import 'dotenv/config';
import readline from 'readline';

// Confirmation prompt
const askForConfirmation = () => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('⚠️  This will DELETE ALL DATA from your database. Are you sure? (type "yes" to confirm): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
};

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

// Clean database function
const cleanDatabase = async () => {
    try {
        console.log('🧹 Starting database cleanup...');
        console.log('⚠️  This will delete ALL data from ALL collections!');

        // Get all collections
        const collections = mongoose.connection.db.listCollections();

        // Convert to array and filter out system collections
        const collectionsArray = await collections.toArray();
        const userCollections = collectionsArray.filter(col =>
            !col.name.startsWith('system.') &&
            !col.name.startsWith('_')
        );

        console.log(`📊 Found ${userCollections.length} collections to clean`);

        let totalDeleted = 0;

        // Delete all documents from each collection
        for (const collection of userCollections) {
            const collectionName = collection.name;
            console.log(`🗑️  Clearing collection: ${collectionName}`);

            try {
                const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
                const deletedCount = result.deletedCount || 0;
                totalDeleted += deletedCount;
                console.log(`✅ Cleared ${collectionName} (${deletedCount} documents)`);
            } catch (error) {
                console.log(`⚠️  Could not clear ${collectionName}:`, error.message);
            }
        }

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log(`📊 Total documents deleted: ${totalDeleted}`);
        console.log('�️  All user collections have been cleared of data.');

    } catch (error) {
        console.error('❌ Error during database cleanup:', error);
        throw error;
    }
};

// Main execution
const runCleanup = async () => {
    try {
        console.log('🧹 Database Cleanup Script');
        console.log('==========================');

        // Ask for confirmation
        const confirmed = await askForConfirmation();
        if (!confirmed) {
            console.log('❌ Operation cancelled by user.');
            return;
        }

        console.log('🔄 Proceeding with database cleanup...');
        await connectDB();
        await cleanDatabase();
        console.log('\n✅ Database cleanup script completed successfully!');
    } catch (error) {
        console.error('❌ Database cleanup script failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
    }
};

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('cleanDatabase.js')) {
    runCleanup();
}

export { cleanDatabase };