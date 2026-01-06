const API_BASE_URL = '/api';

/**
 * Get slide discussion details (basic info + teaching points + recent comments)
 * @param {number} slideId - Slide ID
 * @returns {Promise<Object>} Discussion details
 */
export const getSlideDiscussion = async (slideId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching discussion details:', error);
    throw error;
  }
};

/**
 * Get all comments for a slide with pagination
 * @param {number} slideId - Slide ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @param {string} options.sortBy - 'newest' or 'oldest' (default: 'newest')
 * @returns {Promise<Object>} Comments with pagination info
 */
export const getSlideComments = async (slideId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest',
      pageIndex
    } = options;

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy
    });

    if (pageIndex !== undefined) {
      queryParams.append('pageIndex', pageIndex);
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/comments?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

/**
 * Create a new comment or proposal
 * @param {number} slideId - Slide ID
 * @param {Object} commentData - Comment data
 * @param {string} commentData.content - Comment content (required)
 * @param {string} commentData.type - 'comment' or 'proposal' (default: 'comment')
 * @param {number} commentData.userId - Current user ID (required)
 * @param {string} commentData.token - Auth token (required)
 * @returns {Promise<Object>} Created comment
 */
export const createComment = async (slideId, commentData) => {
  try {
    const { content, type = 'comment', userId, token, pageIndex, rating } = commentData;

    // Validation
    if (!content || !content.trim()) {
      throw new Error('Comment content is required');
    }

    if (!['comment', 'proposal'].includes(type)) {
      throw new Error('Invalid comment type. Must be "comment" or "proposal"');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!token) {
      throw new Error('Auth token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          type,
          userId,
          pageIndex,
          rating
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - Current user ID
 * @param {string} token - Auth token (required)
 * @returns {Promise<Object>} Success response
 */
export const deleteComment = async (commentId, userId, token) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!token) {
      throw new Error('Auth token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};



/**
 * Get all slides with discussion stats for the discussion listing page
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.sortBy - 'newest', 'mostCommented', 'highestRated' (default: 'newest')
 * @returns {Promise<Object>} Slides with ratings and comment counts
 */
export const getSlidesList = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest'
    } = options;

    const queryParams = new URLSearchParams({
      page,
      limit,
      sortBy
    });

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching slides list:', error);
    throw error;
  }
};

/**
 * Get discussion topics for a slide
 * @param {number} slideId - Slide ID
 * @returns {Promise<Object>} Topics data
 */
export const getDiscussionTopics = async (slideId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/topics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching discussion topics:', error);
    throw error;
  }
};

/**
 * Get recent activities for a slide discussion
 * @param {number} slideId - Slide ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum items (default: 10)
 * @returns {Promise<Object>} Activities data
 */
export const getDiscussionActivities = async (slideId, options = {}) => {
  try {
    const { limit = 10 } = options;

    const queryParams = new URLSearchParams({
      limit
    });

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/activities?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching discussion activities:', error);
    throw error;
  }
};

/**
 * Search and filter comments
 * @param {number} slideId - Slide ID
 * @param {Object} options - Query options
 * @param {string} options.keyword - Search keyword
 * @param {number} options.minRating - Minimum rating (1-5)
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Filtered comments
 */
export const searchComments = async (slideId, options = {}) => {
  try {
    const {
      keyword = '',
      minRating = 0,
      page = 1,
      limit = 20
    } = options;

    const queryParams = new URLSearchParams({
      keyword,
      minRating,
      page,
      limit
    });

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/comments/search?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching comments:', error);
    throw error;
  }
};

/**
 * Rate a slide overall
 * @param {number} slideId - Slide ID
 * @param {Object} ratingData - Rating data
 * @param {number} ratingData.userId - Current user ID
 * @param {number} ratingData.ratingPoints - Star rating (0-5)
 * @param {number} ratingData.difficultyScore - Difficulty score (0-100)
 * @param {string} ratingData.feedback - Optional feedback
 * @param {string} ratingData.token - Auth token
 * @returns {Promise<Object>} Rating result
 */
export const rateSlide = async (slideId, ratingData) => {
  try {
    const { userId, ratingPoints, difficultyScore = 0, feedback = '', token } = ratingData;

    // Validation
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (ratingPoints === undefined || ratingPoints === null) {
      throw new Error('Rating points is required');
    }

    if (ratingPoints < 0 || ratingPoints > 5) {
      throw new Error('Rating points must be between 0 and 5');
    }

    if (!token) {
      throw new Error('Auth token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/rate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          ratingPoints,
          difficultyScore,
          feedback
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rating slide:', error);
    throw error;
  }
};

/**
 * Rate a specific page in a slide
 * @param {number} slideId - Slide ID
 * @param {number} pageIndex - Page index (0-based)
 * @param {Object} ratingData - Rating data
 * @param {number} ratingData.userId - Current user ID
 * @param {number} ratingData.ratingPoints - Star rating (0-5)
 * @param {string} ratingData.feedback - Optional feedback
 * @param {string} ratingData.token - Auth token
 * @returns {Promise<Object>} Rating result
 */
export const rateSlidePagee = async (slideId, pageIndex, ratingData) => {
  try {
    const { userId, ratingPoints, feedback = '', token } = ratingData;

    // Validation
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (ratingPoints === undefined || ratingPoints === null) {
      throw new Error('Rating points is required');
    }

    if (ratingPoints < 0 || ratingPoints > 5) {
      throw new Error('Rating points must be between 0 and 5');
    }

    if (!token) {
      throw new Error('Auth token is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/slides/${slideId}/pages/${pageIndex}/rate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          ratingPoints,
          feedback
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error rating slide page:', error);
    throw error;
  }
};

/**
 * Get global activities (comments, replies across all slides)
 * @param {Object} options - Query options
 * @param {string} options.filter - 'all', 'comment', 'reply', 'mine'
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.token - Auth token for 'mine' filter
 * @returns {Promise<Object>} Activities data
 */
export const getGlobalActivities = async (options = {}) => {
  try {
    const { filter = 'all', page = 1, limit = 20, token } = options;

    const queryParams = new URLSearchParams({
      filter,
      page,
      limit
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/discussions/activities?${queryParams}`,
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching global activities:', error);
    throw error;
  }
};

export default {
  getSlideDiscussion,
  getSlideComments,
  createComment,
  deleteComment,
  getSlidesList,
  getDiscussionTopics,
  getDiscussionActivities,
  searchComments,
  rateSlide,
  rateSlidePagee,
  getGlobalActivities
};
