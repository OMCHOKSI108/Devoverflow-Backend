import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { rateLimit } from 'express-rate-limit';

// Rate limiting configuration
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per IP
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again in an hour.'
    }
});

// Password validation
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Generate reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Error responses
const errorResponses = {
    USER_NOT_FOUND: {
        status: 404,
        message: 'No user found with this email address'
    },
    INVALID_TOKEN: {
        status: 400,
        message: 'Password reset token is invalid or has expired'
    },
    WEAK_PASSWORD: {
        status: 400,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'If a user with this email exists, a password reset link will be sent.'
            });
        }

        // Generate and save reset token
        const resetToken = generateResetToken();
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Update user document
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send email
        await sendEmail(
            user.email,
            'Password Reset Request',
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 25px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                        ${resetUrl}
                    </p>
                    
                    <p><strong>Note:</strong> This link will expire in 1 hour.</p>
                    
                    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">
                        Best regards,<br>
                        DevOverflow Team
                    </p>
                </div>
            `
        });

    res.json({
        success: true,
        message: 'If a user with this email exists, a password reset link will be sent.'
    });

} catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
        success: false,
        message: 'Error processing password reset request'
    });
}
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Validate password strength
        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: errorResponses.WEAK_PASSWORD.message
            });
        }

        // Hash the received token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: errorResponses.INVALID_TOKEN.message
            });
        }

        // Update password and clear reset token
        user.password = await bcrypt.hash(newPassword, 12);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.lastPasswordReset = Date.now();
        await user.save();

        // Send confirmation email
        const transporter = createTransporter();
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Successful',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Successful</h2>
                    <p>Hello,</p>
                    <p>Your password has been successfully reset.</p>
                    <p>If you did not perform this action, please contact our support team immediately.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 14px;">
                        Best regards,<br>
                        DevOverflow Team
                    </p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

// Import at the top of the file
import { sendEmail } from '../utils/emailService.js';
