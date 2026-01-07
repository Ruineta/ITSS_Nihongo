import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { likeSlide, unlikeSlide, getLikeStatus } from '../services/slideService';

const SlideDetailModal = ({ slide, isOpen, onClose, onRate }) => {
  const navigate = useNavigate();
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(50);
  const [ratingFeedback, setRatingFeedback] = useState("");

  // Comments state
  const [slideComments, setSlideComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch comments from API
  const fetchSlideComments = async (slideId) => {
    if (!slideId) return;

    setLoadingComments(true);
    setCommentError(null);

    try {
      const response = await fetch(
        `/api/discussions/slides/${slideId}/comments?limit=5&sortBy=newest&pageIndex=all`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSlideComments(data.data || []);
      } else {
        setSlideComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentError("コメント取得に失敗しました");
      setSlideComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset rating modal state when opening a new slide
  // Fetch comments for this slide
  useEffect(() => {
    if (isOpen && slide) {
      setIsRatingOpen(false);
      setRatingScore(slide.userRating || 50);
      setRatingFeedback(slide.userFeedback || "");

      // Fetch comments for this slide
      fetchSlideComments(slide.id);

      // Fetch like status
      fetchLikeStatus(slide.id);

      // Initialize like count from slide data
      setLikeCount(slide.likes || 0);
    }
  }, [isOpen, slide]);

  // Fetch like status
  const fetchLikeStatus = async (slideId) => {
    try {
      const data = await getLikeStatus(slideId);
      setIsLiked(data.data.isLiked);
      setLikeCount(data.data.likeCount);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  // Handle like toggle
  const handleLikeToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('ログインしてください');
      return;
    }

    setIsLiking(true);
    try {
      if (isLiked) {
        const data = await unlikeSlide(slide.id);
        setIsLiked(false);
        setLikeCount(data.data.likeCount);
      } else {
        const data = await likeSlide(slide.id);
        setIsLiked(true);
        setLikeCount(data.data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('いいねの処理に失敗しました');
    } finally {
      setIsLiking(false);
    }
  };

  if (!isOpen || !slide) return null;

  const {
    thumbnail,
    title,
    author,
    author_id,
    authorId, // Fallback field
    university,
    uploadDate,
    tags,
    views,
    difficulty,
    description,
    fileSize,
    pageCount,
    downloadCount,
    fileUrl,
    file_url,
    avgRating,  // Destructure average ID: 1422
  } = slide;

  // Use author_id or authorId as fallback
  const userId = author_id || authorId;

  // Debug log
  console.log('SlideDetailModal - author_id:', author_id, 'authorId:', authorId, 'userId:', userId);

  // Prioritize camelCase, fallback to snake_case
  const downloadUrl = fileUrl || file_url;
  const fullDownloadUrl = downloadUrl
    ? (downloadUrl.startsWith('http') ? downloadUrl : `${process.env.REACT_APP_BACKEND_URL}${downloadUrl}`)
    : null;

  // Format số
  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num;
  };

  // Màu sắc cho difficulty
  const getDifficultyColor = (level) => {
    switch (level) {
      case "初級":
        return "bg-green-100 text-green-700 border-green-300";
      case "中級":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "上級":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
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
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
                    e.target.src = `${process.env.REACT_APP_BACKEND_URL}/uploads/default-slide-thumbnail.png`;
                  }}
                />
                {/* Difficulty badge */}
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(
                    difficulty
                  )}`}
                >
                  {difficulty}
                </div>
              </div>



              {/* Action buttons */}
              {/* Action buttons */}
              <div className="flex gap-3">
                <a
                  href={fullDownloadUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${fullDownloadUrl
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  onClick={(e) => !fullDownloadUrl && e.preventDefault()}
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  ダウンロード
                </a>
                <button
                  onClick={handleLikeToggle}
                  disabled={isLiking}
                  className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${isLiked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isLiked ? 'いいね済み' : 'いいね'} ({likeCount})
                </button>
                <button
                  onClick={() => {
                    if (slide?.id) {
                      navigate(`/discussion/${slide.id}`);
                      onClose();
                    }
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  ディスカッション
                </button>
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-5">
              {/* Author info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (userId) {
                        navigate(`/user/${userId}`);
                        onClose();
                      }
                    }}
                  >
                    {author ? author[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition-colors w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userId) {
                          navigate(`/user/${userId}`);
                          onClose();
                        }
                      }}
                    >
                      {author || "匿名"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {university || "大学名"}
                    </p>
                  </div>
                  {/* Follow button removed */}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800 text-left">説明</h3>
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md text-blue-600">
                    <span className="text-xs font-bold uppercase tracking-wider">Score</span>
                    <span className="font-bold text-lg">{avgRating || "0.0"}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-left">
                  {description || "このスライドには説明がありません。"}
                </p>

                {/* Rate Button */}
                <div className="mt-4 flex justify-start"> {/* Changed justify-end to justify-start */}
                  <button
                    type="button"
                    onClick={() => setIsRatingOpen(true)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium rounded-lg transition-colors"
                  >
                    評価する
                  </button>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-left">タグ</h3>
                  <div className="flex flex-wrap gap-2 justify-start"> {/* Added justify-start */}
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
                <h3 className="font-semibold text-gray-800 mb-3">
                  ファイル情報
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">アップロード日:</span>
                    <span className="font-medium text-gray-800">
                      {uploadDate || "最近"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ファイルサイズ:</span>
                    <span className="font-medium text-gray-800">
                      {fileSize || "2.5 MB"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">難易度:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(
                        difficulty
                      )}`}
                    >
                      {difficulty}
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>

        <style>{`
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

        {/* Rating Modal (inside detail modal) */}
        {isRatingOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            {/* Backdrop for rating modal only */}
            <div
              className="absolute inset-0 bg-black bg-opacity-40"
              onClick={() => setIsRatingOpen(false)}
            />

            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                このスライドを評価してください
              </h3>

              {/* Score slider */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">難易度スコア:</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {ratingScore}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingScore}
                  onChange={(e) => setRatingScore(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>簡単</span>
                  <span>普通</span>
                  <span>難しい</span>
                  <span>非常に難しい</span>
                </div>
              </div>

              {/* Feedback textarea */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  フィードバック (任意):
                </label>
                <textarea
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="このスライドについてのご意見をお聞かせください..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRatingOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (onRate) {
                      await onRate(slide.id, ratingScore, ratingFeedback);
                    }
                    setIsRatingOpen(false);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                >
                  評価を送信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default SlideDetailModal;
