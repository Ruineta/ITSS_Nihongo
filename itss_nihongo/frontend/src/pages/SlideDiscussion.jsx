import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {
  getSlideDiscussion,
  getSlideComments,
  createComment,
  getDiscussionActivities // Assuming we might want to show recent activities in sidebar? Or just focused on page.
} from "../services/discussionService";

const SlideDiscussion = () => {
  const { slideId: paramSlideId } = useParams();
  const { user, token } = useAuth();
  const slideId = paramSlideId || "1";
  const navigate = useNavigate();

  // State
  const [slide, setSlide] = useState(null);
  const [comments, setComments] = useState([]);
  const [pageComments, setPageComments] = useState({}); // Cache for page comments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [selectedPageIndex, setSelectedPageIndex] = useState(1); // 1-based index for UI
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [collapsedComments, setCollapsedComments] = useState(new Set());
  const [likedComments, setLikedComments] = useState(new Set()); // Mock like state for UI demo
  const [newCommentRating, setNewCommentRating] = useState(0); // Rating state
  const [imgError, setImgError] = useState(false); // Image error state

  useEffect(() => {
    fetchSlideData();
  }, [slideId]);

  useEffect(() => {
    // When page changes, fetch comments for that page
    if (slide) {
      fetchCommentsForPage(selectedPageIndex);
    }
  }, [selectedPageIndex, slide]);

  const fetchSlideData = async () => {
    try {
      setLoading(true);
      const response = await getSlideDiscussion(slideId);
      if (response.success) {
        setSlide(response.data.slide);
        // Initial fetch for page 1
        await fetchCommentsForPage(1);
      } else {
        setError(response.message || "スライド情報の取得に失敗しました");
      }
    } catch (err) {
      console.error(err);
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPage = async (page) => {
    // If we already have comments for this page (and not dirty), maybe use cache?
    // For now, simple fetch.
    try {
      // API expects pageIndex (0-based probably? or specific logic). 
      // The previous code passed `pageIndex` query param.
      // Let's assume database uses specific integers.
      // If we want "Page 1" of slide, that's likely index 0 or 1.
      // Backend `slide_comments` has `page_index`.
      // Let's assume User Interface Page 1 maps to page_index 1 for simplicity in this new UI, 
      // OR we stick to 0-based if PDF.
      // Let's use 1-based for UI and pass `page` directly.
      const response = await getSlideComments(slideId, {
        page: 1, limit: 100, pageIndex: page
      });

      if (response.success) {
        setPageComments(prev => ({
          ...prev,
          [page]: response.data
        }));
      }
    } catch (err) {
      console.error("Failed to fetch page comments", err);
    }
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const response = await createComment(slideId, {
        content: newCommentText,
        type: 'comment',
        userId: user?.id,
        token,
        pageIndex: selectedPageIndex,
        rating: newCommentRating || null
      });
      if (response.success) {
        setNewCommentText("");
        setNewCommentRating(0);
        // Refresh comments
        fetchCommentsForPage(selectedPageIndex);
      }
    } catch (err) {
      alert("コメント投稿に失敗しました");
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim()) return;
    // We need backend support for reply (parent_id). 
    // Assuming createComment handles it if we pass parentId?
    // The previous service `createComment` didn't explicitly take parentId in arguments shown in `DiscussionLayout`,
    // BUT `discussionController.js` `createComment` likely handles `parent_id` in body?
    // Let's check `discussionService.js` or just try passing it.
    // If not supported, we can't reply. 
    // We'll assume strict adherence to "Preview" requested, forcing mock or minimal impl if backend lacks it.
    // Actually `slide_comments` table has `parent_id`.
    try {
      // We'll append parentId to the body if the service allows...
      // `createComment` in service: (slideId, commentData) -> post body.
      await createComment(slideId, {
        content: replyText,
        type: 'comment',
        userId: user?.id,
        token,
        pageIndex: selectedPageIndex,
        parentId: parentId
      });
      setReplyText("");
      setActiveReplyId(null);
      fetchCommentsForPage(selectedPageIndex);
    } catch (err) {
      alert("返信に失敗しました");
    }
  };

  const toggleCollapse = (id) => {
    const newSet = new Set(collapsedComments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCollapsedComments(newSet);
  };

  const currentComments = pageComments[selectedPageIndex] || [];
  // Use real page count or default to 1
  const totalPages = slide?.pageCount || 1;

  const getDifficultyColor = (level) => {
    switch (level) {
      case "初級": return "bg-green-100 text-green-700";
      case "中級": return "bg-yellow-100 text-yellow-700";
      case "上級": return "bg-red-100 text-red-700";
      default: return "bg-blue-50 text-blue-700";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error || !slide) return (
    <div className="min-h-screen bg-[#f5f5f5] p-10 text-center">
      <p className="text-red-500">{error || "スライドが見つかりません"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#333]">
      <Header onLogout={() => alert("Logout")} />
      <Navigation />

      <div className="max-w-[1400px] mx-auto px-5 pb-10 flex gap-5 items-start">

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => navigate('/discussion')}
            className="flex items-center gap-2 text-[#666] text-sm hover:text-blue-500 mb-5 transition-colors"
          >
            ← 討論一覧
          </button>

          <div className="inline-block bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            Page {selectedPageIndex} / {totalPages}
          </div>

          <h1 className="text-[28px] font-bold text-[#1a1a1a] mb-3">{slide.title}</h1>





          {/* PREVIEW PART */}
          <div className="mb-8 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-video relative flex items-center justify-center group">
            {slide.fileType === 'pdf' ? (
              <iframe
                key={selectedPageIndex}
                src={`${process.env.REACT_APP_BACKEND_URL}${slide.fileUrl}#page=${selectedPageIndex}`}
                className="w-full h-full border-0"
                title="Slide Preview"
              />
            ) : (
              <>
                <img
                  src={imgError ? `${process.env.REACT_APP_BACKEND_URL}/uploads/default-slide-thumbnail.png` : (slide.thumbnail || `${process.env.REACT_APP_BACKEND_URL}/uploads/default-slide-thumbnail.png`)}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL}${slide.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition-all"
                  >
                    スライドを開く (PDF)
                  </a>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center gap-10 p-6 bg-[#f8f9fa] rounded-lg mb-8">
            <div className="text-center">
              <div className="text-[13px] text-[#666] mb-1">コメント</div>
              <div className="text-2xl font-bold text-[#1a1a1a]">{currentComments.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[13px] text-[#666] mb-1">評価</div>
              <div className="text-2xl font-bold text-[#1a1a1a]">{slide.avgRating ? Number(slide.avgRating).toFixed(1) : "0.0"} <span className="text-yellow-400">⭐</span></div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-[#1a1a1a]">討論内容</h2>
                <span className="text-base text-[#666]">({currentComments.length}件)</span>
              </div>
            </div>

            <div className="space-y-4">
              {currentComments.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  このページにはまだコメントがありません。<br />最初のコメントを投稿しましょう！
                </div>
              ) : (
                currentComments.map(comment => (
                  <div key={comment.id} className={`bg-[#f8f9fa] rounded-lg p-5 transition-all ${collapsedComments.has(comment.id) ? '' : ''}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[#1a1a1a] text-[15px]">{comment.author || "匿名"}</span>
                        {/* Rating Display */}
                        {comment.rating > 0 && (
                          <span className="text-yellow-400 text-sm ml-1">
                            {"★".repeat(comment.rating)}
                            <span className="text-gray-300">{"★".repeat(5 - comment.rating)}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] text-[#999]">{comment.timestamp}</span>
                    </div>

                    <div className="ml-0 md:ml-0">
                      <div className="text-[#333] text-sm leading-relaxed mb-3 whitespace-pre-wrap text-left">{comment.content}</div>

                      {/* Reply Form Removed */}

                      {/* Reply Form */}
                      {activeReplyId === comment.id && (
                        <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 mt-3 mb-3 animate-fadeIn">
                          <textarea
                            className="w-full p-2.5 border border-[#e0e0e0] rounded-md text-[13px] min-h-[80px] focus:outline-none focus:border-blue-500 mb-2.5"
                            placeholder="返信を入力..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          ></textarea>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setActiveReplyId(null)}
                              className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-[#f3f4f6] text-[#666] hover:bg-[#e5e7eb]"
                            >キャンセル</button>
                            <button
                              onClick={() => handleReplySubmit(comment.id)}
                              className="px-4 py-1.5 rounded-md text-[13px] font-medium bg-blue-500 text-white hover:bg-blue-600"
                            >返信を投稿</button>
                          </div>
                        </div>
                      )}

                      {/* Replies List */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-5 border-l-2 border-[#e5e7eb] space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-white border border-[#e5e7eb] rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-[#1a1a1a] text-sm">{reply.author}</span>
                                <span className="text-xs text-[#999]">{reply.timestamp}</span>
                              </div>
                              <div className="text-[#333] text-sm mb-2">{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* New Comment Section */}
            <div className="mt-8 bg-white border border-[#e0e0e0] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">新しいコメント</h3>
                {/* Rating Input */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewCommentRating(star)}
                      className={`text-xl transition-colors ${star <= newCommentRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="w-full p-4 border border-[#e0e0e0] rounded-lg text-sm min-h-[120px] focus:outline-none focus:border-blue-500 mb-4"
                placeholder={`ページ ${selectedPageIndex} について質問や改善案を入力...`}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              ></textarea>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setNewCommentText("")}
                  className="px-6 py-2.5 rounded-md text-sm font-semibold bg-[#f3f4f6] text-[#666] hover:bg-[#e5e7eb]"
                >キャンセル</button>
                <button
                  onClick={handlePostComment}
                  className="px-6 py-2.5 rounded-md text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600"
                >コメント投稿</button>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[280px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 sticky top-5 max-h-[calc(100vh-40px)] overflow-y-auto custom-scrollbar">
          <h3 className="text-base font-semibold text-[#333] mb-4">ページ一覧</h3>
          <div className="flex flex-col gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              // Logic to check if this page has comments?
              // Ideally we have a map of counts: {1: 5, 2: 0...}.
              // For now we don't have that map without fetching all.
              // We can just show "Page X".
              const isActive = pageNum === selectedPageIndex;
              return (
                <div
                  key={pageNum}
                  onClick={() => setSelectedPageIndex(pageNum)}
                  className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${isActive
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                    : 'bg-white text-[#333] border-[#e0e0e0] hover:bg-[#f8f9fa] hover:border-blue-400'
                    }`}
                >
                  <span className="font-semibold text-sm">ページ {pageNum}</span>
                  <span className={`text-xs flex items-center gap-1 ${isActive ? 'text-white/90' : 'text-[#666]'}`}>
                    {/* Placeholder comment count if we had it */}
                    💬
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #999;
        }
      `}</style>
    </div >
  );
};

export default SlideDiscussion;
