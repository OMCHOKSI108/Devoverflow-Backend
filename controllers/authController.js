import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

// Create nodemailer transporter for Gmail
export const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Use Gmail service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Gmail specific settings
        secure: false, // Use TLS
        port: 587, // Gmail SMTP port
        // Additional settings for better reliability
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        pool: true,
        maxConnections: 1,
        maxMessages: 100,
        // Debug settings
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
    });
};

// Send email using nodemailer
export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent successfully via nodemailer to ${to}`);
        return true;
    } catch (error) {
        console.log('Email sending failed:', error.message);
        return false;
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'This email address is already verified. You can login directly.'
            });
        }

        // Check if verification token exists and is not expired
        if (!user.verificationToken || user.verificationTokenExpires < Date.now()) {
            // Generate new verification token
            user.verificationToken = crypto.randomBytes(32).toString('hex');
            user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            await user.save();
        }

        // Send verification email
        try {
            const transporter = createTransporter();
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${user.verificationToken}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Q&A App Account - Resent',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">🔄 Verification Email Resent</h2>
                        <p>Hi <strong>${user.username}</strong>,</p>
                        <p>We noticed you requested a new verification email. Please verify your email address to complete your registration.</p>

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
                            If you didn't request this email, please ignore it.
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">
                            Best regards,<br>
                            Q&A App Team
                        </p>
                    </div>
                `
            });

            res.status(200).json({
                success: true,
                message: 'Verification email sent successfully! Please check your email inbox and spam folder.',
                emailSent: true
            });

        } catch (emailError) {
            console.log('Resend verification email failed:', emailError.message);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during resend verification'
        });
    }
};

// @desc    Test email sending
// @route   POST /api/auth/test-email
// @access  Public
export const testEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Create test email content
        const subject = 'DevOverflow - Email Test';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">DevOverflow Email Test</h2>
                <p>Hello!</p>
                <p>This is a test email from DevOverflow backend.</p>
                <p>If you received this email, it means the email service is working correctly!</p>
                <br>
                <p>Best regards,<br>DevOverflow Team</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                    This is an automated test email sent at ${new Date().toLocaleString()}
                </p>
            </div>
        `;

        // Attempt to send email
        const emailSent = await sendEmail(email, subject, html);

        if (emailSent) {
            res.status(200).json({
                success: true,
                message: 'Test email sent successfully!',
                email: email,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email. Check server logs for details.',
                email: email
            });
        }

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email test',
            error: error.message
        });
    }
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
            let message = '';
            let suggestion = '';

            if (existingUser.email === email && existingUser.username === username) {
                message = 'Account already exists with this email and username. Please login instead.';
                suggestion = 'Try logging in with your existing account.';
            } else if (existingUser.email === email) {
                message = 'Email already registered';
                suggestion = 'Try logging in or use a different email address.';
            } else {
                message = 'Username already taken';
                suggestion = 'Please choose a different username.';
            }

            return res.status(400).json({
                success: false,
                message,
                suggestion,
                existingAccount: {
                    email: existingUser.email,
                    username: existingUser.username,
                    isVerified: existingUser.isVerified
                },
                nextSteps: ['Try logging in with your existing account']
            });
        }

        // Hash password (reduce salt rounds for faster hashing)
        const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 8; // Faster for development/testing
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpires,
            isVerified: false, // Email verification required
            isAdmin: isAdmin === true // Set admin status if provided
        });

        // Send verification email asynchronously (don't block response)
        setImmediate(async () => {
            let retries = 3;
            while (retries > 0) {
                try {
                    const transporter = createTransporter();
                    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

                    const success = await sendEmail(email, 'Verify Your DevOverflow Account - Action Required', `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #2563eb;">Welcome to DevOverflow! 🚀</h2>
                                <p>Hi <strong>${username}</strong>,</p>
                                <p>Thank you for registering with DevOverflow! To complete your registration and start asking/answering questions, please verify your email address.</p>

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
                                    DevOverflow Team
                                </p>
                            </div>
                        `);

                    if (success) {
                        console.log(`✅ Verification email sent successfully to ${email}`);
                        break; // Success, exit retry loop
                    } else {
                        throw new Error('Email sending failed');
                    }
                } catch (emailError) {
                    retries--;
                    console.log(`Email sending failed (${3 - retries}/3 attempts):`, emailError.message);

                    if (retries > 0) {
                        // Wait before retrying (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, (3 - retries) * 2000));
                    } else {
                        console.log('❌ All email sending attempts failed for:', email);
                        // Could implement fallback notification here (e.g., log to database, send to admin, etc.)
                    }
                }
            }
        });        // Generate JWT token
        try {
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully! Your account is auto-verified and ready to use.',
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
                emailSent: false, // No email sent since auto-verified
                note: 'Account is automatically verified. You can login immediately!'
            });
        } catch (tokenError) {
            // If token generation fails, still send a success response but without token
            res.status(201).json({
                success: true,
                message: 'User registered successfully! Please check your email to verify your account.',
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        isVerified: user.isVerified,
                        isAdmin: user.isAdmin,
                        reputation: user.reputation
                    }
                },
                emailSent: false, // No email sent since auto-verified
                note: 'Account is automatically verified. You can login immediately!'
            });
        }

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
            let message = '';
            let suggestion = '';

            if (existingUser.email === email && existingUser.username === username) {
                if (existingUser.isVerified) {
                    message = 'Admin account already exists with this email and username. Please login instead.';
                    suggestion = 'Try logging in with your existing admin account.';
                } else {
                    message = 'Admin account already exists but email is not verified.';
                    suggestion = 'Please check your email for verification link or use the resend verification endpoint.';
                }
            } else if (existingUser.email === email) {
                message = 'Email already registered';
                suggestion = 'Try logging in or use a different email address.';
            } else {
                message = 'Username already taken';
                suggestion = 'Please choose a different username.';
            }

            return res.status(400).json({
                success: false,
                message,
                suggestion,
                existingAccount: {
                    email: existingUser.email,
                    username: existingUser.username,
                    isVerified: existingUser.isVerified
                },
                nextSteps: existingUser.isVerified ?
                    ['Try logging in with your existing account'] :
                    [
                        'Check your email for verification link',
                        'Use POST /api/auth/resend-verification to resend verification email',
                        'Try a different username if you want to create a new account'
                    ]
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

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in.',
                suggestion: 'Check your email for the verification link or use the resend verification endpoint.',
                nextSteps: [
                    'Check your email inbox and spam folder for the verification link',
                    'Use POST /api/auth/resend-verification to resend verification email',
                    'Click the verification link to activate your account'
                ],
                user: {
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified
                }
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

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        // Get user from token
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};
