import React, { useState } from "react";

const PostCard = ({ post }) => {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    //Code logic handlelike ở đây
    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            setIsLiked(true);
        }
    };

    //Code logic handleBookmark ở đây
    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return(
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center font-semibold text-base text-blue-600 flex-shrink-0">
                        {post.avatar}
                    </div>
                    <div className="flex-1">
                        <div className="text-base font-semibold mb-0.5 text-gray-900">
                            {post.title}
                        </div>
                        <div className="text-xs text-left text-gray-500">
                            {post.author} • {post.university}
                        </div>
                    </div>
                </div>
                <span
                    onClick={handleBookmark}
                    className="cursor-pointer text-lg hover:scale-110 transition-transform flex-shrink-0"
                >
                    {isBookmarked ? '📌' : '🔖'}
                </span>
            </div>

            <div className="text-sm leading-relaxed text-left text-gray-700 mb-4">
                {post.content}
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
                {post.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-medium"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-end gap-4 text-gray-500 text-sm">
                <div
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isLiked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                    <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                    <span className="font-medium">{likes}</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors">
                    <span className="text-base">💬</span>
                    <span className="font-medium">{post.comments}</span>
                </div>
            </div>
        </div>
    );
}

export default PostCard;