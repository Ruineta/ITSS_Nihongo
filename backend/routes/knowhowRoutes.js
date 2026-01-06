import express from 'express';
import { postArticle, getArticle, getArticles, getArticleComments, createArticleComment, getCommentReplies, createCommentReply, addReaction, getArticleReactions, getUserReaction } from '../controllers/knowhowController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Knowledge-Sharing Article Routes
 * Base path: /api/knowhow
 */

/**
 * @route   GET /api/knowhow
 * @desc    Get list of knowledge-sharing articles with pagination
 * @access  Public
 * @query   {number} page - Page number (optional, default: 1, min: 1)
 * @query   {number} limit - Items per page (optional, default: 10, max: 100)
 * @query   {string} tag - Filter by tag name (optional)
 * @query   {string} author - Filter by author name (optional)
 * @query   {number} user_id - Filter by user ID (optional)
 * 
 * @example
 * GET /api/knowhow?page=1&limit=10
 * GET /api/knowhow?tag=日本語
 * GET /api/knowhow?author=田中先生
 * GET /api/knowhow?user_id=1
 * 
 * @response {200} OK
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "日本語教育の工夫",
 *       "content": "学生の学習意欲を高めるために...",
 *       "author": "山田 太郎",
 *       "school": "〇〇大学",
 *       "isPublic": true,
 *       "tags": [
 *         {"id": 1, "name": "日本語"},
 *         {"id": 2, "name": "教学"}
 *       ],
 *       "createdAt": "2025-12-24T10:30:00Z",
 *       "updatedAt": "2025-12-24T10:30:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 25,
 *     "totalPages": 3,
 *     "hasNextPage": true
 *   }
 * }
 */
router.get('/', getArticles);

/**
 * @route   POST /api/knowhow/post
 * @desc    Create a new knowledge-sharing article
 * @access  Private (requires authentication with JWT)
 * @body    {string} title - Article title (required, max 100 characters)
 * @body    {string} content - Article content/body (required)
 * @body    {Array<string>} tags - Array of tag names (optional, max 50 chars each)
 * @body    {boolean} is_public - Public visibility flag (optional, default: true)
 * 
 * @example
 * POST /api/knowhow/post
 * Authorization: Bearer <JWT_TOKEN>
 * Content-Type: application/json
 * 
 * {
 *   "title": "日本語教育の工夫",
 *   "content": "学生の学習意欲を高めるために...",
 *   "tags": ["日本語", "教学", "学習法"],
 *   "is_public": true
 * }
 * 
 * @response {201} Created
 * {
 *   "success": true,
 *   "message": "Article posted successfully",
 *   "data": {
 *     "id": 1,
 *     "title": "日本語教育の工夫",
 *     "content": "学生の学習意欲を高めるために...",
 *     "author": "山田 太郎",
 *     "school": "〇〇大学",
 *     "isPublic": true,
 *     "tags": [
 *       {"id": 1, "name": "日本語"},
 *       {"id": 2, "name": "教学"},
 *       {"id": 3, "name": "学習法"}
 *     ],
 *     "createdAt": "2025-12-24T10:30:00Z",
 *     "updatedAt": "2025-12-24T10:30:00Z"
 *   }
 * }
 * 
 * @response {400} Bad Request (validation error)
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": [
 *     "Title is required and must be a string",
 *     "Title must be 100 characters or less"
 *   ]
 * }
 * 
 * @response {401} Unauthorized
 * {
 *   "success": false,
 *   "message": "認証が必要です"
 * }
 */
router.post('/post', authenticateToken, postArticle);

/**
 * @route   GET /api/knowhow/:id
 * @desc    Get a knowledge-sharing article by ID
 * @access  Public
 * @param   {number} id - Article ID
 * 
 * @example
 * GET /api/knowhow/1
 * 
 * @response {200} OK
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "title": "日本語教育の工夫",
 *     "content": "学生の学習意欲を高めるために...",
 *     "author": "山田 太郎",
 *     "authorId": 5,
 *     "authorAvatar": "https://...",
 *     "school": "〇〇大学",
 *     "isPublic": true,
 *     "tags": [
 *       {"id": 1, "name": "日本語"},
 *       {"id": 2, "name": "教学"}
 *     ],
 *     "createdAt": "2025-12-24T10:30:00Z",
 *     "updatedAt": "2025-12-24T10:30:00Z"
 *   }
 * }
 * 
 * @response {404} Not Found
 * {
 *   "success": false,
 *   "message": "Article not found"
 * }
 */
/**
 * @route   GET /api/knowhow/:articleId/comments
 * @desc    Get comments for a specific article
 * @access  Public
 * @query   {number} page - Page number (optional, default: 1)
 * @query   {number} limit - Items per page (optional, default: 20)
 */
router.get('/:articleId/comments', getArticleComments);

/**
 * @route   POST /api/knowhow/:articleId/comments
 * @desc    Create a comment on an article
 * @access  Private (requires authentication)
 * @body    {string} content - Comment content (required)
 */
router.post('/:articleId/comments', authenticateToken, createArticleComment);

/**
 * @route   GET /api/knowhow/:articleId/comments/:commentId/replies
 * @desc    Get replies for a comment
 * @access  Public
 */
router.get('/:articleId/comments/:commentId/replies', getCommentReplies);

/**
 * @route   POST /api/knowhow/:articleId/comments/:commentId/replies
 * @desc    Create a reply to a comment
 * @access  Private (requires authentication)
 * @body    {string} content - Reply content (required)
 */
router.post('/:articleId/comments/:commentId/replies', authenticateToken, createCommentReply);

/**
 * @route   POST /api/knowhow/:articleId/reactions
 * @desc    Add or update a reaction to an article
 * @access  Private (requires authentication)
 * @body    {string} reaction_type - Reaction type (love, like, haha, wow, sad, angry)
 */
router.post('/:articleId/reactions', authenticateToken, addReaction);

/**
 * @route   GET /api/knowhow/:articleId/reactions
 * @desc    Get reaction counts for an article
 * @access  Public
 */
router.get('/:articleId/reactions', getArticleReactions);

/**
 * @route   GET /api/knowhow/:articleId/reactions/user
 * @desc    Get current user's reaction to an article
 * @access  Private (requires authentication)
 */
router.get('/:articleId/reactions/user', authenticateToken, getUserReaction);

router.get('/:id', getArticle);

export default router;
