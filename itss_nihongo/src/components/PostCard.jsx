import React, {useState} from "react";

const PostCard = ({post}) => {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.commentsList || []);
    const [newComment, setNewComment] = useState('');

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

    //Code logic handleComment ở đây
    const handleToggleComments = () => {
        setShowComments(!showComments);
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment = {
                author: 'ユーザー',
                content: newComment,
                timestamp: new Date().toLocaleString('ja-JP')
            };
            setComments([...comments, comment]);
            setNewComment('');
        }
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

            <div className="text-sm leading-relaxed text-gray-700 text-left mb-4">
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

            <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                <button
                    onClick={handleToggleComments}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                    {showComments ? 'コメントを非表示' : 'コメントを表示'}
                </button>
                <div className="flex items-center gap-4">
                    <div
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isLiked ? 'text-red-500' : 'hover:text-red-500'
                        }`}
                    >
                        <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                        <span className="font-medium">{likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-base">💬</span>
                        <span className="font-medium">{comments.length}</span>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Comment Input */}
                    <div className="mb-4">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="コメントを入力..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
                            rows="3"
                        />
                        <button
                            onClick={handleAddComment}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            コメントを投稿
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                        {comments.map((comment, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-gray-700">{comment.author}</span>
                                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">まだコメントがありません</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostCard;