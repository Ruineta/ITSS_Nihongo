import { query } from '../config/database.js';

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
        COUNT(DISTINCT sl.user_id) as like_count
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
      likes: row.like_count,
      difficulty: row.difficulty_level,
      difficultyScore: row.difficulty_score,
      fileUrl: row.file_url,
      fileType: row.file_type,
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
  return `https://via.placeholder.com/400x300/${color}/ffffff?text=${fileType.toUpperCase()}+Slide`;
}
