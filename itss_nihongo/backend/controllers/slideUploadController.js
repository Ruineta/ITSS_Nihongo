import { query } from '../config/database.js';
import { generateSlideThumbnail } from '../services/thumbnailService.js';
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
    const {
      title,
      description,
      subject_id,
      difficulty_level,
      difficulty_score = 0,
      tags = []
    } = req.body;

    // Get user_id from authentication (placeholder for now)
    const user_id = req.user?.id || 1; // TODO: Get from auth middleware

    // Validate required fields
    if (!title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Title and file are required'
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
                         'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and PowerPoint files are allowed'
      });
    }

    // Determine file type
    const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' 
                   : req.file.originalname.endsWith('.pptx') ? 'pptx' 
                   : 'ppt';

    // File URL (adjust based on your storage strategy)
    const fileUrl = `/uploads/slides/${req.file.filename}`;

    // Insert slide record first to get the ID
    const insertQuery = `
      INSERT INTO slides (
        user_id, subject_id, title, description, 
        file_url, file_type, difficulty_level, difficulty_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const insertResult = await query(insertQuery, [
      user_id,
      subject_id || null,
      title,
      description || null,
      fileUrl,
      fileType,
      difficulty_level || null,
      difficulty_score
    ]);

    const slideId = insertResult.rows[0].id;

    // Generate thumbnail
    let thumbnailUrl = null;
    try {
      const thumbnailResult = await generateSlideThumbnail(
        req.file.path,
        fileType,
        slideId
      );
      
      thumbnailUrl = thumbnailResult.url;

      // Update slide with thumbnail URL
      await query(
        'UPDATE slides SET thumbnail_url = $1 WHERE id = $2',
        [thumbnailUrl, slideId]
      );
    } catch (thumbnailError) {
      console.error('Thumbnail generation failed:', thumbnailError);
      // Continue without thumbnail - will use placeholder
    }

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
function generatePlaceholder(fileType) {
  const colors = {
    pdf: '4A90E2',
    pptx: '50C878',
    ppt: 'FF6B6B'
  };
  
  const color = colors[fileType] || '9B59B6';
  return `https://via.placeholder.com/400x300/${color}/ffffff?text=${fileType.toUpperCase()}+Slide`;
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
