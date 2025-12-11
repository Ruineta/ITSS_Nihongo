import { query } from '../config/database.js';

/**
 * Controller for Slide Difficulty Ranking Feature (難解ランキング)
 * Handles retrieval of slides ranked by difficulty score
 */

/**
 * Get slides ranked by difficulty score
 * @route GET /api/slides/ranking/difficult
 * @query {number} limit - Maximum number of slides to return (default: 10)
 * @query {number} offset - Number of slides to skip for pagination (default: 0)
 * @query {number} minScore - Minimum difficulty score to include (default: 0)
 * @returns {Object} Response containing ranked slides with analysis points
 */
export const getDifficultSlidesRanking = async (req, res) => {
  try {
    // Parse query parameters with defaults
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const minScore = parseInt(req.query.minScore) || 0;

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        success: false,
        message: 'Offset must be non-negative'
      });
    }

    if (minScore < 0 || minScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Min score must be between 0 and 100'
      });
    }

    // Main query to get slides with their metadata
    const slidesQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.file_url,
        s.file_type,
        s.difficulty_level,
        s.difficulty_score,
        s.view_count,
        s.created_at,
        s.updated_at,
        u.id as author_id,
        u.full_name as author_name,
        u.school_name as author_school,
        u.specialization as author_specialization,
        sub.id as subject_id,
        sub.name as subject_name
      FROM slides s
      INNER JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.is_public = true 
        AND s.difficulty_score >= $1
      ORDER BY s.difficulty_score DESC, s.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const slidesResult = await query(slidesQuery, [minScore, limit, offset]);

    // If no slides found
    if (slidesResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          slides: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false
          }
        }
      });
    }

    // Get slide IDs for fetching analysis points
    const slideIds = slidesResult.rows.map(row => row.id);

    // Query to get difficulty analysis points for all slides
    const analysisQuery = `
      SELECT 
        slide_id,
        id,
        point_description
      FROM difficulty_analysis_points
      WHERE slide_id = ANY($1)
      ORDER BY slide_id, id
    `;

    const analysisResult = await query(analysisQuery, [slideIds]);

    // Group analysis points by slide_id
    const analysisPointsBySlide = analysisResult.rows.reduce((acc, point) => {
      if (!acc[point.slide_id]) {
        acc[point.slide_id] = [];
      }
      acc[point.slide_id].push({
        id: point.id,
        description: point.point_description
      });
      return acc;
    }, {});

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM slides s
      WHERE s.is_public = true 
        AND s.difficulty_score >= $1
    `;
    const countResult = await query(countQuery, [minScore]);
    const totalCount = parseInt(countResult.rows[0].total);

    // Format the response
    const slides = slidesResult.rows.map(slide => ({
      id: slide.id,
      title: slide.title,
      description: slide.description,
      fileUrl: slide.file_url,
      fileType: slide.file_type,
      difficultyLevel: slide.difficulty_level,
      difficultyScore: slide.difficulty_score,
      viewCount: slide.view_count,
      createdAt: slide.created_at,
      updatedAt: slide.updated_at,
      author: {
        id: slide.author_id,
        name: slide.author_name,
        school: slide.author_school,
        specialization: slide.author_specialization
      },
      subject: slide.subject_id ? {
        id: slide.subject_id,
        name: slide.subject_name
      } : null,
      analysisPoints: analysisPointsBySlide[slide.id] || []
    }));

    // Send response
    res.status(200).json({
      success: true,
      data: {
        slides,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching difficult slides ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching difficulty ranking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get statistics about difficulty distribution
 * @route GET /api/slides/ranking/difficult/stats
 * @returns {Object} Statistics about slide difficulty distribution
 */
export const getDifficultyStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_slides,
        AVG(difficulty_score) as average_score,
        MAX(difficulty_score) as max_score,
        MIN(difficulty_score) as min_score,
        COUNT(CASE WHEN difficulty_score >= 80 THEN 1 END) as very_difficult_count,
        COUNT(CASE WHEN difficulty_score >= 60 AND difficulty_score < 80 THEN 1 END) as difficult_count,
        COUNT(CASE WHEN difficulty_score >= 40 AND difficulty_score < 60 THEN 1 END) as moderate_count,
        COUNT(CASE WHEN difficulty_score < 40 THEN 1 END) as easy_count
      FROM slides
      WHERE is_public = true
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        totalSlides: parseInt(stats.total_slides),
        averageScore: parseFloat(parseFloat(stats.average_score).toFixed(2)),
        maxScore: parseInt(stats.max_score),
        minScore: parseInt(stats.min_score),
        distribution: {
          veryDifficult: parseInt(stats.very_difficult_count),
          difficult: parseInt(stats.difficult_count),
          moderate: parseInt(stats.moderate_count),
          easy: parseInt(stats.easy_count)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching difficulty statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 1. Submit user rating
export const submitSlideRating = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { difficultyScore, feedback } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate
    if (difficultyScore < 0 || difficultyScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty score must be between 0 and 100'
      });
    }

    // Insert or update user rating
    const query = `
      INSERT INTO slide_ratings (slide_id, user_id, difficulty_score, feedback)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (slide_id, user_id) 
      DO UPDATE SET 
        difficulty_score = $3,
        feedback = $4,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await db.query(query, [slideId, userId, difficultyScore, feedback]);

    // Recalculate average difficulty score
    const avgQuery = `
      SELECT AVG(difficulty_score) as avg_score
      FROM slide_ratings
      WHERE slide_id = $1
    `;
    const avgResult = await db.query(avgQuery, [slideId]);
    const newAvgScore = Math.round(avgResult.rows[0].avg_score);

    // Update slide's difficulty score
    await db.query(
        'UPDATE slides SET difficulty_score = $1 WHERE id = $2',
        [newAvgScore, slideId]
    );

    res.json({
      success: true,
      data: {
        slideId,
        userRating: difficultyScore,
        newDifficultyScore: newAvgScore
      }
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// 2. Update feedback only
export const updateSlideFeedback = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { feedback } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE slide_ratings
      SET feedback = $1, updated_at = NOW()
      WHERE slide_id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await db.query(query, [feedback, slideId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    res.json({
      success: true,
      data: {
        slideId,
        feedback
      }
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
