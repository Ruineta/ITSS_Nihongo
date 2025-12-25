import { query, getClient } from '../config/database.js';

/**
 * Knowledge-Sharing Article Controller
 * Handles article posting, validation, and tag management
 */

/**
 * Validate request body for article posting
 * @param {Object} body - Request body
 * @returns {Object} Validation result with errors array
 */
const validateArticleInput = (body) => {
  const errors = [];
  
  // Validate title
  if (!body.title || typeof body.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (body.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (body.title.length > 100) {
    errors.push('Title must be 100 characters or less');
  }
  
  // Validate content
  if (!body.content || typeof body.content !== 'string') {
    errors.push('Content is required and must be a string');
  } else if (body.content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }
  
  // Validate tags (optional)
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('Tags must be an array');
    } else {
      // Validate each tag
      for (let i = 0; i < body.tags.length; i++) {
        if (typeof body.tags[i] !== 'string') {
          errors.push(`Tag at index ${i} must be a string`);
        } else if (body.tags[i].trim().length === 0) {
          errors.push(`Tag at index ${i} cannot be empty`);
        } else if (body.tags[i].length > 50) {
          errors.push(`Tag at index ${i} must be 50 characters or less`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalize tag name
 * - Trim whitespace
 * - Convert to lowercase
 * - Remove special characters (keep only alphanumeric, spaces, hyphens)
 * @param {string} tagName - Raw tag name
 * @returns {string} Normalized tag name
 */
const normalizeTagName = (tagName) => {
  return tagName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
};

/**
 * Process and link tags to article
 * @param {number} articleId - Article ID
 * @param {Array<string>} tags - Array of tag names
 * @param {Object} client - Database client for transaction
 * @throws {Error} If tag processing fails
 */
const processTags = async (articleId, tags, client) => {
  if (!tags || tags.length === 0) {
    return;
  }
  
  for (const tagName of tags) {
    const normalizedName = normalizeTagName(tagName);
    
    if (normalizedName.length === 0) {
      // Skip empty tags after normalization
      continue;
    }
    
    try {
      // Insert tag if it doesn't exist, or get existing tag
      const tagResult = await client.query(
        'INSERT INTO tags (name, type) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
        [normalizedName, 'keyword']
      );
      
      const tagId = tagResult.rows[0].id;
      
      // Link tag to article
      await client.query(
        'INSERT INTO know_how_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [articleId, tagId]
      );
    } catch (error) {
      console.error(`Error processing tag "${normalizedName}":`, error);
      throw error;
    }
  }
};

/**
 * Create a new knowledge-sharing article
 * @route POST /api/knowhow/post
 * @access Private (requires authentication)
 * @param {Object} req.body - Article data
 * @param {string} req.body.title - Article title (required, max 100 chars)
 * @param {string} req.body.content - Article content (required)
 * @param {Array<string>} req.body.tags - Tags (optional)
 * @param {boolean} req.body.is_public - Public flag (optional, default: true)
 * @returns {Object} Response with created article data
 */
export const postArticle = async (req, res) => {
  try {
    const { title, content, tags = [], is_public = true } = req.body;
    
    // Get user ID from JWT token (set by authenticateToken middleware)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    // Validate input
    const validation = validateArticleInput({ title, content, tags });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    // Get database client for transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert article
      const insertQuery = `
        INSERT INTO know_how_articles (user_id, title, content, is_public)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at, updated_at
      `;
      
      const insertResult = await client.query(insertQuery, [
        userId,
        title.trim(),
        content.trim(),
        is_public
      ]);
      
      const articleId = insertResult.rows[0].id;
      const createdAt = insertResult.rows[0].created_at;
      const updatedAt = insertResult.rows[0].updated_at;
      
      // Process tags
      if (tags && tags.length > 0) {
        await processTags(articleId, tags, client);
      }
      
      await client.query('COMMIT');
      
      // Fetch complete article data with tags
      const articleQuery = `
        SELECT 
          ka.id,
          ka.title,
          ka.content,
          ka.is_public,
          ka.created_at,
          ka.updated_at,
          u.full_name as author,
          u.school_name as school,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) as tags
        FROM know_how_articles ka
        LEFT JOIN users u ON ka.user_id = u.id
        LEFT JOIN know_how_tags kht ON ka.id = kht.article_id
        LEFT JOIN tags t ON kht.tag_id = t.id
        WHERE ka.id = $1
        GROUP BY ka.id, u.id
      `;
      
      const articleResult = await query(articleQuery, [articleId]);
      const article = articleResult.rows[0];
      
      return res.status(201).json({
        success: true,
        message: 'Article posted successfully',
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          author: article.author,
          school: article.school,
          isPublic: article.is_public,
          tags: article.tags,
          createdAt: article.created_at,
          updatedAt: article.updated_at
        }
      });
      
    } catch (transactionError) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', transactionError);
      throw transactionError;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error posting article:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to post article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get article by ID
 * @route GET /api/knowhow/:id
 * @access Public
 * @param {number} req.params.id - Article ID
 * @returns {Object} Article data
 */
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }
    
    const articleQuery = `
      SELECT 
        ka.id,
        ka.title,
        ka.content,
        ka.is_public,
        ka.created_at,
        ka.updated_at,
        u.id as user_id,
        u.full_name as author,
        u.school_name as school,
        u.avatar_url as author_avatar,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM know_how_articles ka
      LEFT JOIN users u ON ka.user_id = u.id
      LEFT JOIN know_how_tags kht ON ka.id = kht.article_id
      LEFT JOIN tags t ON kht.tag_id = t.id
      WHERE ka.id = $1
      GROUP BY ka.id, u.id
    `;
    
    const result = await query(articleQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    const article = result.rows[0];
    
    return res.status(200).json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        content: article.content,
        author: article.author,
        authorId: article.user_id,
        authorAvatar: article.author_avatar,
        school: article.school,
        isPublic: article.is_public,
        tags: article.tags,
        createdAt: article.created_at,
        updatedAt: article.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching article:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get list of articles with pagination and filtering
 * @route GET /api/knowhow
 * @access Public
 * @query {number} page - Page number (optional, default: 1)
 * @query {number} limit - Items per page (optional, default: 10, max: 100)
 * @query {string} tag - Filter by tag name (optional)
 * @query {string} author - Filter by author name (optional)
 * @returns {Object} Articles list with pagination info
 */
export const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, author } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;
    
    // Build WHERE clause based on filters
    let whereConditions = ['ka.is_public = true'];
    let queryParams = [];
    let paramIndex = 1;
    
    // Filter by tag
    if (tag && tag.trim()) {
      whereConditions.push(`LOWER(t.name) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${tag.trim()}%`);
      paramIndex++;
    }
    
    // Filter by author name
    if (author && author.trim()) {
      whereConditions.push(`LOWER(u.full_name) LIKE LOWER($${paramIndex})`);
      queryParams.push(`%${author.trim()}%`);
      paramIndex++;
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT ka.id) as total
      FROM know_how_articles ka
      LEFT JOIN users u ON ka.user_id = u.id
      LEFT JOIN know_how_tags kht ON ka.id = kht.article_id
      LEFT JOIN tags t ON kht.tag_id = t.id
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total) || 0;
    const totalPages = Math.ceil(total / limitNum);
    
    // Get articles with pagination
    const articlesQuery = `
      SELECT 
        ka.id,
        ka.title,
        ka.content,
        ka.is_public,
        ka.created_at,
        ka.updated_at,
        u.full_name as author,
        u.school_name as school,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        (SELECT COUNT(*) FROM know_how_comments WHERE article_id = ka.id) as comment_count
      FROM know_how_articles ka
      LEFT JOIN users u ON ka.user_id = u.id
      LEFT JOIN know_how_tags kht ON ka.id = kht.article_id
      LEFT JOIN tags t ON kht.tag_id = t.id
      ${whereClause}
      GROUP BY ka.id, u.id
      ORDER BY ka.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limitNum, offset);
    
    const articlesResult = await query(articlesQuery, queryParams);
    
    const articles = articlesResult.rows.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      author: article.author,
      school: article.school,
      isPublic: article.is_public,
      tags: article.tags,
      commentCount: parseInt(article.comment_count) || 0,
      createdAt: article.created_at,
      updatedAt: article.updated_at
    }));
    
    return res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages
      }
    });
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get comments for a specific article
 * @route GET /api/knowhow/:articleId/comments
 * @access Public
 * @param {number} articleId - Article ID
 * @query {number} page - Page number (optional, default: 1)
 * @query {number} limit - Items per page (optional, default: 20)
 * @returns {Object} Comments with pagination
 */
export const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if article exists
    const articleCheck = await query(
      'SELECT id FROM know_how_articles WHERE id = $1 AND is_public = true',
      [articleId]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM know_how_comments
      WHERE article_id = $1 AND parent_id IS NULL
    `;
    const countResult = await query(countQuery, [articleId]);
    const total = parseInt(countResult.rows[0].total) || 0;

    // Get comments
    const commentsQuery = `
      SELECT 
        khc.id,
        khc.content,
        khc.created_at,
        u.full_name as author,
        u.school_name as university,
        u.avatar_url,
        COUNT(DISTINCT khcr.id) as reply_count
      FROM know_how_comments khc
      LEFT JOIN users u ON khc.user_id = u.id
      LEFT JOIN know_how_comments khcr ON khcr.parent_id = khc.id
      WHERE khc.article_id = $1 AND khc.parent_id IS NULL
      GROUP BY khc.id, u.id
      ORDER BY khc.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(commentsQuery, [articleId, limit, offset]);

    const comments = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      author: row.author || '匿名',
      university: row.university || '',
      avatar: row.author ? row.author[0].toUpperCase() : 'A',
      timestamp: formatDateTime(row.created_at),
      replyCount: parseInt(row.reply_count) || 0
    }));

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: parseInt(page) * limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching article comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a comment on an article
 * @route POST /api/knowhow/:articleId/comments
 * @access Private (requires authentication)
 * @param {number} articleId - Article ID
 * @body {string} content - Comment content (required)
 * @returns {Object} Created comment
 */
export const createArticleComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    // Get user ID from JWT token
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if article exists
    const articleCheck = await query(
      'SELECT id FROM know_how_articles WHERE id = $1 AND is_public = true',
      [articleId]
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get user info
    const userCheck = await query(
      'SELECT id, full_name, school_name, avatar_url FROM users WHERE id = $1',
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
      INSERT INTO know_how_comments (article_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `;

    const result = await query(insertQuery, [articleId, userId, content.trim()]);
    const comment = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: {
        id: comment.id,
        content: comment.content,
        author: user.full_name || '匿名',
        university: user.school_name || '',
        avatar: user.full_name ? user.full_name[0].toUpperCase() : 'A',
        timestamp: formatDateTime(comment.created_at)
      }
    });

  } catch (error) {
    console.error('Error creating article comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get replies for a comment
 * @route GET /api/knowhow/:articleId/comments/:commentId/replies
 * @param {number} articleId - Article ID
 * @param {number} commentId - Comment ID
 * @returns {Object} Array of replies
 */
export const getCommentReplies = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;

    // Check if comment exists and belongs to article
    const commentCheck = await query(
      'SELECT id FROM know_how_comments WHERE id = $1 AND article_id = $2 AND parent_id IS NULL',
      [commentId, articleId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Get replies
    const repliesQuery = `
      SELECT 
        khc.id,
        khc.content,
        khc.created_at,
        u.full_name as author,
        u.school_name as university,
        u.avatar_url
      FROM know_how_comments khc
      LEFT JOIN users u ON khc.user_id = u.id
      WHERE khc.parent_id = $1
      ORDER BY khc.created_at ASC
    `;

    const result = await query(repliesQuery, [commentId]);

    const replies = result.rows.map(row => ({
      id: row.id,
      content: row.content,
      author: row.author || '匿名',
      university: row.university || '',
      avatar: row.author ? row.author[0].toUpperCase() : 'A',
      timestamp: formatDateTime(row.created_at)
    }));

    return res.status(200).json({
      success: true,
      data: replies
    });

  } catch (error) {
    console.error('Error fetching comment replies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a reply to a comment
 * @route POST /api/knowhow/:articleId/comments/:commentId/replies
 * @access Private (requires authentication)
 * @param {number} articleId - Article ID
 * @param {number} commentId - Comment ID
 * @body {string} content - Reply content (required)
 * @returns {Object} Created reply
 */
export const createCommentReply = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { content } = req.body;

    // Get user ID from JWT token
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    // Check if comment exists and belongs to article
    const commentCheck = await query(
      'SELECT id FROM know_how_comments WHERE id = $1 AND article_id = $2 AND parent_id IS NULL',
      [commentId, articleId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Get user info
    const userCheck = await query(
      'SELECT id, full_name, school_name, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userCheck.rows[0];

    // Insert reply
    const insertQuery = `
      INSERT INTO know_how_comments (article_id, user_id, content, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, created_at
    `;

    const result = await query(insertQuery, [articleId, userId, content.trim(), commentId]);
    const reply = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: {
        id: reply.id,
        content: reply.content,
        author: user.full_name || '匿名',
        university: user.school_name || '',
        avatar: user.full_name ? user.full_name[0].toUpperCase() : 'A',
        timestamp: formatDateTime(reply.created_at)
      }
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post reply',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Format date and time to Japanese format
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
 * Add or update a reaction to an article
 * @route POST /api/knowhow/:articleId/reactions
 */
export const addReaction = async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { reaction_type } = req.body;
    const userId = req.user.userId;

    // Validate articleId
    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }

    // Validate reaction type
    const validReactions = ['love', 'like', 'haha', 'wow', 'sad', 'angry'];
    if (!reaction_type || !validReactions.includes(reaction_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reaction type. Must be one of: ${validReactions.join(', ')}`
      });
    }

    // Check if article exists
    const articleResult = await query(
      'SELECT id FROM know_how_articles WHERE id = $1',
      [articleId]
    );

    if (articleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user already has a reaction to this article
    const existingReaction = await query(
      'SELECT reaction_type FROM know_how_reactions WHERE user_id = $1 AND article_id = $2',
      [userId, articleId]
    );

    if (existingReaction.rows.length > 0) {
      const existing = existingReaction.rows[0];
      
      // If same reaction type, remove it
      if (existing.reaction_type === reaction_type) {
        await query(
          'DELETE FROM know_how_reactions WHERE user_id = $1 AND article_id = $2',
          [userId, articleId]
        );
        
        return res.status(200).json({
          success: true,
          message: 'Reaction removed',
          data: {
            removed: true,
            reaction_type: reaction_type
          }
        });
      } else {
        // Update reaction type
        await query(
          'UPDATE know_how_reactions SET reaction_type = $1 WHERE user_id = $2 AND article_id = $3',
          [reaction_type, userId, articleId]
        );
        
        return res.status(200).json({
          success: true,
          message: 'Reaction updated',
          data: {
            removed: false,
            reaction_type: reaction_type
          }
        });
      }
    } else {
      // Create new reaction
      await query(
        'INSERT INTO know_how_reactions (user_id, article_id, reaction_type) VALUES ($1, $2, $3)',
        [userId, articleId, reaction_type]
      );
      
      return res.status(201).json({
        success: true,
        message: 'Reaction added',
        data: {
          removed: false,
          reaction_type: reaction_type
        }
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get reactions for an article
 * @route GET /api/knowhow/:articleId/reactions
 */
export const getArticleReactions = async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);

    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }

    // Check if article exists
    const articleResult = await query(
      'SELECT id FROM know_how_articles WHERE id = $1',
      [articleId]
    );

    if (articleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get reaction counts grouped by type
    const reactionResult = await query(
      'SELECT reaction_type, COUNT(*) as count FROM know_how_reactions WHERE article_id = $1 GROUP BY reaction_type',
      [articleId]
    );

    const reactionCounts = {
      love: 0,
      like: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };

    reactionResult.rows.forEach(row => {
      reactionCounts[row.reaction_type] = parseInt(row.count);
    });

    res.status(200).json({
      success: true,
      data: reactionCounts
    });
  } catch (error) {
    console.error('Error getting reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's reaction to an article
 * @route GET /api/knowhow/:articleId/reactions/user
 */
export const getUserReaction = async (req, res) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const userId = req.user.userId;

    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid article ID'
      });
    }

    const result = await query(
      'SELECT reaction_type FROM know_how_reactions WHERE user_id = $1 AND article_id = $2',
      [userId, articleId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          reaction_type: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reaction_type: result.rows[0].reaction_type
      }
    });
  } catch (error) {
    console.error('Error getting user reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  postArticle,
  getArticles,
  getArticle,
  getArticleComments,
  createArticleComment,
  getCommentReplies,
  createCommentReply,
  addReaction,
  getArticleReactions,
  getUserReaction
};
