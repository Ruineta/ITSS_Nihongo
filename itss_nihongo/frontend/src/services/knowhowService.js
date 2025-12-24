const API_BASE_URL = '/api';

/**
 * Post a new knowledge-sharing article
 * @param {Object} articleData - Article data
 * @param {string} articleData.title - Article title (required, max 100 chars)
 * @param {string} articleData.content - Article content (required)
 * @param {Array<string>} articleData.tags - Tags (optional)
 * @param {boolean} articleData.is_public - Public flag (optional, default: true)
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Created article response
 */
export const postArticle = async (articleData, token) => {
    try {
        if (!token) {
            throw new Error('認証トークンが必要です');
        }

        const response = await fetch(`${API_BASE_URL}/knowhow/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: articleData.title.trim(),
                content: articleData.content.trim(),
                tags: articleData.tags || [],
                is_public: articleData.is_public !== false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
                throw new Error('認証に失敗しました。もう一度ログインしてください');
            }
            if (response.status === 400) {
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    throw new Error(errorData.errors.join('\n'));
                }
                throw new Error(errorData.message || '入力データが無効です');
            }
            throw new Error(errorData.message || '記事の投稿に失敗しました');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || '記事の投稿に失敗しました');
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error posting article:', error);
        throw error;
    }
};

/**
 * Get article by ID
 * @param {number} id - Article ID
 * @returns {Promise<Object>} - Article detail
 */
export const getArticleById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/knowhow/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('記事が見つかりません');
            }
            throw new Error('記事の取得に失敗しました');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || '記事の取得に失敗しました');
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error fetching article:', error);
        throw error;
    }
};

/**
 * Get list of articles (future implementation)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (optional)
 * @param {number} params.limit - Items per page (optional)
 * @param {string} params.tag - Filter by tag (optional)
 * @param {string} params.author - Filter by author (optional)
 * @returns {Promise<Object>} - Articles list
 */
export const getArticles = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page) {
            queryParams.append('page', params.page);
        }

        if (params.limit) {
            queryParams.append('limit', params.limit);
        }

        if (params.tag) {
            queryParams.append('tag', params.tag);
        }

        if (params.author) {
            queryParams.append('author', params.author);
        }

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/knowhow${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('記事一覧の取得に失敗しました');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || '記事一覧の取得に失敗しました');
        }

        return {
            success: true,
            data: result.data,
            pagination: result.pagination
        };
    } catch (error) {
        console.error('Error fetching articles:', error);
        throw error;
    }
};

const knowhowService = {
    postArticle,
    getArticleById,
    getArticles
};

export default knowhowService;
