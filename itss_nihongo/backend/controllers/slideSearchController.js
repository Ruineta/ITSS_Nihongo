import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Controller for Slide Search Feature
 * Handles search, filtering, and pagination of slides
 */

/**
 * Search slides with multiple criteria
 * @route GET /api/slides/search
 * @query {string} keyword - Search keyword (optional)
 * @query {string} subject - Subject filter (optional)
 * @query {string} difficulty - Difficulty level filter (optional)
 * @query {string} tags - Comma-separated tags (optional)
 * @query {string} sortBy - Sort option (optional, default: newest)
 * @query {number} page - Page number (optional, default: 1)
 * @query {number} limit - Items per page (optional, default: 12)
 * @returns {Object} Response with slides and pagination metadata
 */
export const searchSlides = async (req, res) => {
  try {
    const {
      keyword = '',
      subject = null,
      difficulty = null,
      year = null,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      tagsArray = []
    } = req.query;

    // Build WHERE clauses dynamically
    const conditions = [];
    const values = [];
    let paramCounter = 1;

    // Add public filter (always show only public slides)
    conditions.push('s.is_public = true');

    // Keyword search (search in title, description, author name, and tags)
    if (keyword && keyword.trim()) {
      conditions.push(`(
        s.title ILIKE $${paramCounter} OR 
        s.description ILIKE $${paramCounter} OR 
        u.full_name ILIKE $${paramCounter} OR
        s.id IN (
          SELECT st.slide_id 
          FROM slide_tags st
          INNER JOIN tags t ON st.tag_id = t.id
          WHERE t.name ILIKE $${paramCounter}
        )
      )`);
      values.push(`%${keyword.trim()}%`);
      paramCounter++;
    }

    // Subject filter
    if (subject && subject !== '全て') {
      conditions.push(`sub.name = $${paramCounter}`);
      values.push(subject);
      paramCounter++;
    }

    // Difficulty filter
    if (difficulty && difficulty !== '明易い順') {
      conditions.push(`s.difficulty_level = $${paramCounter}`);
      values.push(difficulty);
      paramCounter++;
    }

    // Year filter - filter by year in created_at date
    if (year && year !== '全て') {
      // Extract year from string (e.g., "2024年" -> 2024)
      const yearNumber = parseInt(year.replace('年', ''));
      if (!isNaN(yearNumber)) {
        conditions.push(`EXTRACT(YEAR FROM s.created_at) = $${paramCounter}`);
        values.push(yearNumber);
        paramCounter++;
      }
    }

    // Tags filter (slide must have ALL specified tags - AND logic)
    if (tagsArray && tagsArray.length > 0) {
      conditions.push(`
        s.id IN (
          SELECT st.slide_id 
          FROM slide_tags st
          INNER JOIN tags t ON st.tag_id = t.id
          WHERE t.name = ANY($${paramCounter}::text[])
          GROUP BY st.slide_id
          HAVING COUNT(DISTINCT t.id) = $${paramCounter + 1}
        )
      `);
      values.push(tagsArray);
      values.push(tagsArray.length);
      paramCounter += 2;
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine ORDER BY clause
    let orderByClause;
    switch (sortBy) {
      case 'oldest':
        orderByClause = 'ORDER BY s.created_at ASC';
        break;
      case 'most_viewed':
        orderByClause = 'ORDER BY s.view_count DESC, s.created_at DESC';
        break;
      case 'difficulty_asc':
        orderByClause = 'ORDER BY s.difficulty_score ASC, s.created_at DESC';
        break;
      case 'difficulty_desc':
        orderByClause = 'ORDER BY s.difficulty_score DESC, s.created_at DESC';
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY s.created_at DESC';
        break;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM slides s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      ${whereClause}
    `;

    const countResult = await query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Get slides with pagination
    const searchQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.file_url,
        s.thumbnail_url,
        s.file_type,
        s.difficulty_level,
        s.difficulty_score,
        s.view_count,
        s.avg_rating,
        s.created_at,
        s.updated_at,
        u.full_name as author,
        u.school_name as university,
        sub.name as subject_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        COUNT(DISTINCT sl.user_id) as like_count,
        (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id) as comment_count
      FROM slides s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN slide_tags st ON s.id = st.slide_id
      LEFT JOIN tags t ON st.tag_id = t.id
      LEFT JOIN slide_likes sl ON s.id = sl.slide_id
      ${whereClause}
      GROUP BY s.id, u.id, sub.id
      ${orderByClause}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    values.push(limit, offset);

    const result = await query(searchQuery, values);

    // Format the response
    const slides = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      author: row.author,
      university: row.university || '未設定',
      uploadDate: formatDate(row.created_at),
      subject: row.subject_name,
      tags: row.tags,
      views: row.view_count,
      likes: parseInt(row.like_count, 10),
      commentCount: parseInt(row.comment_count, 10),
      difficulty: row.difficulty_level,
      difficultyScore: row.difficulty_score,
      fileUrl: row.file_url,
      fileType: row.file_type ? row.file_type.toUpperCase() : 'PDF',
      fileSize: getFileSizeLocal(row.file_url),
      avgRating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : "0.0",
      thumbnail: row.thumbnail_url || generateThumbnailUrl(row.file_url, row.file_type)
    }));

    return res.status(200).json({
      success: true,
      data: slides,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error in searchSlides:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search slides',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get slide by ID with full details
 * @route GET /api/slides/:id
 * @param {number} id - Slide ID
 * @returns {Object} Response with slide details
 */
export const getSlideById = async (req, res) => {
  try {
    const { id } = req.params;

    const searchQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.file_url,
        s.thumbnail_url,
        s.file_type,
        s.difficulty_level,
        s.difficulty_score,
        s.view_count,
        s.avg_rating,
        s.created_at,
        s.updated_at,
        u.id as author_id,
        u.full_name as author,
        u.school_name as university,
        u.avatar_url as author_avatar,
        sub.name as subject_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        COUNT(DISTINCT sl.user_id) as like_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', dap.id, 
              'description', dap.point_description
            )
          ) FILTER (WHERE dap.id IS NOT NULL),
          '[]'
        ) as difficulty_points
      FROM slides s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN slide_tags st ON s.id = st.slide_id
      LEFT JOIN tags t ON st.tag_id = t.id
      LEFT JOIN slide_likes sl ON s.id = sl.slide_id
      LEFT JOIN difficulty_analysis_points dap ON s.id = dap.slide_id
      WHERE s.id = $1 AND s.is_public = true
      GROUP BY s.id, u.id, sub.id
    `;

    const result = await query(searchQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    const row = result.rows[0];

    // Increment view count asynchronously
    query('UPDATE slides SET view_count = view_count + 1 WHERE id = $1', [id])
      .catch(err => console.error('Failed to increment view count:', err));

    return res.status(200).json({
      success: true,
      data: {
        id: row.id,
        title: row.title,
        description: row.description,
        author: {
          id: row.author_id,
          name: row.author,
          university: row.university || '未設定',
          avatar: row.author_avatar
        },
        uploadDate: formatDate(row.created_at),
        updatedDate: formatDate(row.updated_at),
        subject: row.subject_name,
        tags: row.tags,
        views: row.view_count + 1,
        likes: row.like_count,
        difficulty: row.difficulty_level,
        difficultyScore: row.difficulty_score,
        difficultyPoints: row.difficulty_points,
        fileUrl: row.file_url,
        fileType: row.file_type,
        avgRating: row.avg_rating ? parseFloat(row.avg_rating).toFixed(1) : "0.0",
        thumbnail: row.thumbnail_url || generateThumbnailUrl(row.file_url, row.file_type)
      }
    });

  } catch (error) {
    console.error('Error in getSlideById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch slide details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get available subjects for filter dropdown
 * @route GET /api/slides/filters/subjects
 * @returns {Object} Response with list of subjects
 */
export const getSubjects = async (req, res) => {
  try {
    const subjectsQuery = 'SELECT id, name FROM subjects ORDER BY name ASC';
    const result = await query(subjectsQuery);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in getSubjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get popular tags based on usage count
 * @route GET /api/slides/filters/tags
 * @query {number} limit - Number of tags to return (default: 20)
 * @returns {Object} Response with list of popular tags
 */
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    const tagsQuery = `
      SELECT t.id, t.name, COUNT(st.slide_id) as usage_count
      FROM tags t
      INNER JOIN slide_tags st ON t.id = st.tag_id
      INNER JOIN slides s ON st.slide_id = s.id
      WHERE s.is_public = true
      GROUP BY t.id, t.name
      ORDER BY usage_count DESC
      LIMIT $1
    `;

    const result = await query(tagsQuery, [limit]);

    return res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error in getPopularTags:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch popular tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate slide difficulty
 * @route POST /api/slides/:id/rate
 */
export const rateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficultyScore, feedback } = req.body;

    // Use authenticateToken middleware if available, or fallback to default user (1) or null
    // Since this might be called from search page without strict login force (depending on frontend),
    // we should handle it gracefully.
    const userId = req.user?.userId || req.user?.id || 1;

    // Validate score (0-100)
    if (difficultyScore === undefined || difficultyScore < 0 || difficultyScore > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty score (0-100)'
      });
    }

    // Insert or Update rating in slide_ratings
    // Note: rating_points is set to 0 as this is difficulty rating, not star rating.
    const ratingQuery = `
      INSERT INTO slide_ratings (slide_id, user_id, rating_points, difficulty_score, feedback, updated_at)
      VALUES ($1, $2, 0, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (slide_id, user_id)
      DO UPDATE SET 
        difficulty_score = EXCLUDED.difficulty_score,
        feedback = EXCLUDED.feedback,
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(ratingQuery, [id, userId, difficultyScore, feedback || '']);

    // Recalculate average difficulty for the slide
    const avgQuery = `
      SELECT AVG(difficulty_score) as avg_score
      FROM slide_ratings
      WHERE slide_id = $1
    `;
    const avgResult = await query(avgQuery, [id]);
    const newAvg = Math.round(avgResult.rows[0].avg_score || 0);

    // Update slide difficulty score in slides table
    await query('UPDATE slides SET difficulty_score = $1 WHERE id = $2', [newAvg, id]);

    return res.status(200).json({
      success: true,
      data: {
        difficultyScore: newAvg
      }
    });

  } catch (error) {
    console.error('Error in rateSlide:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
};

/**
 * Like a slide
 * @route POST /api/slides/:id/like
 */
export const likeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Insert like (ignore if already exists)
    await query(
      'INSERT INTO slide_likes (user_id, slide_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, id]
    );

    // Get updated like count
    const countResult = await query(
      'SELECT COUNT(*) as count FROM slide_likes WHERE slide_id = $1',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        likeCount: parseInt(countResult.rows[0].count, 10)
      }
    });

  } catch (error) {
    console.error('Error in likeSlide:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to like slide'
    });
  }
};

/**
 * Unlike a slide
 * @route DELETE /api/slides/:id/like
 */
export const unlikeSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Delete like
    await query(
      'DELETE FROM slide_likes WHERE user_id = $1 AND slide_id = $2',
      [userId, id]
    );

    // Get updated like count
    const countResult = await query(
      'SELECT COUNT(*) as count FROM slide_likes WHERE slide_id = $1',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        likeCount: parseInt(countResult.rows[0].count, 10)
      }
    });

  } catch (error) {
    console.error('Error in unlikeSlide:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unlike slide'
    });
  }
};

/**
 * Get like status for a slide
 * @route GET /api/slides/:id/like
 */
export const getLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId; // Optional auth

    let isLiked = false;

    // Check if user has liked (only if authenticated)
    if (userId) {
      const likeResult = await query(
        'SELECT 1 FROM slide_likes WHERE user_id = $1 AND slide_id = $2',
        [userId, id]
      );
      isLiked = likeResult.rows.length > 0;
    }

    // Get total like count
    const countResult = await query(
      'SELECT COUNT(*) as count FROM slide_likes WHERE slide_id = $1',
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        isLiked,
        likeCount: parseInt(countResult.rows[0].count, 10)
      }
    });

  } catch (error) {
    console.error('Error in getLikeStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get like status'
    });
  }
};


// Helper functions

/**
 * Format date to Japanese format (YYYY年MM月DD日)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * Generate thumbnail URL based on file URL and type
 * @param {string} fileUrl - Original file URL
 * @param {string} fileType - File type (pdf, pptx, ppt)
 * @returns {string} Thumbnail URL or placeholder
 */
function generateThumbnailUrl(fileUrl, fileType) {
  // This is a placeholder implementation
  // In production, you would implement actual thumbnail generation
  // based on your file storage service (S3, CloudFront, etc.)

  if (fileUrl && fileUrl.includes('thumbnail')) {
    return fileUrl;
  }

  // Return placeholder based on file type
  const colors = {
    pdf: '4A90E2',
    pptx: '50C878',
    ppt: 'FF6B6B'
  };

  const color = colors[fileType] || '9B59B6';
  // Return local default thumbnail instead of external service to avoid network issues
  return '/default-slide-thumbnail.png';
}

/**
 * Get file size from local file system
 * @param {string} fileUrl - Relative URL path (e.g. /uploads/slides/...)
 * @returns {string} Formatted size (e.g. "2.5 MB") or "Unknown"
 */
function getFileSizeLocal(fileUrl) {
  if (!fileUrl) return 'Unknown';

  // If it's an external URL (http/https), return a placeholder
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return '2.5 MB'; // Placeholder for sample data
  }

  try {
    // fileUrl is like /uploads/slides/filename.pdf
    // We need to resolve it to absolute path.
    // Assuming backend root is where this runs, and uploads is ../uploads relative to this controller?
    // Wait, controller is in backend/controllers.
    // Uploads are in project_root/uploads.
    // So path should be path.join(__dirname, '../../', fileUrl) if fileUrl starts with /uploads

    // Better strategy: Check where uploads folder is relative to controller.
    // Controller: d:\ITSS_Nihongo\itss_nihongo\backend\controllers
    // Uploads: d:\ITSS_Nihongo\itss_nihongo\uploads
    // So ../../uploads is correct.

    // Safety check for absolute path
    const relativePath = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const absolutePath = path.join(__dirname, '../../', relativePath);

    if (fs.existsSync(absolutePath)) {
      const stats = fs.statSync(absolutePath);
      const bytes = stats.size;
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    return 'Unknown';
  } catch (e) {
    console.error('Error calculating file size:', e);
    return 'Unknown';
  }
}
