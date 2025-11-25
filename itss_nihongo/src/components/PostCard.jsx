import React, {useState} from "react";

const PostCard = ({post}) => {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    //Code logic handlelike ở đây
    //const handleLike

    //Code logic handleBookmark ở đây
    //const handleBookmark
    return(
        <div className="bg-white rounded-xl p-8 mb-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start mb-5">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-semibold text-lg text-gray-600 mr-4 flex-shrink-0">
                    {post.avatar}
                </div>
                <div className="flex-1">
                    <div className="text-lg font-semibold mb-1 text-gray-900">
                        {post.title}
                    </div>
                    <div className="text-sm text-gray-600">
                        {post.author} • {post.university}
                    </div>
                </div>
                <span
                    onClick={handleBookmark}
                    className="cursor-pointer text-xl ml-2 hover:scale-110 transition-transform"
                >
          {isBookmarked ? '📌' : '🔖'}
        </span>
            </div>

            <div className="text-base leading-relaxed text-gray-700 mb-5">
                {post.content}
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
                {post.tags.map((tag, index) => (
                    <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-700"
                    >
            {tag}
          </span>
                ))}
            </div>

            <div className="flex items-center gap-5 text-gray-600 text-sm">
                <div
                    onClick={handleLike}
                    className={`flex items-center gap-2 cursor-pointer transition-colors ${
                        isLiked ? 'text-blue-500' : 'hover:text-blue-500'
                    }`}
                >
                    <span className="text-base">👍</span>
                    <span>{likes}</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500 transition-colors">
                    <span className="text-base">💬</span>
                    <span>{post.comments}</span>
                </div>
            </div>
        </div>
    );
}

export default PostCard;