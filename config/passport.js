import dotenv from 'dotenv';
dotenv.config();


import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ 
          $or: [
            { providerId: profile.id, provider: 'google' },
            { email: profile.emails[0].value }
          ]
        });

        if (user) {
          // Update user info if needed
          if (!user.providerId) {
            user.provider = 'google';
            user.providerId = profile.id;
            user.avatar = profile.photos[0]?.value;
            user.isEmailVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: 'google',
          providerId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub might not always provide email, so we need to handle that
        const email = profile.emails?.[0]?.value || `${profile.username}@github.user`;

        let user = await User.findOne({ 
          $or: [
            { providerId: profile.id, provider: 'github' },
            { email: email }
          ]
        });

        if (user) {
          if (!user.providerId) {
            user.provider = 'github';
            user.providerId = profile.id;
            user.avatar = profile.photos[0]?.value;
            user.isEmailVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          provider: 'github',
          providerId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;