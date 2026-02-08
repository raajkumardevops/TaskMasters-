import dotenv from 'dotenv';
dotenv.config(); // ← MUST BE FIRST!

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import passportConfig from './config/passport.js'; 

// Connect to database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passportConfig.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Task Master 2.0 API!',
    version: '2.0',
    features: [
      'Refresh Tokens',
      'Password Reset',
      'Email Verification',
      'Google OAuth',
      'GitHub OAuth'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'NOT configured'}`);
  console.log(`✅ GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'Configured' : 'NOT configured'}`);
});