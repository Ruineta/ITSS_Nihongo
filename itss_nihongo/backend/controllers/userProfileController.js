import { query } from '../config/database.js';

/**
 * Get user profile by ID
 * @route GET /api/users/profile/:userId
 * @desc Get profile information of any user (public data)
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get basic user information
    const userQuery = `
      SELECT 
        id, 
        email, 
        full_name, 
        school_name, 
        specialization, 
        years_of_experience, 
        avatar_url,
        created_at
      FROM users
      WHERE id = $1
    `;

    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    const user = userResult.rows[0];

    // Get activity statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM slides WHERE user_id = $1 AND is_public = TRUE) as slide_count,
        (SELECT COUNT(*) FROM know_how_articles WHERE user_id = $1 AND is_public = TRUE) as article_count,
        (SELECT COUNT(*) FROM slide_comments WHERE user_id = $1) as slide_comment_count,
        (SELECT COUNT(*) FROM know_how_comments WHERE user_id = $1) as article_comment_count,
        (SELECT COUNT(*) FROM slide_likes WHERE slide_id IN (SELECT id FROM slides WHERE user_id = $1)) as total_likes_received,
        (SELECT COUNT(*) FROM know_how_reactions WHERE article_id IN (SELECT id FROM know_how_articles WHERE user_id = $1)) as total_reactions_received
    `;

    const statsResult = await query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Get recent activities (posts and comments)
    const activitiesQuery = `
      (
        SELECT 
          'slide' as type,
          s.id,
          s.title,
          s.created_at,
          s.view_count,
          (SELECT COUNT(*) FROM slide_likes WHERE slide_id = s.id) as likes_count,
          (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id) as comments_count
        FROM slides s
        WHERE s.user_id = $1 AND s.is_public = TRUE
      )
      UNION ALL
      (
        SELECT 
          'article' as type,
          a.id,
          a.title,
          a.created_at,
          0 as view_count,
          (SELECT COUNT(*) FROM know_how_reactions WHERE article_id = a.id) as likes_count,
          (SELECT COUNT(*) FROM know_how_comments WHERE article_id = a.id) as comments_count
        FROM know_how_articles a
        WHERE a.user_id = $1 AND a.is_public = TRUE
      )
      UNION ALL
      (
        SELECT 
          'slide_comment' as type,
          sc.id,
          SUBSTRING(sc.content, 1, 100) as title,
          sc.created_at,
          0 as view_count,
          0 as likes_count,
          0 as comments_count
        FROM slide_comments sc
        WHERE sc.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'article_comment' as type,
          kc.id,
          SUBSTRING(kc.content, 1, 100) as title,
          kc.created_at,
          0 as view_count,
          0 as likes_count,
          0 as comments_count
        FROM know_how_comments kc
        WHERE kc.user_id = $1
      )
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const activitiesResult = await query(activitiesQuery, [userId]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          schoolName: user.school_name,
          specialization: user.specialization,
          yearsOfExperience: user.years_of_experience,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at
        },
        statistics: {
          slideCount: parseInt(stats.slide_count),
          articleCount: parseInt(stats.article_count),
          slideCommentCount: parseInt(stats.slide_comment_count),
          articleCommentCount: parseInt(stats.article_comment_count),
          totalCommentCount: parseInt(stats.slide_comment_count) + parseInt(stats.article_comment_count),
          totalLikesReceived: parseInt(stats.total_likes_received),
          totalReactionsReceived: parseInt(stats.total_reactions_received)
        },
        recentActivities: activitiesResult.rows
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user's own profile (with private info)
 * @route GET /api/users/profile/me
 * @desc Get full profile information of the authenticated user
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Get basic user information
    const userQuery = `
      SELECT 
        id, 
        email, 
        full_name, 
        school_name, 
        specialization, 
        years_of_experience, 
        avatar_url,
        last_login_at,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
    `;

    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    const user = userResult.rows[0];

    // Get activity statistics (including private data)
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM slides WHERE user_id = $1) as total_slide_count,
        (SELECT COUNT(*) FROM slides WHERE user_id = $1 AND is_public = TRUE) as public_slide_count,
        (SELECT COUNT(*) FROM know_how_articles WHERE user_id = $1) as total_article_count,
        (SELECT COUNT(*) FROM know_how_articles WHERE user_id = $1 AND is_public = TRUE) as public_article_count,
        (SELECT COUNT(*) FROM slide_comments WHERE user_id = $1) as slide_comment_count,
        (SELECT COUNT(*) FROM know_how_comments WHERE user_id = $1) as article_comment_count,
        (SELECT COUNT(*) FROM slide_likes WHERE slide_id IN (SELECT id FROM slides WHERE user_id = $1)) as total_likes_received,
        (SELECT COUNT(*) FROM know_how_reactions WHERE article_id IN (SELECT id FROM know_how_articles WHERE user_id = $1)) as total_reactions_received,
        (SELECT SUM(view_count) FROM slides WHERE user_id = $1) as total_views
    `;

    const statsResult = await query(statsQuery, [userId]);
    const stats = statsResult.rows[0];

    // Get recent activities
    const activitiesQuery = `
      (
        SELECT 
          'slide' as type,
          s.id,
          s.title,
          s.created_at,
          s.is_public,
          s.view_count,
          (SELECT COUNT(*) FROM slide_likes WHERE slide_id = s.id) as likes_count,
          (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id) as comments_count
        FROM slides s
        WHERE s.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'article' as type,
          a.id,
          a.title,
          a.created_at,
          a.is_public,
          0 as view_count,
          (SELECT COUNT(*) FROM know_how_reactions WHERE article_id = a.id) as likes_count,
          (SELECT COUNT(*) FROM know_how_comments WHERE article_id = a.id) as comments_count
        FROM know_how_articles a
        WHERE a.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'slide_comment' as type,
          sc.id,
          SUBSTRING(sc.content, 1, 100) as title,
          sc.created_at,
          TRUE as is_public,
          0 as view_count,
          0 as likes_count,
          0 as comments_count
        FROM slide_comments sc
        WHERE sc.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'article_comment' as type,
          kc.id,
          SUBSTRING(kc.content, 1, 100) as title,
          kc.created_at,
          TRUE as is_public,
          0 as view_count,
          0 as likes_count,
          0 as comments_count
        FROM know_how_comments kc
        WHERE kc.user_id = $1
      )
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const activitiesResult = await query(activitiesQuery, [userId]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          schoolName: user.school_name,
          specialization: user.specialization,
          yearsOfExperience: user.years_of_experience,
          avatarUrl: user.avatar_url,
          lastLoginAt: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        statistics: {
          totalSlideCount: parseInt(stats.total_slide_count),
          publicSlideCount: parseInt(stats.public_slide_count),
          totalArticleCount: parseInt(stats.total_article_count),
          publicArticleCount: parseInt(stats.public_article_count),
          slideCommentCount: parseInt(stats.slide_comment_count),
          articleCommentCount: parseInt(stats.article_comment_count),
          totalCommentCount: parseInt(stats.slide_comment_count) + parseInt(stats.article_comment_count),
          totalLikesReceived: parseInt(stats.total_likes_received),
          totalReactionsReceived: parseInt(stats.total_reactions_received),
          totalViews: parseInt(stats.total_views) || 0
        },
        recentActivities: activitiesResult.rows
      }
    });
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @desc Update profile information of the authenticated user
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const { full_name, school_name, specialization, years_of_experience, avatar_url } = req.body;

    // Validation
    if (!full_name || full_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '氏名は必須です'
      });
    }

    // Check if years_of_experience is a valid number if provided
    if (years_of_experience !== undefined && years_of_experience !== null) {
      const yearsNum = parseInt(years_of_experience);
      if (isNaN(yearsNum) || yearsNum < 0) {
        return res.status(400).json({
          success: false,
          message: '教員経験年数は0以上の数値である必要があります'
        });
      }
    }

    // Update user profile
    const updateQuery = `
      UPDATE users
      SET 
        full_name = $1,
        school_name = $2,
        specialization = $3,
        years_of_experience = $4,
        avatar_url = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, full_name, school_name, specialization, years_of_experience, avatar_url, updated_at
    `;

    const result = await query(updateQuery, [
      full_name.trim(),
      school_name?.trim() || null,
      specialization?.trim() || null,
      years_of_experience !== undefined && years_of_experience !== null ? parseInt(years_of_experience) : 0,
      avatar_url?.trim() || null,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    const updatedUser = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'プロフィールが正常に更新されました',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.full_name,
          schoolName: updatedUser.school_name,
          specialization: updatedUser.specialization,
          yearsOfExperience: updatedUser.years_of_experience,
          avatarUrl: updatedUser.avatar_url,
          updatedAt: updatedUser.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's public slides
 * @route GET /api/users/profile/:userId/slides
 * @desc Get all public slides uploaded by a specific user
 */
