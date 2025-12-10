import React, { useEffect } from 'react';

const SlideDetailModal = ({ slide, isOpen, onClose }) => {
    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !slide) return null;

    const {
        thumbnail,
        title,
        author,
        university,
        uploadDate,
        tags,
        views,
        difficulty,
        description,
        fileSize,
        pageCount,
        downloadCount
    } = slide;

    // Format số
    const formatNumber = (num) => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num;
    };

    // Màu sắc cho difficulty
    const getDifficultyColor = (level) => {
        switch (level) {
            case '初級':
                return 'bg-green-100 text-green-700 border-green-300';
            case '中級':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case '上級':
                return 'bg-red-100 text-red-700 border-red-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 truncate pr-4">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                        {/* Left: Preview */}
                        <div className="space-y-4">
                            {/* Slide preview */}
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                                <img
                                    src={thumbnail}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/default-slide-thumbnail.png';
                                    }}
                                />
                                {/* Difficulty badge */}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(difficulty)}`}>
                                    {difficulty}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {formatNumber(views)}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">閲覧数</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {formatNumber(downloadCount || 0)}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">ダウンロード</div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {pageCount || 1}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">ページ数</div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    ダウンロード
                                </button>
                                <button className="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>
                                <button className="px-4 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="space-y-5">
                            {/* Author info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                                        {author ? author[0] : 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{author || '匿名'}</h3>
                                        <p className="text-sm text-gray-600">{university || '大学名'}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                                        フォロー
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">説明</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {description || 'このスライドには説明がありません。'}
                                </p>
                            </div>

                            {/* Tags */}
                            {tags && tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">タグ</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors cursor-pointer"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* File info */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-800 mb-3">ファイル情報</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">アップロード日:</span>
                                        <span className="font-medium text-gray-800">{uploadDate || '最近'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ファイルサイズ:</span>
                                        <span className="font-medium text-gray-800">{fileSize || '2.5 MB'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">形式:</span>
                                        <span className="font-medium text-gray-800">PDF</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">難易度:</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                                            {difficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Related slides */}
                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-800 mb-3">関連スライド</h3>
                                <div className="text-sm text-gray-600">
                                    この作者の他のスライドを表示...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SlideDetailModal;
