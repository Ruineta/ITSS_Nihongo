import express from 'express';
import {
  searchSlides,
  getSlideById,
  getSubjects,
  getPopularTags
} from '../controllers/slideSearchController.js';
import {
  validateSearchParams,
  validateSlideId
} from '../middleware/searchValidator.js';

const router = express.Router();

/**
 * @route   GET /api/slides/search
 * @desc    Search slides with multiple criteria and filters
 * @access  Public
 * @query   {string} keyword - Search keyword (optional)
 * @query   {string} subject - Subject filter (optional)
 * @query   {string} difficulty - Difficulty level: 初級, 中級, 上級, N1-N5 (optional)
 * @query   {string} year - Year filter in format "YYYY年" (optional, e.g., "2024年")
 * @query   {string} tags - Comma-separated tags (optional)
 * @query   {string} sortBy - Sort option: newest, oldest, most_viewed, difficulty_asc, difficulty_desc (optional, default: newest)
 * @query   {number} page - Page number (optional, default: 1)
 * @query   {number} limit - Items per page (optional, default: 12, max: 100)
 * 
 * @example GET /api/slides/search?keyword=数学&subject=数学&difficulty=中級&year=2024年&sortBy=most_viewed&page=1&limit=12
 */
router.get('/search', validateSearchParams, searchSlides);

/**
 * @route   GET /api/slides/filters/subjects
 * @desc    Get all available subjects for filtering
 * @access  Public
 * 
 * @example GET /api/slides/filters/subjects
 */
router.get('/filters/subjects', getSubjects);

/**
 * @route   GET /api/slides/filters/tags
 * @desc    Get popular tags based on usage count
 * @access  Public
 * @query   {number} limit - Number of tags to return (optional, default: 20, max: 100)
 * 
 * @example GET /api/slides/filters/tags?limit=10
 */
router.get('/filters/tags', getPopularTags);

/**
 * @route   GET /api/slides/:id
 * @desc    Get slide by ID with full details
 * @access  Public
 * @param   {number} id - Slide ID
 * 
 * @example GET /api/slides/123
 */
router.get('/:id', validateSlideId, getSlideById);

export default router;
