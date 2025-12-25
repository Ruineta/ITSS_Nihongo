import { query } from '../config/database.js';

/**
 * Controller for Slide Discussion Feature
 * Handles comments, proposals, and discussions on slides
 */

/**
 * Get all comments for a specific slide
 * @route GET /api/discussions/slides/:slideId/comments
 * @param {number} slideId - Slide ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} sortBy - Sort option (newest, oldest)
 * @returns {Object} Response with comments and pagination
 */
export const getSlideComments = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { page = 1, limit = 20, sortBy = 'newest' } = req.query;
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

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM slide_comments sc
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL
    `;
    const countResult = await query(countQuery, [slideId]);
    const totalCount = parseInt(countResult.rows[0].total, 10);

    // Get comments with user info
    const commentsQuery = `
      SELECT 
        sc.id,
        sc.content,
        sc.type,
        sc.created_at,
        u.id as user_id,
        u.full_name as author,
        u.avatar_url,
        u.school_name as university,
        COUNT(DISTINCT scr.id) as reply_count
      FROM slide_comments sc
      LEFT JOIN users u ON sc.user_id = u.id
      LEFT JOIN slide_comments scr ON scr.parent_id = sc.id
      WHERE sc.slide_id = $1 AND sc.parent_id IS NULL
      GROUP BY sc.id, u.id
      ${orderByClause}
      LIMIT $2 OFFSET $3
    `;

    const result = await query(commentsQuery, [slideId, limit, offset]);

    const comments = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      type: row.type,
      timestamp: formatDateTime(row.created_at),
      author: row.author || '匿名',
      userId: row.user_id,
      avatar: row.author ? row.author[0].toUpperCase() : 'A',
      university: row.university || '',
      replyCount: parseInt(row.reply_count, 10)
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
 * @returns {Object} Response with created comment
 */
export const createComment = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { content, type = 'comment', userId } = req.body;

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
      INSERT INTO slide_comments (slide_id, user_id, content, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, type, created_at
    `;

    const result = await query(insertQuery, [slideId, userId, content.trim(), type]);
    const comment = result.rows[0];

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
        avatar: user.full_name ? user.full_name[0].toUpperCase() : 'A'
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
        s.difficulty_level,
        s.view_count,
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

    // Get topics with comment counts and average ratings
    const topicsQuery = `
      SELECT 
        $1 as id,
        $2 as title,
        'このスライドについての全般的な討論' as description,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        (SELECT COUNT(*) FROM slide_comments WHERE slide_id = $1 AND parent_id IS NULL) as comments_count,
        COALESCE(AVG(scr.rating), 0) as rating,
        s.view_count as views
      FROM slides s
      LEFT JOIN slide_tags st ON s.id = st.slide_id
      LEFT JOIN tags t ON st.tag_id = t.id
      LEFT JOIN slide_comment_ratings scr ON scr.comment_id IN (
        SELECT id FROM slide_comments WHERE slide_id = s.id
      )
      WHERE s.id = $1
      GROUP BY s.id, s.view_count
    `;

    const topicsResult = await query(topicsQuery, [slideId, slide.title]);

    // Create static topics based on the slide
    const topics = [
      {
        id: 1,
        title: slide.title,
        description: 'このスライドについての全般的な討論',
        tags: topicsResult.rows[0]?.tags || [],
        commentsCount: topicsResult.rows[0]?.comments_count || 0,
        rating: Math.round((topicsResult.rows[0]?.rating || 0) * 10) / 10,
        views: topicsResult.rows[0]?.views || 0
      },
      {
        id: 2,
        title: '教育方法とアプローチ',
        description: 'より効果的な教え方についての提案',
        tags: ['教育法', '効果測定'],
        commentsCount: 0,
        rating: 0,
        views: 0
      },
      {
        id: 3,
        title: '難易度調整の提案',
        description: `${slide.difficulty_level}レベルの適切性について`,
        tags: ['難易度', '改善案'],
        commentsCount: 0,
        rating: 0,
        views: 0
      },
      {
        id: 4,
        title: '補足資料とリソース',
        description: '参考になる追加教材の共有',
        tags: ['リソース', '参考資料'],
        commentsCount: 0,
        rating: 0,
        views: 0
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
