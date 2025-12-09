// API Service cho Slide Search
// Sử dụng real API calls để kết nối với backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Mock data cho development (not used - kept for reference)
 */
// eslint-disable-next-line no-unused-vars
const mockSlidesData = [
    {
        id: 1,
        thumbnail: 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=Math+Slide',
        title: '四則分の基礎：線形篇',
        author: '山田先生',
        university: '東京大学',
        uploadDate: '2024年12月1日',
        tags: ['料目', 'やさしい日本語', '初級'],
        views: 12,
        difficulty: '初級'
    },
    {
        id: 2,
        thumbnail: 'https://via.placeholder.com/400x300/50C878/ffffff?text=History+Slide',
        title: '日本の歴史：江戸時代',
        author: '田中先生',
        university: '京都大学',
        uploadDate: '2024年11月28日',
        tags: ['歴史', '文化', '中級'],
        views: 8,
        difficulty: '中級'
    },
    {
        id: 3,
        thumbnail: 'https://via.placeholder.com/400x300/FF6B6B/ffffff?text=Chemistry+Slide',
        title: '化学反応の基礎',
        author: '佐藤先生',
        university: '大阪大学',
        uploadDate: '2024年11月25日',
        tags: ['化学', '実験', '上級'],
        views: 1250,
        difficulty: '上級'
    },
    {
        id: 4,
        thumbnail: 'https://via.placeholder.com/400x300/9B59B6/ffffff?text=Japanese+Language',
        title: 'やさしい日本語入門',
        author: '鈴木先生',
        university: '早稲田大学',
        uploadDate: '2024年11月20日',
        tags: ['やさしい日本語', '初級', 'コミュニケーション'],
        views: 2340,
        difficulty: '初級'
    },
    {
        id: 5,
        thumbnail: 'https://via.placeholder.com/400x300/F39C12/ffffff?text=Physics+Slide',
        title: '物理学：運動の法則',
        author: '高橋先生',
        university: '名古屋大学',
        uploadDate: '2024年11月18日',
        tags: ['物理', '中級', '力学'],
        views: 567,
        difficulty: '中級'
    },
    {
        id: 6,
        thumbnail: 'https://via.placeholder.com/400x300/1ABC9C/ffffff?text=Biology+Slide',
        title: '生物：細胞の構造',
        author: '伊藤先生',
        university: '北海道大学',
        uploadDate: '2024年11月15日',
        tags: ['生物', '初級', '細胞'],
        views: 890,
        difficulty: '初級'
    },
    {
        id: 7,
        thumbnail: 'https://via.placeholder.com/400x300/E74C3C/ffffff?text=Literature',
        title: '日本文学：夏目漱石',
        author: '中村先生',
        university: '慶應義塾大学',
        uploadDate: '2024年11月10日',
        tags: ['国語', '文学', '上級'],
        views: 456,
        difficulty: '上級'
    },
    {
        id: 8,
        thumbnail: 'https://via.placeholder.com/400x300/3498DB/ffffff?text=Geography',
        title: '世界地理：気候と地形',
        author: '小林先生',
        university: '一橋大学',
        uploadDate: '2024年11月5日',
        tags: ['地理', '中級', '環境'],
        views: 234,
        difficulty: '中級'
    }
];

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
    getSubjects,
    getPopularTags
};

export default slideService;
