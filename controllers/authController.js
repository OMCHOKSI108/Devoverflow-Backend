import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    },
)
    };


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { username, email, password, isAdmin } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user (NOT verified by default, but allow admin registration)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isVerified: false, // Don't auto-verify
            isAdmin: isAdmin === true // Set admin status if provided
        });

        // Send verification email (optional implementation)
        try {
            const transporter = createTransporter();
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Q&A App Account - Action Required',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Welcome to Q&A App! 🚀</h2>
                        <p>Hi <strong>${username}</strong>,</p>
                        <p>Thank you for registering with our Q&A App! To complete your registration and start asking/answering questions, please verify your email address.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify My Email Address
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                            ${verificationUrl}
                        </p>
                        
                        <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
                        
                        <hr style="margin: 30px 0;">
                        <p style="color: #6b7280; font-size: 14px;">
                            If you didn't create an account with us, please ignore this email.
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            Best regards,<br>
                            Q&A App Team
                        </p>
                    </div>
                `
            });
            console.log(`✅ Verification email sent successfully to ${email}`);
        } catch (emailError) {
            console.log('Email sending failed:', emailError.message);
            // Continue with registration even if email fails
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully! Please check your email to verify your account.',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                    isAdmin: user.isAdmin,
                    reputation: user.reputation
                }
            },
            emailSent: true,
            note: 'Please check your email inbox and spam folder for the verification link.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Register admin user (for development/testing)
// @route   POST /api/auth/register-admin
// @access  Public (should be secured in production)
export const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;

        // Security check - require admin secret
        if (adminSecret !== 'ADMIN_SETUP_SECRET_2025') {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin secret key'
            });
        }

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token for admin
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create admin user (NOT verified by default - needs email verification)
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isVerified: false, // Admin also needs email verification
            isAdmin: true // Set as admin
        });

        // Send verification email to admin
        try {
            const transporter = createTransporter();
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Admin Account - Q&A App',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc2626;">🔐 Admin Account Verification Required</h2>
                        <p>Hi <strong>${username}</strong>,</p>
                        <p>Your admin account has been created successfully! To complete your admin registration and access administrative features, please verify your email address.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                🔓 Verify Admin Account
                            </a>
                        </div>
                        
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; background-color: #fef2f2; padding: 10px; border-radius: 5px; border-left: 4px solid #dc2626;">
                            ${verificationUrl}
                        </p>
                        
                        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626; margin: 20px 0;">
                            <p style="margin: 0; color: #dc2626; font-weight: bold;">⚠️ Admin Account Security Notice:</p>
                            <p style="margin: 5px 0 0 0; color: #374151;">This verification link will expire in 24 hours. After verification, you will have full administrative access to the Q&A platform.</p>
                        </div>
                        
                        <hr style="margin: 30px 0;">
                        <p style="color: #6b7280; font-size: 14px;">
                            If you didn't request an admin account, please contact the system administrator immediately.
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            Best regards,<br>
                            Q&A App Admin Team
                        </p>
                    </div>
                `
            });
            console.log(`✅ Admin verification email sent successfully to ${email}`);
        } catch (emailError) {
            console.log('Admin email sending failed:', emailError.message);
            // Continue with registration even if email fails
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Admin user registered successfully! Please check your email to verify your admin account.',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                    isAdmin: user.isAdmin,
                    reputation: user.reputation
                }
            },
            emailSent: true,
            note: 'Admin account created but requires email verification. Please check your email inbox and spam folder for the verification link.'
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during admin registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isVerified: user.isVerified,
                    isAdmin: user.isAdmin,
                    reputation: user.reputation,
                    profile: user.profile
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by verification token and check if not expired
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Update user verification status
        user.isVerified = true;
        user.emailVerifiedAt = new Date();
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Return success response with redirect or success page
        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now use all features of the app.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                verifiedAt: user.emailVerifiedAt
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { bio, location, website } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                'profile.bio': bio,
                'profile.location': location,
                'profile.website': website
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

// @desc    Setup admin user (TEMPORARY - for development only)
// @route   POST /api/auth/setup-admin
// @access  Public (should be removed in production)
export const setupAdmin = async (req, res) => {
    try {
        const { email, adminSecret } = req.body;

        // Simple security check - you can change this secret
        if (adminSecret !== 'MAKE_ME_ADMIN_2025') {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin secret'
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user to admin
        user.isAdmin = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${email} has been granted admin privileges`,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    isVerified: user.isVerified,
                    reputation: user.reputation
                }
            }
        });

    } catch (error) {
        console.error('Setup admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error setting up admin'
        });
    }
};
