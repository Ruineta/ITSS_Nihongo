import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import SearchFilter from '../components/SearchFilter';
import SlideCard from '../components/SlideCard';
import SlideDetailModal from '../components/SlideDetailModal';
import useDebounce from '../hooks/useDebounce';
import { searchSlides, rateSlide } from '../services/slideService';

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

    // Handle rating from detail modal
    const handleRateInSearch = async (slideId, score, feedback) => {
        try {
            await rateSlide(slideId, score, feedback);
            alert('評価を送信しました');

            // Optionally refresh search results to reflect new difficulty
            await fetchSlides();
        } catch (err) {
            console.error('Error rating slide from search:', err);
            alert('評価の送信に失敗しました。もう一度お試しください。');
        }
    };

    // Fetch slides (API call)
    const fetchSlides = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Call real API
            const result = await searchSlides({
                keyword: debouncedSearchKeyword,
                subject: filters.subject,
                difficulty: filters.difficulty,
                year: filters.year,
                page: 1,
                limit: 50 // Get more results for initial load
            });

            if (result.success) {
                setSlides(result.data);
                setTotalResults(result.total);
            } else {
                throw new Error(result.message || 'データの取得に失敗しました');
            }
            
            setIsLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
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
        <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse flex">
                    <div className="w-32 h-32 bg-gray-300 flex-shrink-0"></div>
                    <div className="p-4 flex-1">
                        <div className="h-5 bg-gray-300 rounded mb-2 w-3/4"></div>
                        <div className="mb-3">
                            <div className="h-3 bg-gray-300 rounded mb-1 w-1/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/5"></div>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
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

                {/* Slides List */}
                {isLoading && <LoadingSkeleton />}
                {!isLoading && error && <ErrorState />}
                {!isLoading && !error && slides.length === 0 && <EmptyState />}
                {!isLoading && !error && slides.length > 0 && (
                    <div className="flex flex-col gap-4">
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
                onRate={handleRateInSearch}
            />
        </div>
    );
};

export default SlideSearch;
