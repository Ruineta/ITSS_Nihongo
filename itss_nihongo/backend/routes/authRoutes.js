import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    {string} email - Email address
 * @body    {string} password - Password (min 8 chars, letters + numbers)
 * @body    {string} fullName - Full name
 * @body    {string} schoolName - School name (optional)
 * @body    {string} specialization - Specialization/subject (optional)
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    {string} email - Email address
 * @body    {string} password - Password
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authenticateToken, getCurrentUser);

export default router;
