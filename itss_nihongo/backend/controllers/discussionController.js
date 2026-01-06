import { query } from '../config/database.js';

/**
 * Controller for Slide Discussion Feature
 * Handles comments, proposals, and discussions on slides
 */

/**
 * Get all slides with ratings for discussion listing
 * @route GET /api/discussions/slides
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort option (newest, mostCommented, highestRated)
 * @returns {Object} Response with slides and pagination
 */
export const getSlidesList = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    // Determine order clause
    let orderByClause = 'ORDER BY s.created_at DESC';
    if (sortBy === 'mostCommented') {
      orderByClause = 'ORDER BY comment_count DESC, s.created_at DESC';
    } else if (sortBy === 'highestRated') {
      orderByClause = 'ORDER BY avg_rating DESC, s.created_at DESC';
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM slides s
      WHERE s.is_public = true
    `;
    const countResult = await query(countQuery);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Get slides with ratings and comments count - simplified version
    const slidesQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.thumbnail_url,
        s.file_url,
        s.difficulty_level,
        s.view_count,
        s.created_at,
        COALESCE(u.full_name, '匿名') as author,
        COALESCE(u.school_name, '') as university,
        COALESCE(sub.name, '') as subject_name,
        (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id) as comment_count,
        (SELECT COALESCE(AVG(rating), 0) FROM slide_comments WHERE slide_id = s.id) as avg_rating,
        (SELECT COUNT(rating) FROM slide_comments WHERE slide_id = s.id) as rating_count
      FROM slides s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.is_public = true
      ${orderByClause}
      LIMIT $1 OFFSET $2
    `;

    const result = await query(slidesQuery, [limit, offset]);

    const slides = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      thumbnail: row.thumbnail_url,
      fileUrl: row.file_url,
      author: row.author,
      university: row.university,
      subject: row.subject_name,
      difficulty: row.difficulty_level,
      viewCount: parseInt(row.view_count, 10),
      commentCount: parseInt(row.comment_count, 10),
      avgRating: parseFloat(row.avg_rating || 0),
      ratingCount: parseInt(row.rating_count, 10),
      tags: [],
      createdAt: formatDate(row.created_at)
    }));

    return res.status(200).json({
      success: true,
      data: slides,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit, 10),
        hasNextPage: parseInt(page, 10) * limit < totalCount,
        hasPreviousPage: parseInt(page, 10) > 1
      }
    });

  } catch (error) {
    console.error('Error in getSlidesList:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch slides list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all comments for a specific slide
 * @route GET /api/discussions/slides/:slideId/comments
 * @param {number} slideId - Slide ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort option (newest, oldest)
 * @query {number} pageIndex - Page index filter (optional, null for overall comments)
 * @returns {Object} Response with comments and pagination
 */
export const getSlideComments = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { page = 1, limit = 20, sortBy = 'newest', pageIndex = null } = req.query;
    const offset = (page - 1) * limit;

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Determine order
    const orderByClause = sortBy === 'oldest'
      ? 'ORDER BY sc.created_at ASC'
      : 'ORDER BY sc.created_at DESC';

    // Determine WHERE clause for pageIndex filter
    let pageIndexFilter = 'AND sc.page_index IS NULL';
    let pageIndexValue = null;

    if (pageIndex === 'all') {
      pageIndexFilter = ''; // Fetch all comments
      pageIndexValue = null;
    } else if (pageIndex !== null && pageIndex !== undefined) {
      pageIndexFilter = 'AND sc.page_index = $2';
      pageIndexValue = parseInt(pageIndex, 10);
    }

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM slide_comments sc
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL ${pageIndexFilter}
    `;
    let countParams = pageIndexValue !== null ? [slideId, pageIndexValue] : [slideId];
    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Get comments with user info
    let limitOffset = '';
    let limitOffsetParams = [slideId];

    if (pageIndexValue !== null) {
      limitOffset = 'LIMIT $3 OFFSET $4';
      limitOffsetParams = [slideId, pageIndexValue, limit, offset];
      pageIndexFilter = 'AND sc.page_index = $2';
    } else if (req.query.pageIndex === 'all') {
      // Fetch all comments regardless of page
      limitOffset = 'LIMIT $2 OFFSET $3';
      limitOffsetParams = [slideId, limit, offset];
      pageIndexFilter = ''; // No filter on page_index
    } else {
      limitOffset = 'LIMIT $2 OFFSET $3';
      limitOffsetParams = [slideId, limit, offset];
      pageIndexFilter = 'AND sc.page_index IS NULL';
    }

    const commentsQuery = `
      SELECT 
        sc.id,
        sc.content,
        sc.type,
        sc.page_index,
        sc.rating,
        sc.created_at,
        u.id as user_id,
        u.full_name as author,
        u.avatar_url,
        u.school_name as university,
        COUNT(DISTINCT scr.id) as reply_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', scr.id,
              'content', scr.content,
              'timestamp', scr.created_at,
              'author', u_reply.full_name,
              'avatar', u_reply.avatar_url,
              'userId', u_reply.id
            )
          ) FILTER (WHERE scr.id IS NOT NULL),
          '[]'
        ) as replies
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      LEFT JOIN slide_comments scr ON scr.parent_id = sc.id
      LEFT JOIN users u_reply ON scr.user_id = u_reply.id
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL ${pageIndexFilter}
      GROUP BY sc.id, u.id, u.full_name, u.avatar_url, u.school_name
      ${orderByClause}
      ${limitOffset}
    `;

    const result = await query(commentsQuery, limitOffsetParams);

    const comments = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      type: row.type,
      timestamp: formatDateTime(row.created_at),
      author: row.author || '匿名',
      userId: row.user_id,
      avatar: row.author ? row.author[0].toUpperCase() : 'A',
      university: row.university || '',
      replyCount: parseInt(row.reply_count, 10),
      rating: row.rating ? parseInt(row.rating, 10) : null, // Include rating
      replies: row.replies ? row.replies.map(r => ({
        id: r.id,
        content: r.content,
        timestamp: formatDateTime(r.timestamp),
        author: r.author || '匿名',
        avatar: r.author ? r.author[0].toUpperCase() : 'A',
        userId: r.userId
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : []
    }));

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit, 10),
        hasNextPage: parseInt(page, 10) * limit < totalCount,
        hasPreviousPage: parseInt(page, 10) > 1
      }
    });

  } catch (error) {
    console.error('Error in getSlideComments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Post a new comment or proposal on a slide
 * @route POST /api/discussions/slides/:slideId/comments
 * @param {number} slideId - Slide ID
 * @body {string} content - Comment content
 * @body {string} type - 'comment' or 'proposal' (teaching plan proposal)
 * @body {number} userId - Current user ID
 * @body {number} pageIndex - Page index (optional, null for overall slide comment)
 * @returns {Object} Response with created comment
 */
// Post a new comment or proposal on a slide
export const createComment = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { content, type = 'comment', userId, pageIndex = null, rating = null, parentId = null } = req.body;

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (!['comment', 'proposal'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment type. Must be "comment" or "proposal"'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Check if user exists
    const userCheck = await query(
      'SELECT id, full_name, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];

    // Insert comment
    const insertQuery = `
      INSERT INTO slide_comments (slide_id, user_id, content, type, page_index, rating, parent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, content, type, page_index, rating, created_at, parent_id
    `;

    const result = await query(insertQuery, [slideId, userId, content.trim(), type, pageIndex, rating, parentId]);
    const comment = result.rows[0];

    // Update slide average rating
    if (rating) {
      try {
        const avgResult = await query(
          'SELECT AVG(rating) as avg FROM slide_comments WHERE slide_id = $1 AND rating > 0',
          [slideId]
        );
        const newAvg = avgResult.rows[0].avg ? parseFloat(avgResult.rows[0].avg).toFixed(2) : 0;
        await query(
          'UPDATE slides SET avg_rating = $1 WHERE id = $2',
          [newAvg, slideId]
        );
      } catch (e) {
        console.error('Failed to update avg rating:', e);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: {
        id: comment.id,
        content: comment.content,
        type: comment.type,
        timestamp: formatDateTime(comment.created_at),
        author: user.full_name || '匿名',
        userId: userId,
        avatar: user.full_name ? user.full_name[0].toUpperCase() : 'A',
        rating: comment.rating // Return rating
      }
    });

  } catch (error) {
    console.error('Error in createComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get slide discussion details (basic info + teaching points + recent comments)
 * @route GET /api/discussions/slides/:slideId
 * @param {number} slideId - Slide ID
 * @returns {Object} Response with slide details and discussion info
 */
export const getSlideDiscussion = async (req, res) => {
  try {
    const { slideId } = req.params;

    // Get slide details
    const slideQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.thumbnail_url,
        s.file_url,
        s.file_type,
        s.page_count,
        s.difficulty_level,
        s.view_count,
        s.avg_rating,
        s.created_at,
        u.id as author_id,
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
      WHERE s.id = $1 AND s.is_public = true
      GROUP BY s.id, u.id, sub.id
    `;

    const slideResult = await query(slideQuery, [slideId]);

    if (slideResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    const slideData = slideResult.rows[0];

    // Get teaching points (from difficulty_analysis_points or generate placeholder)
    const pointsQuery = `
      SELECT point_description
      FROM difficulty_analysis_points
      WHERE slide_id = $1
      LIMIT 1
    `;

    const pointsResult = await query(pointsQuery, [slideId]);
    const teachingPoints = pointsResult.rows.length > 0
      ? pointsResult.rows[0].point_description
      : generateDefaultTeachingPoints(slideData);

    // Get comment count
    const commentCountQuery = `
      SELECT COUNT(*) as total
      FROM slide_comments
      WHERE slide_id = $1 AND parent_id IS NULL
    `;

    const countResult = await query(commentCountQuery, [slideId]);
    const commentCount = parseInt(countResult.rows[0].total, 10);

    // Get recent comments (last 2)
    const recentCommentsQuery = `
      SELECT 
        sc.id,
        sc.content,
        sc.type,
        sc.created_at,
        u.full_name as author,
        u.avatar_url
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL
      ORDER BY sc.created_at DESC
      LIMIT 2
    `;

    const commentsResult = await query(recentCommentsQuery, [slideId]);

    return res.status(200).json({
      success: true,
      data: {
        slide: {
          id: slideData.id,
          title: slideData.title,
          description: slideData.description,
          author: slideData.author || '匿名',
          university: slideData.university || '',
          subject: slideData.subject_name,
          difficulty: slideData.difficulty_level,
          tags: slideData.tags,
          views: slideData.view_count,
          uploadDate: formatDate(slideData.created_at),
          fileUrl: slideData.file_url,
          fileType: slideData.file_type,
          pageCount: slideData.page_count,
          avgRating: slideData.avg_rating ? parseFloat(slideData.avg_rating).toFixed(1) : "0.0",
          thumbnail: slideData.thumbnail_url,
          fileUrl: slideData.file_url
        },
        discussion: {
          teachingPoints: teachingPoints,
          commentCount: commentCount,
          recentComments: commentsResult.rows.map(row => ({
            id: row.id,
            content: row.content,
            type: row.type,
            author: row.author || '匿名',
            timestamp: formatDateTime(row.created_at)
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error in getSlideDiscussion:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a comment (admin or own comment only)
 * @route DELETE /api/discussions/comments/:commentId
 * @param {number} commentId - Comment ID
 * @body {number} userId - Current user ID
 * @returns {Object} Success response
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get comment and check ownership
    const commentQuery = 'SELECT user_id FROM slide_comments WHERE id = $1';
    const commentResult = await query(commentQuery, [commentId]);

    if (commentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = commentResult.rows[0];

    // Check if user owns the comment
    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Delete comment
    await query('DELETE FROM slide_comments WHERE id = $1', [commentId]);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteComment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions

/**
 * Format date to Japanese format (YYYY年MM月DD日)
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
 * Format date and time to Japanese format (YYYY年MM月DD日 HH:MM)
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * Get discussion topics for a slide
 * @route GET /api/discussions/slides/:slideId/topics
 * @param {number} slideId - Slide ID
 * @returns {Object} Response with discussion topics
 */
export const getDiscussionTopics = async (req, res) => {
  try {
    const { slideId } = req.params;

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id, title, difficulty_level FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    const slide = slideCheck.rows[0];

    // 1. Get basic info + specific statistics locally to avoid complex group by
    const topicsQuery = `
      SELECT 
        s.id,
        s.title,
        'このスライドについての全般的な討論' as description,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id AND parent_id IS NULL) as comments_count,
        s.view_count as views,
        s.file_url,
        s.file_type
      FROM slides s
      LEFT JOIN slide_tags st ON s.id = st.slide_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE s.id = $1
      GROUP BY s.id, s.view_count, s.file_url, s.file_type
    `;

    const topicsResult = await query(topicsQuery, [slideId]);
    const topicData = topicsResult.rows[0];

    // 2. Calculate average rating in a separate simple query
    const ratingQuery = `
      SELECT COALESCE(AVG(rating), 0)::FLOAT as avg_rating
      FROM slide_comments
      WHERE slide_id = $1
    `;

    const ratingResult = await query(ratingQuery, [slideId]);
    const avgRating = parseFloat(ratingResult.rows[0]?.avg_rating || 0);

    // Create static topics based on the slide
    const topics = [
      {
        id: 1,
        title: topicData.title, // Use title from DB result
        description: 'このスライドについての全般的な討論',
        tags: topicData.tags || [],
        commentsCount: parseInt(topicData.comments_count || 0, 10),
        rating: Math.round(avgRating * 10) / 10,
        views: topicData.views || 0,
        fileUrl: topicData.file_url,
        fileType: topicData.file_type
      }
    ];

    return res.status(200).json({
      success: true,
      data: topics
    });

  } catch (error) {
    console.error('Error in getDiscussionTopics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion topics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get recent activities for a slide discussion
 * @route GET /api/discussions/slides/:slideId/activities
 * @param {number} slideId - Slide ID
 * @query {number} limit - Maximum items to return (default: 10)
 * @returns {Object} Response with recent activities
 */
export const getDiscussionActivities = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { limit = 10 } = req.query;

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Get recent comments as activities
    const activitiesQuery = `
      SELECT 
        sc.id,
        sc.type,
        sc.content,
        sc.created_at,
        u.full_name as user
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL
      ORDER BY sc.created_at DESC
      LIMIT $2
    `;

    const result = await query(activitiesQuery, [slideId, limit]);

    const activities = result.rows.map(row => ({
      type: row.type === 'proposal' ? 'proposal' : 'comment',
      user: row.user || '匿名',
      timestamp: formatRelativeTime(row.created_at),
      content: row.content
    }));

    return res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error in getDiscussionActivities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search and filter comments
 * @route GET /api/discussions/slides/:slideId/comments/search
 * @param {number} slideId - Slide ID
 * @query {string} keyword - Search keyword
 * @query {number} minRating - Minimum rating (1-5)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @returns {Object} Response with filtered comments
 */
export const searchComments = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { keyword = '', minRating = 0, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Build search query
    let whereClause = 'sc.slide_id = $1 AND sc.parent_id IS NULL';
    const params = [slideId];

    if (keyword.trim()) {
      params.push(`%${keyword}%`);
      whereClause += ` AND (sc.content ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Get comments with ratings
    let searchQuery = `
      SELECT 
        sc.id,
        sc.content,
        sc.type,
        sc.created_at,
        u.id as user_id,
        u.full_name as author,
        u.avatar_url,
        u.school_name as university,
        COALESCE(AVG(scr.rating), 0) as avg_rating,
        COUNT(DISTINCT scr.id) as rating_count
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      LEFT JOIN slide_comment_ratings scr ON scr.comment_id = sc.id
      WHERE ${whereClause}
      GROUP BY sc.id, u.id
    `;

    // Add rating filter if specified
    if (minRating > 0) {
      searchQuery += ` HAVING COALESCE(AVG(scr.rating), 0) >= ${minRating}`;
    }

    searchQuery += `
      ORDER BY sc.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await query(searchQuery, params);

    const comments = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      type: row.type,
      timestamp: formatDateTime(row.created_at),
      author: row.author || '匿名',
      userId: row.user_id,
      avatar: row.author ? row.author[0].toUpperCase() : 'A',
      university: row.university || '',
      rating: row.avg_rating > 0 ? Math.round(row.avg_rating * 10) / 10 : null,
      ratingCount: row.rating_count
    }));

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit, 10),
        hasNextPage: parseInt(page, 10) * limit < totalCount,
        hasPreviousPage: parseInt(page, 10) > 1
      }
    });

  } catch (error) {
    console.error('Error in searchComments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate a slide overall
 * @route POST /api/discussions/slides/:slideId/rate
 * @param {number} slideId - Slide ID
 * @body {number} userId - Current user ID
 * @body {number} ratingPoints - Star rating (0-5)
 * @body {number} difficultyScore - Difficulty score (0-100)
 * @body {string} feedback - Optional feedback
 * @returns {Object} Response with rating result
 */
export const rateSlide = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { userId, ratingPoints, difficultyScore = 0, feedback = '' } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (ratingPoints === undefined || ratingPoints === null) {
      return res.status(400).json({
        success: false,
        message: 'Rating points is required'
      });
    }

    if (ratingPoints < 0 || ratingPoints > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating points must be between 0 and 5'
      });
    }

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Check if user exists
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Insert or update rating
    const rateQuery = `
      INSERT INTO slide_ratings (slide_id, user_id, rating_points, difficulty_score, feedback)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slide_id, user_id) 
      DO UPDATE SET 
        rating_points = $3,
        difficulty_score = $4,
        feedback = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, rating_points, difficulty_score
    `;

    const result = await query(rateQuery, [slideId, userId, ratingPoints, difficultyScore, feedback]);
    const rating = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Rating saved successfully',
      data: {
        id: rating.id,
        ratingPoints: rating.rating_points,
        difficultyScore: rating.difficulty_score
      }
    });

  } catch (error) {
    console.error('Error in rateSlide:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Rate a specific page in a slide
 * @route POST /api/discussions/slides/:slideId/pages/:pageIndex/rate
 * @param {number} slideId - Slide ID
 * @param {number} pageIndex - Page index
 * @body {number} userId - Current user ID
 * @body {number} ratingPoints - Star rating (0-5)
 * @body {string} feedback - Optional feedback
 * @returns {Object} Response with rating result
 */
export const rateSlidePage = async (req, res) => {
  try {
    const { slideId, pageIndex } = req.params;
    const { userId, ratingPoints, feedback = '' } = req.body;

    // Validation
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (ratingPoints === undefined || ratingPoints === null) {
      return res.status(400).json({
        success: false,
        message: 'Rating points is required'
      });
    }

    if (ratingPoints < 0 || ratingPoints > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating points must be between 0 and 5'
      });
    }

    // Check if slide exists
    const slideCheck = await query(
      'SELECT id FROM slides WHERE id = $1 AND is_public = true',
      [slideId]
    );

    if (slideCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    // Check if user exists
    const userCheck = await query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Insert or update page rating
    const rateQuery = `
      INSERT INTO slide_page_ratings (slide_id, page_index, user_id, rating_points, feedback)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slide_id, page_index, user_id) 
      DO UPDATE SET 
        rating_points = $4,
        feedback = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, rating_points
    `;

    const result = await query(rateQuery, [slideId, pageIndex, userId, ratingPoints, feedback]);
    const rating = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Page rating saved successfully',
      data: {
        id: rating.id,
        ratingPoints: rating.rating_points
      }
    });

  } catch (error) {
    console.error('Error in rateSlidePage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save page rating',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * Get global activities (comments, replies) across all slides
 * @route GET /api/discussions/activities
 * @query {number} limit - Items per page (default: 20)
 * @query {number} page - Page number (default: 1)
 * @query {string} filter - Filter type: 'all', 'comment', 'reply', 'mine' (default: 'all')
 * @returns {Object} Response with activities
 */
export const getGlobalActivities = async (req, res) => {
  try {
    const { limit = 20, page = 1, filter = 'all' } = req.query;
    const userId = req.user?.userId; // Assuming auth middleware populates this if logged in

    const offset = (page - 1) * limit;

    let whereConditions = ['s.is_public = true']; // Base condition
    let params = [];

    // Filter logic
    if (filter === 'comment') {
      whereConditions.push('sc.parent_id IS NULL');
    } else if (filter === 'reply') {
      whereConditions.push('sc.parent_id IS NOT NULL');
    } else if (filter === 'mine') {
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Login required for this filter' });
      }
      params.push(userId);
      whereConditions.push(`sc.user_id = $${params.length}`);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const queryStr = `
      SELECT 
        sc.id,
        sc.content,
        sc.type,
        sc.created_at,
        sc.page_index,

        sc.rating,
        sc.parent_id,
        u.id as user_id,
        u.full_name as author_name,
        u.avatar_url,
        s.id as slide_id,
        s.title as slide_title,
        p_u.full_name as parent_author_name
      FROM slide_comments sc
      JOIN slides s ON sc.slide_id = s.id
      JOIN users u ON sc.user_id = u.id
      LEFT JOIN slide_comments parent_sc ON sc.parent_id = parent_sc.id
      LEFT JOIN users p_u ON parent_sc.user_id = p_u.id
      ${whereClause}
      ORDER BY sc.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // Add limit and offset to params
    params.push(limit, offset);

    const result = await query(queryStr, params);

    // Format activities
    const activities = result.rows.map(row => {
      let activityType = 'comment';
      let actionText = 'がコメントしました';

      if (row.parent_id) {
        activityType = 'reply';
        actionText = `が${row.parent_author_name || '誰か'}のコメントに返信しました`;
      }

      // If it's your own activity
      if (userId && row.user_id === userId) {
        if (row.parent_id) {
          actionText = `が${row.parent_author_name || '誰か'}のコメントに返信しました`;
        } else {
          actionText = 'がコメントしました';
        }
      }

      return {
        id: row.id,
        type: activityType,
        user: row.author_name || '匿名',
        avatar: row.author_name ? row.author_name[0].toUpperCase() : '?',
        // Determine avatar color deterministically
        avatarColor: ['blue', 'green', 'orange', 'pink'][row.user_id % 4],

        action: actionText,
        rating: row.rating,
        slideTitle: row.slide_title,
        slideId: row.slide_id,
        preview: row.content,
        tags: [],
        time: formatRelativeTime(row.created_at),
        timestamp: row.created_at
      };
    });

    return res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error in getGlobalActivities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions

/**
 * Format time relative to now (2時間前, etc.)
 */
function formatRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);

  if (diff < 60) {
    return '今';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}分前`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}時間前`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}日前`;
  } else {
    return formatDate(date);
  }
}

/**
 * Generate default teaching points based on slide data
 */
function generateDefaultTeachingPoints(slideData) {
  return `「${slideData.title}」は、${slideData.subject_name}の教材です。 `
    + `難易度：${slideData.difficulty_level}。 `
    + `この教材を効果的に活用するためのコツや、外国人生徒に教える際の具体的な指導例・注意点については、 `
    + `下記のディスカッションセクションで教育現場の経験者たちと共有・議論できます。`;
}
