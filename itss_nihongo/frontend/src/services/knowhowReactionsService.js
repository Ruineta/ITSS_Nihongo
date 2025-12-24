const API_BASE_URL = '/api';

/**
 * Add or update a reaction to an article
 * @param {number} articleId - Article ID
 * @param {string} reactionType - Reaction type (love, like, haha, wow, sad, angry)
 * @param {string} token - JWT token
 * @returns {Promise<Object>}
 */
export const addReaction = async (articleId, reactionType, token) => {
  try {
    if (!token) {
      throw new Error('認証トークンが必要です');
    }

    const response = await fetch(`${API_BASE_URL}/knowhow/${articleId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reaction_type: reactionType })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'リアクション追加に失敗しました');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Get reaction counts for an article
 * @param {number} articleId - Article ID
 * @returns {Promise<Object>}
 */
export const getArticleReactions = async (articleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/knowhow/${articleId}/reactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('リアクション取得に失敗しました');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error fetching reactions:', error);
    throw error;
  }
};

/**
 * Get current user's reaction to an article
 * @param {number} articleId - Article ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>}
 */
export const getUserReaction = async (articleId, token) => {
  try {
    if (!token) {
      return {
        success: true,
        data: { reaction_type: null }
      };
    }

    const response = await fetch(`${API_BASE_URL}/knowhow/${articleId}/reactions/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('ユーザーリアクション取得に失敗しました');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    throw error;
  }
};

const knowhowReactionsService = {
  addReaction,
  getArticleReactions,
  getUserReaction
};

export default knowhowReactionsService;
