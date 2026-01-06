import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SlideCard = ({ slide, onClick }) => {
    const navigate = useNavigate();
    const {
        thumbnail,
        title,
        author,
        author_id, // Ensure this is destructured
        university,
        uploadDate,
        tags,
        difficulty,
        comments,
        description
    } = slide;

    const [imgError, setImgError] = useState(false);
    const displayThumbnail = imgError ? `${process.env.REACT_APP_BACKEND_URL}/uploads/default-slide-thumbnail.png` : (thumbnail || `${process.env.REACT_APP_BACKEND_URL}/uploads/default-slide-thumbnail.png`);

    // ... (keep helper functions)

    const handleAuthorClick = (e) => {
        e.stopPropagation();
        if (author_id) {
            navigate(`/user/${author_id}`);
        }
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

    // Get tag style based on index
    const getTagStyle = (index) => {
        const styles = [
            'bg-gray-900 text-white',  // Black
            'bg-gray-500 text-white',  // Gray
            'bg-gray-200 text-gray-800', // Light gray
        ];
        return styles[index % styles.length];
    };

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-start"
            onClick={() => onClick && onClick(slide)}
        >
            {/* Thumbnail - smaller size */}
            <div className="relative w-32 h-32 flex-shrink-0 bg-gray-200 overflow-hidden">
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
                {/* Difficulty badge */}
                {difficulty && (
                    <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-semibold ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1">
                {/* Title */}
                <h3 className="text-lg text-left font-bold text-gray-900 mb-2 line-clamp-1 hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {/* Author info - with avatar */}
                <div className="mb-3 flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAuthorClick}
                        title={author || '匿名'}
                    >
                        {(author || "U")[0].toUpperCase()}
                    </div>
                    <div
                        className="cursor-pointer group"
                        onClick={handleAuthorClick}
                    >
                        <p className="text-sm text-left font-medium text-gray-700 group-hover:text-blue-600 group-hover:underline transition-colors">
                            {author || '匿名'}
                        </p>
                        <p className="text-sm text-left text-gray-500">
                            {university || '大学名'}
                        </p>
                    </div>
                </div>

                {/* Tags with different colors */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {tags.slice(0, 4).map((tag, index) => (
                            <span
                                key={index}
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagStyle(index)}`}
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 4 && (
                            <span className="text-xs px-2 py-0.5 text-gray-500">
                                +{tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Bottom info - Upload date and comment count */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        アップロード: {uploadDate || '2021年4月18日'}
                    </span>
                    {/* Comment count */}
                    <div className="flex items-center gap-3">
                        {/* Rating Score (0-100) */}
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            <span className="text-xs font-bold">Score:</span>
                            <span className="text-sm font-bold">{slide.avgRating || "0"}</span>
                        </div>
                        {/* Comment count */}
                        <div className="flex items-center gap-1 text-gray-500">
                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs">{comments || slide.commentCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SlideCard);
