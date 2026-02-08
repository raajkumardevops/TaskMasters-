import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Helper function to send token response with cookies
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, options)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        provider: user.provider,
        avatar: user.avatar
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `Welcome to Task Master!

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Task Master! 🎉</h1>
        <p>Thank you for registering! Please verify your email address to activate your account.</p>
        
        <h2>Verification Token:</h2>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <code style="font-size: 18px; color: #007bff; font-family: monospace;">
            ${verificationToken}
          </code>
        </div>
        
        <p>Or click the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Verify Email
        </a>
        
        <p><strong style="color: #d9534f;">This link will expire in 24 hours.</strong></p>
        <p style="color: #666;">If you did not create an account, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">This is an automated email from Task Master. Please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Task Master',
        message,
        html
      });

      sendTokenResponse(user, 201, res);
    } catch (err) {
      console.log('Email error:', err);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      sendTokenResponse(user, 201, res);
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user registered with OAuth
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: `This account was created with ${user.provider}. Please login with ${user.provider}.`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const accessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email'
      });
    }

    // Check if user registered with OAuth
    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        error: `This account uses ${user.provider} login. Password reset is not available.`
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested to reset your password.

Please use this token to reset your password:

${resetToken}

Or click this link:
${resetUrl}

This token will expire in 10 minutes.

If you did not request this, please ignore this email.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
        
        <h2>Reset Token:</h2>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <code style="font-size: 18px; color: #007bff; font-family: monospace;">
            ${resetToken}
          </code>
        </div>
        
        <p>Or click the button below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Reset Password
        </a>
        
        <p><strong style="color: #d9534f;">This token will expire in 10 minutes.</strong></p>
        <p style="color: #666;">If you did not request this, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">This is an automated email from Task Master. Please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Task Master',
        message,
        html
      });

      res.status(200).json({
        success: true,
        data: 'Email sent successfully',
        resetToken
      });
    } catch (err) {
      console.log('Email error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:token
export const verifyEmail = async (req, res) => {
  try {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resendverification
export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const message = `Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email</h1>
        <p>Please verify your email address to activate your account.</p>
        
        <h2>Verification Token:</h2>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <code style="font-size: 18px; color: #007bff; font-family: monospace;">
            ${verificationToken}
          </code>
        </div>
        
        <p>Or click the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Verify Email
        </a>
        
        <p><strong style="color: #d9534f;">This link will expire in 24 hours.</strong></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 12px;">This is an automated email from Task Master. Please do not reply.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Task Master',
        message,
        html
      });

      res.status(200).json({
        success: true,
        data: 'Verification email sent',
        verificationToken
      });
    } catch (err) {
      console.log('Email error:', err);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        error: 'Email could not be sent'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
export const googleCallback = async (req, res) => {
  try {
    sendTokenResponse(req.user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'OAuth authentication failed'
    });
  }
};

// @desc    GitHub OAuth callback
// @route   GET /api/auth/github/callback
export const githubCallback = async (req, res) => {
  try {
    sendTokenResponse(req.user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'OAuth authentication failed'
    });
  }
};