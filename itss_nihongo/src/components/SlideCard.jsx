import React, { useState } from 'react';

const SlideCard = ({ slide, onClick }) => {
    const {
        thumbnail,
        title,
        author,
        university,
        uploadDate,
        tags,
        views,
        difficulty
    } = slide;

    const [imgError, setImgError] = useState(false);
    const displayThumbnail = imgError ? '/default-slide-thumbnail.png' : (thumbnail || '/default-slide-thumbnail.png');

    // Format số views
    const formatViews = (count) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count;
    };

    // Màu sắc cho difficulty level
    const getDifficultyColor = (level) => {
        switch (level) {
            case '初級':
                return 'bg-green-100 text-green-700';
            case '中級':
                return 'bg-yellow-100 text-yellow-700';
            case '上級':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => onClick && onClick(slide)}
        >
            {/* Thumbnail */}
            <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                <img
                    src={displayThumbnail}
                    alt={title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={() => {
                        if (!imgError) {
                            setImgError(true);
                        }
                    }}
                    loading="lazy"
                />
                {/* Views count overlay */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    👁 {formatViews(views)}
                </div>
                {/* Difficulty badge */}
                {difficulty && (
                    <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded font-semibold ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {/* Author info */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                        {author ? author[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                            {author || '匿名'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {university || '大学名'}
                        </p>
                    </div>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 3 && (
                            <span className="text-xs px-2 py-1 text-gray-500">
                                +{tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Upload date */}
                <div className="text-xs text-gray-400 mt-2">
                    アップロード: {uploadDate || '最近'}
                </div>
            </div>
        </div>
    );
};

export default React.memo(SlideCard);
