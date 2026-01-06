const API_BASE_URL = '/api';

/**
 * Get comments for a specific article
 * @param {number} articleId - Article ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Comments with pagination
 */
export const getArticleComments = async (articleId, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    
    const queryParams = new URLSearchParams({
      page,
      limit
    });

    const response = await fetch(
      `${API_BASE_URL}/knowhow/${articleId}/comments?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false }
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching article comments:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false }
    };
  }
};

/**
 * Create a comment on an article
 * @param {number} articleId - Article ID
 * @param {string} content - Comment content
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (articleId, content, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    if (!content || !content.trim()) {
      throw new Error('Comment content is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/knowhow/${articleId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim()
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again');
      }
      throw new Error(errorData.message || 'Failed to post comment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Get replies for a comment
 * @param {number} articleId - Article ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object>} Replies
 */
export const getCommentReplies = async (articleId, commentId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/knowhow/${articleId}/comments/${commentId}/replies`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: []
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comment replies:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Create a reply to a comment
 * @param {number} articleId - Article ID
 * @param {number} commentId - Comment ID
 * @param {string} content - Reply content
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} Created reply
 */
export const createReply = async (articleId, commentId, content, token) => {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    if (!content || !content.trim()) {
      throw new Error('Reply content is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/knowhow/${articleId}/comments/${commentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim()
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again');
      }
      throw new Error(errorData.message || 'Failed to post reply');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export default {
  getArticleComments,
  createComment,
  getCommentReplies,
  createReply
};
