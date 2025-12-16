import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
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
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        schoolName: user.school_name,
        specialization: user.specialization,
        avatarUrl: user.avatar_url,
        yearsOfExperience: user.years_of_experience,
        createdAt: user.created_at
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
