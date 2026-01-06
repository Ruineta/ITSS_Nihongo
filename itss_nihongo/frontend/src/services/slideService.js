// API Service cho Slide Search
// Sử dụng real API calls để kết nối với backend

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Search slides với filters
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Từ khóa tìm kiếm
 * @param {string} params.subject - Môn học
 * @param {string} params.difficulty - Độ khó
 * @param {string} params.year - Năm học (format: "YYYY年")
 * @param {number} params.page - Page number (optional, default: 1)
 * @param {number} params.limit - Items per page (optional, default: 12)
 * @returns {Promise<Object>} - Kết quả tìm kiếm
 */
export const searchSlides = async ({ 
    keyword = '', 
    subject = '全て', 
    difficulty = '明易い順', 
    year = '全て',
    page = 1,
    limit = 12
}) => {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        
        if (subject && subject !== '全て') {
            params.append('subject', subject);
        }
        
        if (difficulty && difficulty !== '明易い順') {
            params.append('difficulty', difficulty);
        }
        
        if (year && year !== '全て') {
            params.append('year', year);
        }
        
        // Determine sort order
        let sortBy = 'newest';
        if (difficulty === '明易い順') {
            sortBy = 'difficulty_asc';
        }
        params.append('sortBy', sortBy);
        params.append('page', page);
        params.append('limit', limit);

        // Make API call
        const response = await fetch(`${API_BASE_URL}/slides/search?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'データの取得に失敗しました');
        }

        // Transform tags from array of objects to array of strings
        const transformedData = result.data.map(slide => ({
            ...slide,
            tags: Array.isArray(slide.tags) 
                ? slide.tags.map(tag => typeof tag === 'object' ? tag.name : tag)
                : []
        }));

        return {
            success: true,
            data: transformedData,
            pagination: result.pagination,
            total: result.pagination.totalItems
        };
    } catch (error) {
        console.error('Error fetching slides:', error);
        throw new Error('データの取得に失敗しました');
    }
};

/**
 * Get slide by ID
 * @param {number} id - Slide ID
 * @returns {Promise<Object>} - Slide detail
 */
export const getSlideById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/slides/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('スライドが見つかりません');
            }
            throw new Error('データの取得に失敗しました');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'データの取得に失敗しました');
        }

        // Transform tags from array of objects to array of strings
        const transformedData = {
            ...result.data,
            tags: Array.isArray(result.data.tags) 
                ? result.data.tags.map(tag => typeof tag === 'object' ? tag.name : tag)
                : []
        };

        return {
            success: true,
            data: transformedData
        };
    } catch (error) {
        console.error('Error fetching slide:', error);
        throw error;
    }
};

/**
 * Rate slide difficulty and feedback from search/detail page
 * @param {number} id - Slide ID
 * @param {number} difficultyScore - Score 0-100
 * @param {string} feedback - Optional feedback
 * @returns {Promise<Object>}
 */
export const rateSlide = async (id, difficultyScore, feedback) => {
    try {
        const response = await fetch(`${API_BASE_URL}/slides/${id}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficultyScore,
                feedback: feedback || null,
            }),
        });

        if (!response.ok) {
            throw new Error('評価の送信に失敗しました');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || '評価の送信に失敗しました');
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error('Error rating slide:', error);
        throw error;
    }
};

/**
 * Get available subjects for filtering
 * @returns {Promise<Object>} - List of subjects
 */
export const getSubjects = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/slides/filters/subjects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('科目の取得に失敗しました');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '科目の取得に失敗しました');
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
};

/**
 * Get popular tags
 * @param {number} limit - Number of tags to return
 * @returns {Promise<Object>} - List of popular tags
 */
export const getPopularTags = async (limit = 20) => {
    try {
        const params = new URLSearchParams({ limit: limit.toString() });
        
        const response = await fetch(`${API_BASE_URL}/slides/filters/tags?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('タグの取得に失敗しました');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'タグの取得に失敗しました');
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }
};

const slideService = {
    searchSlides,
    getSlideById,
    rateSlide,
    getSubjects,
    getPopularTags
};

export default slideService;
