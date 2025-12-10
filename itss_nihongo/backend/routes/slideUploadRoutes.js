import express from 'express';
import { uploadSlide, deleteSlide } from '../controllers/slideUploadController.js';
import { upload, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * Slide Upload Routes
 * Base path: /api/slides
 */

/**
 * @route   POST /api/slides/upload
 * @desc    Upload a new slide file with automatic thumbnail generation
 * @access  Private (requires authentication)
 * @body    {file} file - Slide file (PDF or PPTX, max 50MB)
 * @body    {string} title - Slide title (required, max 100 chars)
 * @body    {string} description - Slide description (optional)
 * @body    {number} subject_id - Subject ID (optional)
 * @body    {string} difficulty_level - Difficulty level: 初級, 中級, 上級, N1-N5 (optional)
 * @body    {number} difficulty_score - Difficulty score 0-100 (optional, default: 0)
 * @body    {array} tags - Array of tag names (optional)
 * 
 * @example
 * FormData:
 * - file: [binary file]
 * - title: "数学の基礎"
 * - description: "数学の基本概念を解説"
 * - subject_id: 2
 * - difficulty_level: "中級"
 * - tags: ["数学", "基礎", "中級"]
 */
router.post('/upload', upload.single('file'), handleUploadError, uploadSlide);

/**
 * @route   DELETE /api/slides/:id
 * @desc    Delete a slide
 * @access  Private (requires authentication and ownership)
 * @param   {number} id - Slide ID
 */
router.delete('/:id', deleteSlide);

export default router;
