// API Service cho Slide Search
// Đây là file mock API - thay thế bằng real API calls trong production

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Mock data cho development
 */
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
 * @param {string} params.year - Năm học
 * @returns {Promise<Object>} - Kết quả tìm kiếm
 */
export const searchSlides = async ({ keyword = '', subject = '全て', difficulty = '明易い順', year = '全て' }) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Filter logic (giống như trong SlideSearch.jsx)
        let filteredSlides = [...mockSlidesData];

        // Filter by keyword
        if (keyword) {
            const searchTerm = keyword.toLowerCase();
            filteredSlides = filteredSlides.filter(slide =>
                slide.title.toLowerCase().includes(searchTerm) ||
                slide.author.toLowerCase().includes(searchTerm) ||
                slide.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Filter by subject
        if (subject !== '全て') {
            filteredSlides = filteredSlides.filter(slide =>
                slide.tags.includes(subject)
            );
        }

        // Filter by difficulty
        if (difficulty !== '明易い順') {
            filteredSlides = filteredSlides.filter(slide =>
                slide.difficulty === difficulty
            );
        }

        // Sort by difficulty if needed
        if (difficulty === '明易い順') {
            const difficultyOrder = { '初級': 1, '中級': 2, '上級': 3 };
            filteredSlides.sort((a, b) => 
                difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
        }

        return {
            success: true,
            data: filteredSlides,
            total: filteredSlides.length
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
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const slide = mockSlidesData.find(s => s.id === id);
        
        if (!slide) {
            throw new Error('スライドが見つかりません');
        }

        return {
            success: true,
            data: slide
        };
    } catch (error) {
        console.error('Error fetching slide:', error);
        throw error;
    }
};

/**
 * Real API call example (comment out mock data and use this in production)
 */
/*
export const searchSlides = async ({ keyword = '', subject = '全て', difficulty = '明易い順', year = '全て' }) => {
    try {
        const params = new URLSearchParams({
            keyword,
            subject,
            difficulty,
            year
        });

        const response = await fetch(`${API_BASE_URL}/slides/search?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('データの取得に失敗しました');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching slides:', error);
        throw error;
    }
};
*/

export default {
    searchSlides,
    getSlideById
};
