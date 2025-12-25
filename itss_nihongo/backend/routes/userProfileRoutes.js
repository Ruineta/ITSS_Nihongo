import express from 'express';
import { 
  getUserProfile, 
  getMyProfile, 
  updateProfile,
  getUserSlides,
  getUserArticles
} from '../controllers/userProfileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/profile/me
 * @desc    Get current authenticated user's full profile (including private data)
 * @access  Private
 */
router.get('/profile/me', authenticateToken, getMyProfile);

/**
 * @route   GET /api/users/profile/:userId
 * @desc    Get public profile of any user by ID
 * @access  Public
 */
router.get('/profile/:userId', getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile information
 * @access  Private
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @route   GET /api/users/profile/:userId/slides
 * @desc    Get all public slides uploaded by a specific user
 * @access  Public
 */
router.get('/profile/:userId/slides', getUserSlides);

/**
 * @route   GET /api/users/profile/:userId/articles
 * @desc    Get all public know-how articles by a specific user
 * @access  Public
 */
router.get('/profile/:userId/articles', getUserArticles);

export default router;
