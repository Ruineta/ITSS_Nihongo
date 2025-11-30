import React, { useState } from "react";

const PostCard = ({ post }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {
        love: 0,
        like: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
    });
    const [userReaction, setUserReaction] = useState(null); // Single reaction user has selected
    const [pressTimer, setPressTimer] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.commentsList || []);
    const [newComment, setNewComment] = useState('');
    const [leaveTimer, setLeaveTimer] = useState(null);

    const reactions = [
        { emoji: '❤️', name: 'love', color: 'text-red-500' },
        { emoji: '👍', name: 'like', color: 'text-blue-500' },
        { emoji: '😂', name: 'haha', color: 'text-yellow-500' },
        { emoji: '😮', name: 'wow', color: 'text-orange-500' },
        { emoji: '😢', name: 'sad', color: 'text-blue-400' },
        { emoji: '😠', name: 'angry', color: 'text-red-600' }
    ];

    // Calculate total reactions
    const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

    // Get top reactions to display
    const getTopReactions = () => {
        return reactions
            .filter(r => reactionCounts[r.name] > 0)
            .sort((a, b) => reactionCounts[b.name] - reactionCounts[a.name])
            .slice(0, 3);
    };

    //Code logic handlelike ở đây
    const handleLike = () => {
        if (userReaction) {
            // Remove current reaction
            setReactionCounts({
                ...reactionCounts,
                [userReaction]: Math.max(0, reactionCounts[userReaction] - 1)
            });
            setUserReaction(null);
        } else {
            // Add default heart reaction
            setReactionCounts({
                ...reactionCounts,
                love: reactionCounts.love + 1
            });
            setUserReaction('love');
        }
    };

    const handleReactionSelect = (reaction) => {
        const newCounts = { ...reactionCounts };
        
        if (userReaction === reaction.name) {
            // Remove this reaction if clicking the same one
            newCounts[reaction.name] = Math.max(0, newCounts[reaction.name] - 1);
            setUserReaction(null);
        } else {
            // Remove old reaction if exists
            if (userReaction) {
                newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
            }
            
            // Add new reaction
            newCounts[reaction.name] = newCounts[reaction.name] + 1;
            setUserReaction(reaction.name);
        }
        
        setReactionCounts(newCounts);
        setShowReactions(false); // Close popup after selection
    };

    const handleMouseDown = () => {
        const timer = setTimeout(() => {
            setShowReactions(true);
        }, 500); // 500ms press
        setPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
    };

    const handleMouseEnter = () => {
        if (leaveTimer) {
            clearTimeout(leaveTimer);
            setLeaveTimer(null);
        }
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        const timer = setTimeout(() => {
            setShowReactions(false);
        }, 200);
        setLeaveTimer(timer);
        
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
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
                timestamp: new Date().toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
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

            <div className="flex items-center justify-between text-gray-500 text-sm border-t border-gray-100 pt-3 mt-3">
                <div 
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Reactions Popup */}
                    {showReactions && (
                        <div 
                            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-2 py-2 flex gap-1 border border-gray-200 z-10"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {reactions.map((reaction, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleReactionSelect(reaction)}
                                    className={`text-2xl hover:scale-125 transition-transform p-1 rounded-full ${
                                        userReaction === reaction.name ? 'bg-blue-100 scale-110' : ''
                                    }`}
                                    title={reaction.name}
                                >
                                    {reaction.emoji}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Like Button */}
                    <div
                        onClick={handleLike}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        className="cursor-pointer"
                    >
                        {totalReactions > 0 ? (
                            <div className="flex items-center gap-2">
                                {/* Display top reactions */}
                                <div className="flex -space-x-1">
                                    {getTopReactions().map((reaction, index) => (
                                        <span 
                                            key={reaction.name} 
                                            className="text-base bg-white rounded-full border border-gray-200"
                                            style={{ zIndex: 10 - index }}
                                        >
                                            {reaction.emoji}
                                        </span>
                                    ))}
                                </div>
                                <span className={`font-medium text-sm ${userReaction ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {totalReactions}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors">
                                <span className="text-base">🤍</span>
                                <span className="font-medium text-sm">0</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Comment Toggle Button */}
                <button
                    onClick={handleToggleComments}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition-colors"
                >
                    <span className="text-base">💬</span>
                    <span className="font-medium">{comments.length}</span>
                    <span className="text-xs">コメント{showComments ? 'を隠す' : ''}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Comments List */}
                    {comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {comments.map((comment, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                                        {comment.author[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-100 rounded-2xl px-3 py-2 text-left w-fit">
                                            <div className="text-xs font-semibold text-gray-900 mb-0.5 text-left">
                                                {comment.author}
                                            </div>
                                            <p className="text-sm text-gray-800 text-left">
                                                {comment.content}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 ml-3 text-left">
                                            {comment.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comment Input */}
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0">
                            U
                        </div>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="コメントを書く..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:bg-gray-200"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    newComment.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                送信
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostCard;