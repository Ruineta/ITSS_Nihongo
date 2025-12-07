import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import SearchFilter from '../components/SearchFilter';
import SlideCard from '../components/SlideCard';
import SlideDetailModal from '../components/SlideDetailModal';
import useDebounce from '../hooks/useDebounce';

// Mock data - Di chuyển ra ngoài component để tránh re-create
const MOCK_SLIDES = [
    {
        id: 1,
        thumbnail: 'https://via.placeholder.com/400x300/4A90E2/ffffff?text=Math+Slide',
        title: '四則分の基礎：線形篇',
        author: '山田先生',
        university: '東京大学',
        uploadDate: '2024年12月1日',
        tags: ['料目', 'やさしい日本語', '初級'],
        views: 12,
        difficulty: '初級',
        description: 'この資料は、数学の基礎である四則演算について詳しく解説しています。初学者向けに分かりやすく説明されており、例題も豊富に含まれています。',
        fileSize: '2.3 MB',
        pageCount: 24,
        downloadCount: 156
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
        difficulty: '中級',
        description: '江戸時代の政治、経済、文化について包括的に学べるスライドです。豊富な資料と図解で理解を深めることができます。',
        fileSize: '3.1 MB',
        pageCount: 35,
        downloadCount: 89
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
        difficulty: '上級',
        description: '化学反応の基本原理から応用まで、実験例を交えながら詳しく解説します。大学レベルの内容を含みます。',
        fileSize: '4.5 MB',
        pageCount: 42,
        downloadCount: 523
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
        difficulty: '初級',
        description: '日本語学習の初心者向けに、日常会話でよく使われる表現を「やさしい日本語」で説明しています。',
        fileSize: '1.8 MB',
        pageCount: 18,
        downloadCount: 1234
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
        difficulty: '中級',
        description: 'ニュートンの運動法則を中心に、物理学の基礎となる力学について学びます。実例を交えた分かりやすい解説です。',
        fileSize: '2.9 MB',
        pageCount: 28,
        downloadCount: 234
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
        difficulty: '初級',
        description: '細胞の基本構造から機能まで、図解を用いて分かりやすく説明します。生物学の基礎を学ぶのに最適です。',
        fileSize: '3.2 MB',
        pageCount: 30,
        downloadCount: 445
    }
];

const SlideSearch = () => {
    // State management
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filters, setFilters] = useState({
        subject: '全て',
        year: '全て',
        difficulty: '明易い順'
    });
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalResults, setTotalResults] = useState(0);
    const [selectedSlide, setSelectedSlide] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Debounce search keyword
    const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

    // Handle logout
    const handleLogout = () => {
        alert('ログアウトしました');
        // Trong thực tế sẽ xử lý logout logic ở đây
    };

    // Handle search
    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
    };

    // Handle filter change
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Handle slide click
    const handleSlideClick = (slide) => {
        setSelectedSlide(slide);
        setIsModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedSlide(null), 300);
    };

    // Fetch slides (mock API call)
    const fetchSlides = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Filter slides based on search and filters
            let filteredSlides = [...MOCK_SLIDES];

            // Filter by keyword
            if (debouncedSearchKeyword) {
                const keyword = debouncedSearchKeyword.toLowerCase();
                filteredSlides = filteredSlides.filter(slide =>
                    slide.title.toLowerCase().includes(keyword) ||
                    slide.author.toLowerCase().includes(keyword) ||
                    slide.tags.some(tag => tag.toLowerCase().includes(keyword))
                );
            }

            // Filter by subject (nếu không phải "全て")
            if (filters.subject !== '全て') {
                filteredSlides = filteredSlides.filter(slide =>
                    slide.tags.includes(filters.subject)
                );
            }

            // Filter by difficulty
            if (filters.difficulty !== '明易い順') {
                filteredSlides = filteredSlides.filter(slide =>
                    slide.difficulty === filters.difficulty
                );
            }

            // Sort by difficulty if needed
            if (filters.difficulty === '明易い順') {
                const difficultyOrder = { '初級': 1, '中級': 2, '上級': 3 };
                filteredSlides.sort((a, b) => 
                    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
                );
            }

            setSlides(filteredSlides);
            setTotalResults(filteredSlides.length);
            setIsLoading(false);
        } catch (err) {
            setError('データの取得に失敗しました。もう一度お試しください。');
            setIsLoading(false);
        }
    }, [debouncedSearchKeyword, filters]);

    // Effect to fetch slides when search or filters change
    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gray-300"></div>
                    <div className="p-4">
                        <div className="h-6 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-300 rounded mb-1"></div>
                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-400 mb-4">
                <svg 
                    className="w-24 h-24" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                検索結果が見つかりません
            </h3>
            <p className="text-gray-500 text-center max-w-md">
                検索条件を変更して、もう一度お試しください。
            </p>
        </div>
    );

    // Error state component
    const ErrorState = () => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-400 mb-4">
                <svg 
                    className="w-24 h-24" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                エラーが発生しました
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
                {error}
            </p>
            <button
                onClick={fetchSlides}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                再試行
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-5 py-6">
                {/* Search Filter */}
                <SearchFilter 
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                />

                {/* Results count */}
                {!isLoading && !error && (
                    <div className="mb-4">
                        <p className="text-gray-700 font-medium">
                            検索結果 ({totalResults}件)
                        </p>
                    </div>
                )}

                {/* Slides Grid */}
                {isLoading && <LoadingSkeleton />}
                {!isLoading && error && <ErrorState />}
                {!isLoading && !error && slides.length === 0 && <EmptyState />}
                {!isLoading && !error && slides.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {slides.map((slide) => (
                            <SlideCard 
                                key={slide.id} 
                                slide={slide}
                                onClick={handleSlideClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Slide Detail Modal */}
            <SlideDetailModal
                slide={selectedSlide}
                isOpen={isModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
};

export default SlideSearch;
