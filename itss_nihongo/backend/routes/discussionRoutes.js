import express from 'express';
import {
  getSlideComments,
  createComment,
  getSlideDiscussion,
  deleteComment
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
router.post('/slides/:slideId/comments', createComment);

/**
 * DELETE /api/discussions/comments/:commentId
 * Delete a comment (owner only)
 * Body:
 *   - userId: Current user ID (required)
 */
router.delete('/comments/:commentId', deleteComment);

export default router;
