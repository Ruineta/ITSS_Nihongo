import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Hardcoded default for easy setup - change in production for security
const JWT_SECRET = process.env.JWT_SECRET || 'itss-nihongo-default-jwt-secret-2024-change-in-production-a8f5f167f44f4964e6c998dee827110c';
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, full_name, school_name, specialization } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレス、パスワード、氏名は必須です'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスの形式が正しくありません'
      });
    }

    // Password validation (min 8 chars, must have letters and numbers)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは8文字以上である必要があります'
      });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'パスワードは英字と数字を含む必要があります'
      });
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'このメールアドレスは既に登録されています'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (email, password_hash, full_name, school_name, specialization)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, school_name, specialization, created_at
    `;

    const result = await query(insertQuery, [
      email,
      passwordHash,
      full_name,
      school_name || null,
      specialization || null
    ]);

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'アカウントの登録が完了しました',
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        schoolName: newUser.school_name,
        specialization: newUser.specialization,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'メールアドレスとパスワードを入力してください'
      });
    }

    // Find user by email
    const userQuery = `
      SELECT id, email, password_hash, full_name, school_name, specialization, avatar_url
      FROM users
      WHERE email = $1
    `;

    const result = await query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // Update last login time
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'ログインに成功しました',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          schoolName: user.school_name,
          specialization: user.specialization,
          avatarUrl: user.avatar_url
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    const userQuery = `
      SELECT id, email, full_name, school_name, specialization, avatar_url, years_of_experience, created_at
      FROM users
      WHERE id = $1
    `;

    const result = await query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          schoolName: user.school_name,
          specialization: user.specialization,
          avatarUrl: user.avatar_url,
          yearsOfExperience: user.years_of_experience,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/auth/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware

    // Query for slides uploaded by user
    const slidesQuery = `SELECT COUNT(*) as count FROM slides WHERE user_id = $1`;
    const slidesResult = await query(slidesQuery, [userId]);
    const slidesUploaded = parseInt(slidesResult.rows[0].count);

    // Query for articles posted in know_how_articles by user
    const articlesQuery = `SELECT COUNT(*) as count FROM know_how_articles WHERE user_id = $1`;
    const articlesResult = await query(articlesQuery, [userId]);
    const articlesPosted = parseInt(articlesResult.rows[0].count);

    // Query for comments posted by user (slide comments + know how comments)
    const commentsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM slide_comments WHERE user_id = $1) +
        (SELECT COUNT(*) FROM know_how_comments WHERE user_id = $1) as count
    `;
    const commentsResult = await query(commentsQuery, [userId]);
    const commentsPosted = parseInt(commentsResult.rows[0].count);

    // Query for likes received on user's slides
    const likesQuery = `
      SELECT COUNT(*) as count
      FROM slide_likes sl
      JOIN slides s ON sl.slide_id = s.id
      WHERE s.user_id = $1
    `;
    const likesResult = await query(likesQuery, [userId]);
    const likesReceived = parseInt(likesResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        slidesUploaded,
        articlesPosted,
        commentsPosted,
        likesReceived
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get public user profile by ID
 */
export const getPublicUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const queryText = `
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.school_name, 
        u.specialization, 
        u.years_of_experience,
        u.created_at
      FROM users u
      WHERE u.id = $1
    `;

    const result = await query(queryText, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email, // Depending on privacy, maybe hide email
        fullName: user.full_name,
        schoolName: user.school_name,
        specialization: user.specialization,
        yearsOfExperience: user.years_of_experience,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching public user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

/**
 * Get public user activities by ID
 */
export const getPublicUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Query to get all activities (uploads, slide comments, know-how comments)
    // Same as getUserActivities but using param userId instead of req.user
    const activitiesQuery = `
      -- Slide uploads
      SELECT 
        'upload' as type,
        s.id as item_id,
        s.title,
        s.created_at as timestamp,
        NULL as content
      FROM slides s
      WHERE s.user_id = $1

      UNION ALL

      -- Slide comments
      SELECT 
        'slide_comment' as type,
        sc.slide_id as item_id,
        s.title,
        sc.created_at as timestamp,
        sc.content
      FROM slide_comments sc
      JOIN slides s ON sc.slide_id = s.id
      WHERE sc.user_id = $1

      UNION ALL

      -- Know-how comments
      SELECT 
        'knowhow_comment' as type,
        kc.article_id as item_id,
        ka.title,
        kc.created_at as timestamp,
        kc.content
      FROM know_how_comments kc
      JOIN know_how_articles ka ON kc.article_id = ka.id
      WHERE kc.user_id = $1

       UNION ALL

      -- Know-how posts
      SELECT 
        'knowhow_post' as type,
        ka.id as item_id,
        ka.title,
        ka.created_at as timestamp,
        NULL as content
      FROM know_how_articles ka
      WHERE ka.user_id = $1

      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(activitiesQuery, [userId, limit]);

    // Format activities
    const activities = result.rows.map(row => ({
      type: row.type,
      itemId: row.item_id,
      title: row.title,
      content: row.content,
      timestamp: row.timestamp
    }));

    return res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching public user activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

/**
 * Get public user stats by ID
 */
export const getPublicUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Count slides uploaded
    const slidesQuery = 'SELECT COUNT(*) FROM slides WHERE user_id = $1';
    const slidesResult = await query(slidesQuery, [userId]);
    const slidesCount = parseInt(slidesResult.rows[0].count);

    // 2. Count know-how articles posted
    const articlesQuery = 'SELECT COUNT(*) FROM know_how_articles WHERE user_id = $1';
    const articlesResult = await query(articlesQuery, [userId]);
    const articlesCount = parseInt(articlesResult.rows[0].count);

    // 3. Count comments posted (slides + know-how)
    const slideCommentsQuery = 'SELECT COUNT(*) FROM slide_comments WHERE user_id = $1';
    const slideCommentsResult = await query(slideCommentsQuery, [userId]);

    const knowhowCommentsQuery = 'SELECT COUNT(*) FROM know_how_comments WHERE user_id = $1';
    const knowhowCommentsResult = await query(knowhowCommentsQuery, [userId]);

    const totalComments = parseInt(slideCommentsResult.rows[0].count) + parseInt(knowhowCommentsResult.rows[0].count);

    // 4. Count likes received (on slides + know-how)
    // Likes on user's slides
    const slideLikesQuery = `
      SELECT COUNT(*) 
      FROM slide_likes sl
      JOIN slides s ON sl.slide_id = s.id
      WHERE s.user_id = $1
    `;
    const slideLikesResult = await query(slideLikesQuery, [userId]);

    // Likes on user's know-how articles
    const articleLikesQuery = `
      SELECT COUNT(*) 
      FROM know_how_reactions kr
      JOIN know_how_articles ka ON kr.article_id = ka.id
      WHERE ka.user_id = $1
    `;
    const articleLikesResult = await query(articleLikesQuery, [userId]);

    const totalLikes = parseInt(slideLikesResult.rows[0].count) + parseInt(articleLikesResult.rows[0].count);

    return res.status(200).json({
      success: true,
      data: {
        slidesUploaded: slidesCount,
        articlesPosted: articlesCount,
        commentsPosted: totalComments,
        likesReceived: totalLikes
      }
    });

  } catch (error) {
    console.error('Error fetching public user stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    });
  }
};

/**
 * Get user activities (uploads, comments)
 * @route GET /api/auth/activities
 */
export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;

    // Query to get all activities (uploads, slide comments, know-how comments, know-how posts)
    const activitiesQuery = `
      -- Slide uploads
      SELECT 
        'upload' as type,
        s.id as item_id,
        s.title,
        s.created_at as timestamp,
        NULL as content
      FROM slides s
      WHERE s.user_id = $1

      UNION ALL

      -- Slide comments
      SELECT 
        'slide_comment' as type,
        sc.slide_id as item_id,
        s.title,
        sc.created_at as timestamp,
        sc.content
      FROM slide_comments sc
      JOIN slides s ON sc.slide_id = s.id
      WHERE sc.user_id = $1

      UNION ALL

      -- Know-how comments
      SELECT 
        'knowhow_comment' as type,
        kc.article_id as item_id,
        ka.title,
        kc.created_at as timestamp,
        kc.content
      FROM know_how_comments kc
      JOIN know_how_articles ka ON kc.article_id = ka.id
      WHERE kc.user_id = $1

      UNION ALL

      -- Know-how article posts
      SELECT 
        'knowhow_post' as type,
        ka.id as item_id,
        ka.title,
        ka.created_at as timestamp,
        ka.content
      FROM know_how_articles ka
      WHERE ka.user_id = $1

      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(activitiesQuery, [userId, limit]);

    // Format activities
    const activities = result.rows.map(row => ({
      type: row.type,
      itemId: row.item_id,
      title: row.title,
      content: row.content,
      timestamp: row.timestamp
    }));

    res.status(200).json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
