import { query } from '../config/database.js';
// import { generateSlideThumbnail } from '../services/thumbnailService.js'; // Removed

import { countPptxSlides, countPdfPages } from '../services/pageCountService.js';
import path from 'path';
import fs from 'fs';

/**
 * Upload Slide Controller
 * Handles slide file upload and thumbnail generation
 */

/**
 * Upload a new slide with automatic thumbnail generation
 * @route POST /api/slides/upload
 * @param {Object} req.file - Uploaded file (from multer)
 * @param {Object} req.body - Slide metadata
 * @returns {Object} Response with created slide data
 */
export const uploadSlide = async (req, res) => {
  try {
    console.log('Upload request received:', { body: req.body, file: req.file ? req.file.originalname : 'missing' });

    let {
      title,
      description,
      subject_id,
      subject_name,
      difficulty_level,
      difficulty_score = 0,
      tags
    } = req.body;

    // Handle tags from FormData (tags[] or JSON string)
    if (!tags && req.body['tags[]']) {
      tags = req.body['tags[]'];
    }
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [tags];
      }
    }
    if (!Array.isArray(tags)) tags = [];

    // Get user_id from authentication (placeholder for now)
    const user_id = req.user?.userId || 1;
    console.log('Resolved user_id:', user_id);

    // Validate required fields
    if (!title || !req.file) {
      console.error('Validation failed: Title or file missing');
      return res.status(400).json({
        success: false,
        message: 'Title and file are required'
      });
    }

    // Resolve Subject ID (Find or Create)
    let finalSubjectId = subject_id; // potentially undefined

    if (subject_name) {
      console.log('Resolving subject:', subject_name);
      // Check if subject exists
      const subjectCheckQuery = 'SELECT id FROM subjects WHERE name = $1';
      const subjectCheckResult = await query(subjectCheckQuery, [subject_name.trim()]);

      if (subjectCheckResult.rows.length > 0) {
        finalSubjectId = subjectCheckResult.rows[0].id;
      } else {
        // Create new subject
        const createSubjectQuery = 'INSERT INTO subjects (name) VALUES ($1) RETURNING id';
        const createSubjectResult = await query(createSubjectQuery, [subject_name.trim()]);
        finalSubjectId = createSubjectResult.rows[0].id;
        console.log('Created new subject:', finalSubjectId);
      }
    }

    console.log('Final Subject ID:', finalSubjectId);

    // Determine file type
    const originalName = req.file.originalname.toLowerCase();
    let fileType = 'ppt';

    if (originalName.endsWith('.pptx')) {
      fileType = 'pptx';
    } else if (originalName.endsWith('.ppt')) {
      fileType = 'ppt';
    } else if (req.file.mimetype === 'application/pdf' || originalName.endsWith('.pdf')) {
      fileType = 'pdf';
    }

    // File URL (adjust based on your storage strategy)
    const fileUrl = `/uploads/slides/${req.file.filename}`;

    // Calculate Page Count
    let pageCount = 0;
    if (fileType === 'pptx') {
      pageCount = countPptxSlides(req.file.path);
    } else if (fileType === 'pdf') {
      pageCount = await countPdfPages(req.file.path);
    }

    // Insert slide record first to get the ID
    const insertQuery = `
      INSERT INTO slides (
        user_id, subject_id, title, description, 
        file_url, file_type, difficulty_level, difficulty_score, page_count
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const insertResult = await query(insertQuery, [
      user_id,
      finalSubjectId || null,
      title,
      description || null,
      fileUrl,
      fileType,
      difficulty_level || null,
      difficulty_score,
      pageCount
    ]);

    const slideId = insertResult.rows[0].id;

    // Generate thumbnail (Simplified: Always use default)
    const thumbnailUrl = '/uploads/default-slide-thumbnail.png';
    await query(
      'UPDATE slides SET thumbnail_url = $1 WHERE id = $2',
      [thumbnailUrl, slideId]
    );

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Insert or get tag
        const tagResult = await query(
          'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
          [tagName.trim()]
        );

        const tagId = tagResult.rows[0].id;

        // Link tag to slide
        await query(
          'INSERT INTO slide_tags (slide_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [slideId, tagId]
        );
      }
    }

    // Fetch the complete slide data
    const slideQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.file_url,
        s.thumbnail_url,
        s.file_type,
        s.difficulty_level,
        s.difficulty_score,
        s.created_at,
        u.full_name as author,
        u.school_name as university,
        sub.name as subject_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM slides s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN slide_tags st ON s.id = st.slide_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.id = $1
      GROUP BY s.id, u.id, sub.id
    `;

    const slideResult = await query(slideQuery, [slideId]);
    const slide = slideResult.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Slide uploaded successfully',
      data: {
        id: slide.id,
        title: slide.title,
        description: slide.description,
        author: slide.author,
        university: slide.university,
        subject: slide.subject_name,
        fileUrl: slide.file_url,
        thumbnail: slide.thumbnail_url || generatePlaceholder(fileType),
        fileType: slide.file_type,
        difficulty: slide.difficulty_level,
        difficultyScore: slide.difficulty_score,
        pageCount: slide.page_count,
        tags: slide.tags,
        createdAt: slide.created_at
      }
    });

  } catch (error) {
    console.error('Error uploading slide:', error);

    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload slide',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate placeholder thumbnail URL
 */
// Return local default thumbnail instead of external service to avoid network/parsing issues
function generatePlaceholder(fileType) {
  return '/uploads/default-slide-thumbnail.png';
}

/**
 * Delete a slide
 * @route DELETE /api/slides/:id
 */
export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id; // TODO: Get from auth

    // Get slide info
    const slideResult = await query(
      'SELECT file_url, thumbnail_url, user_id FROM slides WHERE id = $1',
      [id]
    );

    if (slideResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    const slide = slideResult.rows[0];

    // Check ownership (TODO: Add proper authorization)
    // if (slide.user_id !== user_id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Not authorized to delete this slide'
    //   });
    // }

    // Delete the slide (CASCADE will handle related records)
    await query('DELETE FROM slides WHERE id = $1', [id]);

    // TODO: Delete actual files from storage
    // deleteFile(slide.file_url);
    // deleteThumbnail(slide.thumbnail_url);

    return res.status(200).json({
      success: true,
      message: 'Slide deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting slide:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete slide',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  uploadSlide,
  deleteSlide
};
