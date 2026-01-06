import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import knowhowCommentsService from "../services/knowhowCommentsService";
import knowhowReactionsService from "../services/knowhowReactionsService";

const PostCard = ({ post }) => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [showReactions, setShowReactions] = useState(false);
    const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {
        love: 0,
        like: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
    });
    const [userReaction, setUserReaction] = useState(null);
    const [pressTimer, setPressTimer] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comments || 0);
    const [newComment, setNewComment] = useState('');
    const [leaveTimer, setLeaveTimer] = useState(null);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [replies, setReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [newReplies, setNewReplies] = useState({});
    const [submittingReplies, setSubmittingReplies] = useState({});

    // Fetch comments and reactions on mount
    useEffect(() => {
        fetchReactions();
    }, [post.id]);

    // Fetch comments when showing comments section
    useEffect(() => {
        if (showComments && comments.length === 0 && !loadingComments) {
            fetchComments();
        }
    }, [showComments]);

    const fetchReactions = async () => {
        try {
            // Load reaction counts and user's reaction
            const [reactionsRes, userReactionRes] = await Promise.all([
                knowhowReactionsService.getArticleReactions(post.id),
                token ? knowhowReactionsService.getUserReaction(post.id, token) : Promise.resolve({ success: true, data: { reaction_type: null } })
            ]);

            if (reactionsRes.success) {
                setReactionCounts(reactionsRes.data);
            }

            if (userReactionRes.success && userReactionRes.data.reaction_type) {
                setUserReaction(userReactionRes.data.reaction_type);
            }
        } catch (error) {
            console.error('Error loading reactions:', error);
        }
    };

    const fetchComments = async () => {
        try {
            setLoadingComments(true);
            const response = await knowhowCommentsService.getArticleComments(post.id, { limit: 50 });
            if (response.success) {
                setComments(response.data);
                setCommentCount(response.data.length);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

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
    const handleLike = async () => {
        if (!user || !token) {
            alert('ログインしてください');
            return;
        }

        try {
            const reactionToSend = userReaction ? userReaction : 'love';
            await knowhowReactionsService.addReaction(post.id, reactionToSend, token);
            await fetchReactions(); // Refresh reactions
        } catch (error) {
            console.error('Error toggling like:', error);
            alert(error.message || 'リアクション操作に失敗しました');
        }
    };

    const handleReactionSelect = async (reaction) => {
        if (!user || !token) {
            alert('ログインしてください');
            return;
        }

        try {
            await knowhowReactionsService.addReaction(post.id, reaction.name, token);
            await fetchReactions(); // Refresh reactions
            setShowReactions(false);
        } catch (error) {
            console.error('Error selecting reaction:', error);
            alert(error.message || 'リアクション操作に失敗しました');
        }
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

    //Code logic handleComment ở đây
    const handleToggleComments = () => {
        setShowComments(!showComments);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        if (!user || !token) {
            alert('ログインしてください');
            return;
        }

        setIsSubmittingComment(true);
        try {
            const response = await knowhowCommentsService.createComment(post.id, newComment, token);
            if (response.success) {
                // Refresh comments
                await fetchComments();
                setNewComment('');
            } else {
                alert(`エラー: ${response.message || 'コメント投稿に失敗しました'}`);
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert(error.message || 'コメント投稿に失敗しました');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    const fetchReplies = async (commentId) => {
        if (replies[commentId]) return;
        try {
            setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
            const response = await knowhowCommentsService.getCommentReplies(post.id, commentId);
            if (response.success) {
                setReplies(prev => ({ ...prev, [commentId]: response.data }));
            }
        } catch (error) {
            console.error('Error loading replies:', error);
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const handleToggleReplies = (commentId) => {
        if (!expandedReplies[commentId]) {
            fetchReplies(commentId);
        }
        setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const handleAddReply = async (commentId) => {
        if (!newReplies[commentId]?.trim()) return;

        if (!user || !token) {
            alert('ログインしてください');
            return;
        }

        try {
            setSubmittingReplies(prev => ({ ...prev, [commentId]: true }));
            const response = await knowhowCommentsService.createReply(post.id, commentId, newReplies[commentId], token);
            if (response.success) {
                setReplies(prev => ({
                    ...prev,
                    [commentId]: [...(prev[commentId] || []), response.data]
                }));
                setNewReplies(prev => ({ ...prev, [commentId]: '' }));
            } else {
                alert(`エラー: ${response.message || '返信投稿に失敗しました'}`);
            }
        } catch (error) {
            console.error('Error posting reply:', error);
            alert(error.message || '返信投稿に失敗しました');
        } finally {
            setSubmittingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const handleAuthorClick = (e) => {
        e.stopPropagation();
        if (post.userId) {
            navigate(`/user/${post.userId}`);
        }
    };

    const handleKeyPressReply = (e, commentId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddReply(commentId);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center font-semibold text-base text-blue-600 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAuthorClick}
                    >
                        {post.avatar}
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-base font-semibold mb-0.5 text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors w-fit"
                            onClick={handleAuthorClick}
                        >
                            {post.title}
                        </div>
                        <div className="text-xs text-left text-gray-500">
                            {post.author} • {post.university}
                        </div>
                    </div>
                </div>
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
                                    className={`text-2xl hover:scale-125 transition-transform p-1 rounded-full ${userReaction === reaction.name ? 'bg-blue-100 scale-110' : ''
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
                    <span className="font-medium">{commentCount}</span>
                    <span className="text-xs">コメント{showComments ? 'を隠す' : ''}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Loading State */}
                    {loadingComments ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">コメント読み込み中...</p>
                        </div>
                    ) : (
                        <>
                            {/* Comments List */}
                            {comments.length > 0 && (
                                <div className="space-y-4 mb-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2">
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
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-3 text-left">
                                                    <span>{comment.timestamp}</span>
                                                    <button
                                                        onClick={() => handleToggleReplies(comment.id)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {expandedReplies[comment.id] ? '返信を隠す' : (comment.replyCount > 0 ? `返信 (${comment.replyCount})` : '返信')}
                                                    </button>
                                                </div>

                                                {/* Replies Section */}
                                                {expandedReplies[comment.id] && (
                                                    <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                                                        {loadingReplies[comment.id] ? (
                                                            <p className="text-xs text-gray-500">返信読み込み中...</p>
                                                        ) : (
                                                            <>
                                                                {(replies[comment.id] || []).map((reply) => (
                                                                    <div key={reply.id} className="flex gap-2">
                                                                        <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0">
                                                                            {reply.author[0]}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="bg-blue-50 rounded-xl px-2.5 py-1.5 text-left w-fit">
                                                                                <div className="text-xs font-semibold text-gray-900 text-left">
                                                                                    {reply.author}
                                                                                </div>
                                                                                <p className="text-xs text-gray-700 text-left">
                                                                                    {reply.content}
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-0.5 ml-2 text-left">
                                                                                {reply.timestamp}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Reply Input */}
                                                                <div className="mt-3 flex gap-2 pt-2">
                                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0">
                                                                        {user?.full_name?.[0] || 'U'}
                                                                    </div>
                                                                    <div className="flex-1 flex gap-1.5">
                                                                        <input
                                                                            type="text"
                                                                            value={newReplies[comment.id] || ''}
                                                                            onChange={(e) => setNewReplies(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                                            onKeyPress={(e) => handleKeyPressReply(e, comment.id)}
                                                                            placeholder="返信を書く..."
                                                                            className="flex-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs focus:outline-none focus:bg-gray-200"
                                                                        />
                                                                        <button
                                                                            onClick={() => handleAddReply(comment.id)}
                                                                            disabled={!newReplies[comment.id]?.trim() || submittingReplies[comment.id]}
                                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${newReplies[comment.id]?.trim() && !submittingReplies[comment.id]
                                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                                }`}
                                                                        >
                                                                            {submittingReplies[comment.id] ? '送信中...' : '送信'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
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
                                        disabled={!newComment.trim() || isSubmittingComment}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${newComment.trim() && !isSubmittingComment
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSubmittingComment ? '送信中...' : '送信'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default PostCard;