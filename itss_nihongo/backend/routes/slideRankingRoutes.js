import express from 'express';
import {
  getDifficultSlidesRanking,
  getDifficultyStats
} from '../controllers/slideRankingController.js';

const router = express.Router();

/**
 * Slide Difficulty Ranking Routes
 * Base path: /api/slides/ranking
 */

/**
 * @route   GET /api/slides/ranking/difficult
 * @desc    Get slides ranked by difficulty score (難解ランキング)
 * @access  Public
 * @query   {number} limit - Max results (default: 10, max: 100)
 * @query   {number} offset - Pagination offset (default: 0)
 * @query   {number} minScore - Minimum difficulty score (default: 0, range: 0-100)
 */
router.get('/difficult', getDifficultSlidesRanking);

/**
 * @route   GET /api/slides/ranking/difficult/stats
 * @desc    Get difficulty distribution statistics
 * @access  Public
 */
router.get('/difficult/stats', getDifficultyStats);

export default router;
