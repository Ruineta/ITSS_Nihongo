import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import {
  getSlideDiscussion,
  getSlideComments,
  createComment,
} from "../services/discussionService";

const SlideDiscussion = () => {
  const { slideId: paramSlideId } = useParams();
  // Always use slide 1, but allow override via route parameter
  const slideId = paramSlideId || "1";

  // State management
  const [slide, setSlide] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch discussion data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch slide discussion details
        const discussionData = await getSlideDiscussion(slideId);
        if (discussionData.success) {
          setSlide(discussionData.data.slide);
        }

        // Fetch comments
        const commentsData = await getSlideComments(slideId, {
          page: 1,
          limit: 20,
        });
        if (commentsData.success) {
          setComments(commentsData.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching discussion data:", err);
        setError("データの読み込みに失敗しました");
        setIsLoading(false);

        // Fallback to sample data for demo
        setSlide({
          id: slideId || 1,
          title: "商積分の基礎 - 第3章",
          author: "山田太郎",
          subject: "数学",
          difficulty: "中級",
          tags: ["数学", "N3レベル", "積分"],
          thumbnail: "/slide-thumbnail.png",
          views: 1250,
          uploadDate: "2024年12月10日",
        });
        setComments([
          {
            id: 1,
            author: "suzuki_hanako",
            avatar: "S",
            content:
              "この教材はとても分かりやすいです。第3章の例題が特に良いですね。",
            timestamp: "2024年12月9日 14:30",
            type: "comment",
          },
        ]);
      }
    };

    if (slideId) {
      fetchData();
    }
  }, [slideId]);

  // Get difficulty color
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

  // Get post type badge
  const getPostTypeBadge = (type) => {
    if (type === "proposal") {
      return (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mr-2">
          指導案
        </span>
      );
    }
    return null;
  };

  // Handle post comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Call API to create comment
      const response = await createComment(slideId, {
        content: newComment,
        type: "comment",
        userId: 1, // TODO: Replace with actual user ID from auth
      });

      if (response.success) {
        // Add comment to list
        const newCommentObj = {
          id: response.data.id,
          author: response.data.author,
          avatar: response.data.avatar,
          content: response.data.content,
          timestamp: response.data.timestamp,
          type: response.data.type,
        };
        setComments([...comments, newCommentObj]);
        setNewComment("");
      } else {
        alert(`エラー: ${response.message}`);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("コメント投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    alert("ログアウトしました");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onLogout={handleLogout} />
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // No slide data state
  if (!slide) {
    return (
      <div className="min-h-screen bg-white">
        <Header onLogout={handleLogout} />
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              {error || "スライドが見つかりません"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ {error} (サンプルデータを表示中)
            </p>
          </div>
        )}

        {/* Slide Info Card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          {/* Top Section: Title and Buttons */}
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Left Side: Title */}
            <div className="flex-1 text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-3 text-left">
                {slide?.title || "スライドタイトル"}
              </h1>
              <div className="flex gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                <span>
                  投稿者:{" "}
                  <span className="font-semibold text-gray-900">
                    {slide?.author || "不明"}
                  </span>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  科目:{" "}
                  <span className="font-semibold text-gray-900">
                    {slide?.subject || "不明"}
                  </span>
                </span>
                <span className="text-gray-300">|</span>
                <span>
                  難易度:{" "}
                  <span className="font-semibold text-gray-900">
                    {slide?.difficulty || "不明"}
                  </span>
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {slide?.tags &&
                  Array.isArray(slide.tags) &&
                  slide.tags.map((tag) => (
                    <span
                      key={typeof tag === "object" ? tag.id : tag}
                      className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                    >
                      {typeof tag === "object" ? tag.name : tag}
                    </span>
                  ))}
              </div>
            </div>

            {/* Right Side: Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition whitespace-nowrap">
                スクラ
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded hover:bg-gray-50 transition whitespace-nowrap">
                Nレベル
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Slide Preview Area */}
          <div className="bg-gray-50 rounded-lg p-8 mb-4 border border-gray-200">
            <div className="text-center text-gray-500">
              <p className="text-sm mb-1">【スライドプレビュー領域】</p>
              <p className="text-sm">PDF/PPT表示エリア</p>
            </div>
          </div>

          {/* Teaching Overview/Points Section - Blue Box */}
          <div className="bg-sky-100 rounded-lg p-4 border border-sky-300">
            <div className="flex items-start gap-3 justify-start">
              <div className="text-sky-600 text-lg flex-shrink-0">💡</div>
              <div className="flex-1 text-left">
                <h2 className="font-bold text-gray-900 mb-2">自動指案</h2>
                <div className="text-sm text-gray-800">
                  {slide?.teachingPoints &&
                  typeof slide.teachingPoints === "string" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {slide.teachingPoints}
                    </p>
                  ) : slide?.teachingPoints &&
                    Array.isArray(slide.teachingPoints) ? (
                    <ul className="space-y-2">
                      {slide.teachingPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="font-semibold text-gray-700">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 italic">
                      教育のポイントはまだ設定されていません
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="pt-0">
          {/* Comments Card */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            {/* Discussion Header with Icon */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-300">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">
                ディスカッション ({comments.length}件)
              </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-8">
              {comments && Array.isArray(comments) && comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex gap-3 text-left">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                        {comment.avatar}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {comment.author}
                          </span>
                          {getPostTypeBadge(comment.type)}
                          <span className="text-xs text-gray-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm text-left">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-left text-gray-500 py-8">
                  コメントはまだありません
                </p>
              )}
            </div>

            {/* Comment Input Form - Inside Card */}
            <div className="border-t border-gray-300 pt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="説明の改善案、例..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-sm mb-4"
                rows="4"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                {/* Action Buttons - Left side */}
                <button
                  onClick={() => setNewComment("")}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  キャンセル
                </button>

                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition text-sm"
                >
                  {isSubmitting ? "投稿中..." : "コメント投稿"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideDiscussion;
