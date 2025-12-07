import React, { useState } from 'react';

const SearchFilter = ({ onSearch, onFilterChange }) => {
    const [keyword, setKeyword] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('全て');
    const [selectedYear, setSelectedYear] = useState('全て');
    const [selectedDifficulty, setSelectedDifficulty] = useState('明易い順');

    // Danh sách các môn học
    const subjects = [
        '全て',
        '数学',
        '物理',
        'やさしい日本語',
        '歴史',
        '化学',
        '生物',
        '英語',
        '国語',
        '地理',
        '政治経済'
    ];

    // Danh sách năm học
    const years = [
        '全て',
        '2024年',
        '2023年',
        '2022年',
        '2021年',
        '2020年',
        '2019年'
    ];

    // Danh sách độ khó
    const difficulties = [
        '明易い順',
        '初級',
        '中級',
        '上級'
    ];

    // Popular tags
    const popularTags = [
        '料目',
        '中級',
        'やさしい日本語',
        '文化',
        '初級'
    ];

    // Handle keyword change
    const handleKeywordChange = (e) => {
        const value = e.target.value;
        setKeyword(value);
        // Gọi callback để parent component xử lý với debounce
        if (onSearch) {
            onSearch(value);
        }
    };

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'subject':
                setSelectedSubject(value);
                break;
            case 'year':
                setSelectedYear(value);
                break;
            case 'difficulty':
                setSelectedDifficulty(value);
                break;
            default:
                break;
        }

        // Gọi callback để parent component xử lý
        if (onFilterChange) {
            onFilterChange({
                subject: filterType === 'subject' ? value : selectedSubject,
                year: filterType === 'year' ? value : selectedYear,
                difficulty: filterType === 'difficulty' ? value : selectedDifficulty
            });
        }
    };

    // Handle tag click
    const handleTagClick = (tag) => {
        setKeyword(tag);
        if (onSearch) {
            onSearch(tag);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                スライド検索・フィルタ
            </h2>
            <p className="text-sm text-gray-600 mb-4">
                キーワード、科目、難易度などで絞り込めます
            </p>

            {/* Search input */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={handleKeywordChange}
                        placeholder="キーワードで検索..."
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Filter dropdowns với nút search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Subject filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        科目
                    </label>
                    <select
                        value={selectedSubject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Difficulty filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        難易度
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort filter */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        並び替え
                    </label>
                    <select
                        value={selectedDifficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                    >
                        {difficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search button */}
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            if (onFilterChange) {
                                onFilterChange({
                                    subject: selectedSubject,
                                    year: selectedYear,
                                    difficulty: selectedDifficulty
                                });
                            }
                        }}
                        className="w-full md:w-auto px-8 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        検索
                    </button>
                </div>
            </div>

            {/* Popular tags */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                    人気タグ:
                </span>
                {popularTags.map((tag, index) => (
                    <button
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchFilter;