export const getUserSlides = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    // Get user's public slides
    const slidesQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.thumbnail_url,
        s.file_type,
        s.difficulty_level,
        s.view_count,
        s.created_at,
        sub.name as subject_name,
        u.full_name as author_name,
        (SELECT COUNT(*) FROM slide_likes WHERE slide_id = s.id) as likes_count,
        (SELECT COUNT(*) FROM slide_comments WHERE slide_id = s.id) as comments_count
      FROM slides s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 AND s.is_public = TRUE
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM slides
      WHERE user_id = $1 AND is_public = TRUE
    `;

    const [slidesResult, countResult] = await Promise.all([
      query(slidesQuery, [userId, limit, offset]),
      query(countQuery, [userId])
    ]);

    const totalSlides = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      data: {
        slides: slidesResult.rows,
        pagination: {
          total: totalSlides,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < totalSlides
        }
      }
    });
  } catch (error) {
    console.error('Get user slides error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's public articles
 * @route GET /api/users/profile/:userId/articles
 * @desc Get all public know-how articles by a specific user
 */
export const getUserArticles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    // Get user's public articles
    const articlesQuery = `
      SELECT 
        a.id,
        a.title,
        SUBSTRING(a.content, 1, 200) as excerpt,
        a.created_at,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        (SELECT COUNT(*) FROM know_how_reactions WHERE article_id = a.id) as reactions_count,
        (SELECT COUNT(*) FROM know_how_comments WHERE article_id = a.id) as comments_count
      FROM know_how_articles a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1 AND a.is_public = TRUE
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM know_how_articles
      WHERE user_id = $1 AND is_public = TRUE
    `;

    const [articlesResult, countResult] = await Promise.all([
      query(articlesQuery, [userId, limit, offset]),
      query(countQuery, [userId])
    ]);

    const totalArticles = parseInt(countResult.rows[0].total);

    res.status(200).json({
      success: true,
      data: {
        articles: articlesResult.rows,
        pagination: {
          total: totalArticles,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < totalArticles
        }
      }
    });
  } catch (error) {
    console.error('Get user articles error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  getUserProfile,
  getMyProfile,
  updateProfile,
  getUserSlides,
  getUserArticles
};
