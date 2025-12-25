import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getSlideComments,
  createComment,
  getSlideDiscussion,
  deleteComment,
  getDiscussionTopics,
  getDiscussionActivities,
  searchComments
} from '../controllers/discussionController.js';

const router = express.Router();

/**
 * Discussion Routes
 * Base path: /api/discussions
 */

/**
 * GET /api/discussions/slides/:slideId
 * Get slide discussion details (info + teaching points + recent comments)
 */
router.get('/slides/:slideId', getSlideDiscussion);

/**
 * GET /api/discussions/slides/:slideId/comments
 * Get all comments for a slide with pagination
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 *   - sortBy: 'newest' or 'oldest' (default: 'newest')
 */
router.get('/slides/:slideId/comments', getSlideComments);

/**
 * POST /api/discussions/slides/:slideId/comments
 * Create a new comment or proposal
 * Body:
 *   - content: Comment text (required)
 *   - type: 'comment' or 'proposal' (default: 'comment')
 *   - userId: Current user ID (required)
 */
router.post('/slides/:slideId/comments', authenticateToken, createComment);

/**
 * DELETE /api/discussions/comments/:commentId
 * Delete a comment (owner only)
 * Body:
 *   - userId: Current user ID (required)
 */
router.delete('/comments/:commentId', authenticateToken, deleteComment);

/**
 * GET /api/discussions/slides/:slideId/topics
 * Get discussion topics for a slide
 */
router.get('/slides/:slideId/topics', getDiscussionTopics);

/**
 * GET /api/discussions/slides/:slideId/activities
 * Get recent activities for a slide discussion
 * Query params:
 *   - limit: Maximum items to return (default: 10)
 */
router.get('/slides/:slideId/activities', getDiscussionActivities);

/**
 * GET /api/discussions/slides/:slideId/comments/search
 * Search and filter comments
 * Query params:
 *   - keyword: Search keyword
 *   - minRating: Minimum rating (1-5)
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20)
 */
router.get('/slides/:slideId/comments/search', searchComments);

export default router;
