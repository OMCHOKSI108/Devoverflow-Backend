import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    reputation: { type: Number, default: 0 },
    badges: [String],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profile: {
        fullName: { type: String, default: '' },
        bio: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        avatar: { type: String, default: '' },
        tags: [{ type: String }]
    },
    settings: {
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
        language: { type: String, default: 'en' },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true }
    },
    // Email verification fields
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    emailVerifiedAt: { type: Date }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
