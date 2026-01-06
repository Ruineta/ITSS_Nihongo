import React, { useState, useMemo } from "react";
import DiscussionSearchBar from "./DiscussionSearchBar";
import TopicSlideCarousel from "./TopicSlideCarousel";
import RecentActivityPanel from "./RecentActivityPanel";

const DiscussionLayout = ({
  slides = [],
  comments = [],
  activities = [],
  pageIndex = 0,
  onCommentSubmit,
  onSelectTopic,
  onPageChange,
  onExit,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [filteredComments, setFilteredComments] = useState(comments);

  // Filter comments based on search and rating
  useMemo(() => {
    let filtered = [...comments];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (comment) =>
          comment.content?.toLowerCase().includes(query) ||
          comment.author?.toLowerCase().includes(query)
      );
    }

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(
        (comment) => comment.rating && comment.rating >= selectedRating
      );
    }

    setFilteredComments(filtered);
  }, [searchQuery, selectedRating, comments]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters) => {
    setSearchQuery(filters.keyword || "");
    setSelectedRating(filters.rating || null);
  };

  const handleSelectSlide = (slide, index) => {
    if (onPageChange) {
      onPageChange(index);
    }
    if (onSelectTopic) {
      onSelectTopic(slide);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exit Button Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">ディスカッション</h2>
        {onExit && (
          <button
            onClick={onExit}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            閉じる
          </button>
        )}
      </div>

      {/* 3-Column Layout - REFACTORED to Single Column */}
      <div className="grid grid-cols-1 gap-6">

        {/* Middle Section - Topic Carousel (Now Full Width) */}
        <div className="w-full">
          <TopicSlideCarousel
            slides={slides}
            onSelectSlide={(slide, index) => handleSelectSlide(slide, index)}
          />
        </div>

      </div>

      {/* Comments Display Section - Full Width */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>💭</span>
            討論内容
            <span className="text-sm font-normal text-gray-500">
              ({filteredComments.length}件)
            </span>
          </h3>
          {pageIndex >= 0 && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              ページ {pageIndex + 1}
            </span>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.length > 0 ? (
            filteredComments.map((comment, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition"
              >
                {/* Comment Header */}
                <div className="flex gap-3 items-start mb-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                    {comment.avatar || comment.author?.[0] || "U"}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.author}
                      </span>

                      {/* Type Badge */}
                      {comment.type === "proposal" && (
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                          改善案
                        </span>
                      )}

                      {/* Rating Display */}
                      {comment.rating && (
                        <span className="text-xs text-yellow-600 font-semibold">
                          {Array(Math.round(comment.rating))
                            .fill("⭐")
                            .join("")}
                        </span>
                      )}

                      <span className="text-xs text-gray-500">
                        {comment.timestamp}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Comment Tags */}
                {comment.tags && comment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-13">
                    {comment.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {typeof tag === "object" ? tag.name : tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                フィルター条件に該当するコメントがありません
              </p>
              <p className="text-xs text-gray-400">
                検索条件をリセットしてみてください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionLayout;
