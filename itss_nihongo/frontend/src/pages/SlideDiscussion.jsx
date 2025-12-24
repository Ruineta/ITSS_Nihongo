import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import DiscussionLayout from "../components/DiscussionLayout";
import {
  getSlideDiscussion,
  getSlideComments,
  createComment,
  getDiscussionTopics,
  getDiscussionActivities,
} from "../services/discussionService";

const SlideDiscussion = () => {
  const { slideId: paramSlideId } = useParams();
  const { user, token } = useAuth();
  const slideId = paramSlideId || "1";

  // State management
  const [slide, setSlide] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicSlides, setTopicSlides] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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

        // Fetch discussion topics from API
        try {
          const topicsData = await getDiscussionTopics(slideId);
          if (topicsData.success) {
            setTopicSlides(topicsData.data);
          }
        } catch (topicsError) {
          console.error('Failed to fetch topics, using fallback:', topicsError);
          // Fallback to sample topics
          const slideTags = discussionData.data.slide?.tags || [];
          const normalizedTags =
            Array.isArray(slideTags) && slideTags.length > 0
              ? slideTags.map((tag) =>
                  typeof tag === "object" ? tag.name : tag
                )
              : [];

          const topics = [
            {
              id: 1,
              title: discussionData.data.slide?.title || "トピック 1",
              description: "このスライドについての全般的な討論",
              tags: normalizedTags,
              commentsCount: commentsData.data?.length || 0,
              rating: 4.5,
              views: 1250,
            },
            {
              id: 2,
              title: "教育方法とアプローチ",
              description: "より効果的な教え方についての提案",
              tags: ["教育法", "効果測定"],
              commentsCount: 8,
              rating: 4.2,
              views: 650,
            },
            {
              id: 3,
              title: "難易度調整の提案",
              description: `${
                discussionData.data.slide?.difficulty || ""
              }レベルの適切性について`,
              tags: ["難易度", "改善案"],
              commentsCount: 5,
              rating: 3.8,
              views: 420,
            },
            {
              id: 4,
              title: "補足資料とリソース",
              description: "参考になる追加教材の共有",
              tags: ["リソース", "参考資料"],
              commentsCount: 12,
              rating: 4.7,
              views: 920,
            },
          ];
          setTopicSlides(topics);
        }

        // Fetch recent activities from API
        try {
          const activitiesData = await getDiscussionActivities(slideId, {
            limit: 10,
          });
          if (activitiesData.success) {
            setRecentActivities(activitiesData.data);
          }
        } catch (activitiesError) {
          console.error('Failed to fetch activities, using fallback:', activitiesError);
          // Fallback to sample activities
          const activities = [
            {
              type: "comment",
              user: "suzuki_hanako",
              timestamp: "2時間前",
              content:
                "この教材はとても分かりやすいです。第3章の例題が特に良いですね。",
            },
            {
              type: "rating",
              user: "tanaka_jiro",
              timestamp: "4時間前",
              rating: 5,
              content: "最高の資料です！",
            },
            {
              type: "proposal",
              user: "yamamoto_yuki",
              timestamp: "1日前",
              content:
                "難易度をもう少し上げても良いかもしれません。上級者向けに。",
            },
            {
              type: "comment",
              user: "kobayashi_ken",
              timestamp: "2日前",
              content: "ビジュアルが素晴らしく、学生は理解しやすくなります。",
            },
            {
              type: "rating",
              user: "sato_naomi",
              timestamp: "2日前",
              rating: 4,
              content: "良い内容ですが、もっと例を増やしてもいいと思います。",
            },
            {
              type: "view",
              user: "ito_group",
              timestamp: "3日前",
              content: "多くのクラスで使用されています",
            },
          ];
          setRecentActivities(activities);
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
            rating: 5,
          },
          {
            id: 2,
            author: "tanaka_jiro",
            avatar: "T",
            content: "難易度をもう少し上げても良いかもしれません。",
            timestamp: "2024年12月8日 10:15",
            type: "proposal",
            rating: 4,
          },
        ]);

        // Set fallback topic slides
        setTopicSlides([
          {
            id: 1,
            title: "商積分の基礎 - 第3章",
            description: "このスライドについての全般的な討論",
            tags: ["数学", "N3レベル", "積分"],
            commentsCount: 2,
            rating: 4.5,
            views: 1250,
          },
          {
            id: 2,
            title: "教育方法とアプローチ",
            description: "より効果的な教え方についての提案",
            tags: ["教育法", "効果測定"],
            commentsCount: 8,
            rating: 4.2,
            views: 650,
          },
          {
            id: 3,
            title: "難易度調整の提案",
            description: "中級レベルの適切性について",
            tags: ["難易度", "改善案"],
            commentsCount: 5,
            rating: 3.8,
            views: 420,
          },
          {
            id: 4,
            title: "補足資料とリソース",
            description: "参考になる追加教材の共有",
            tags: ["リソース", "参考資料"],
            commentsCount: 12,
            rating: 4.7,
            views: 920,
          },
        ]);

        // Set fallback recent activities
        setRecentActivities([
          {
            type: "comment",
            user: "suzuki_hanako",
            timestamp: "2024年12月9日 14:30",
            content:
              "この教材はとても分かりやすいです。第3章の例題が特に良いですね。",
          },
          {
            type: "rating",
            user: "tanaka_jiro",
            timestamp: "2024年12月8日 10:15",
            rating: 5,
            content: "最高の資料です！",
          },
          {
            type: "proposal",
            user: "yamamoto_yuki",
            timestamp: "2024年12月7日",
            content:
              "難易度をもう少し上げても良いかもしれません。上級者向けに。",
          },
        ]);
      }
    };

    if (slideId) {
      fetchData();
    }
  }, [slideId]);

  // Handle post comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Call API to create comment
      const response = await createComment(slideId, {
        content: newComment,
        type: "comment",
        userId: user?.id,
        token
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Navigation */}
      <Navigation />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Discussion Section with New Layout */}
        <div className="pt-0">
          <DiscussionLayout
             slides={topicSlides}
             comments={comments}
             activities={recentActivities}
             onSelectTopic={() => {}}
           />

          {/* Comment Input Section */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              新しいコメント
            </h3>
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
  );
};

export default SlideDiscussion;
