import express from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getMe, 
  refreshAccessToken, 
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  googleCallback,
  githubCallback
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Local auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/verifyemail/:token', verifyEmail);
router.post('/resendverification', protect, resendVerificationEmail);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/auth/login/failed'
  }),
  googleCallback
);

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: '/api/auth/login/failed'
  }),
  githubCallback
);

// OAuth failure route
router.get('/login/failed', (req, res) => {
  res.status(401).json({
    success: false,
    error: 'OAuth authentication failed'
  });
});

export default router;