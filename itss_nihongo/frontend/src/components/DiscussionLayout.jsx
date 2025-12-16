import React, { useState, useMemo } from "react";
import DiscussionSearchBar from "./DiscussionSearchBar";
import TopicSlideCarousel from "./TopicSlideCarousel";
import RecentActivityPanel from "./RecentActivityPanel";

const DiscussionLayout = ({
  slides = [],
  comments = [],
  activities = [],
  onCommentSubmit,
  onSelectTopic,
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

  const handleSelectSlide = (slide) => {
    if (onSelectTopic) {
      onSelectTopic(slide);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Full Width */}
      <DiscussionSearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Discussion List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 h-fit sticky top-24">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>💬</span>討論一覧
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {filteredComments.length} 件のコメント
            </p>

            {/* Comments Summary */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredComments.length > 0 ? (
                filteredComments.slice(0, 5).map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {comment.author}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {comment.content}
                    </p>
                    {comment.rating && (
                      <p className="text-xs text-yellow-600 mt-1">
                        {Array(comment.rating).fill("⭐").join("")}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">
                  コメントがありません
                </p>
              )}
            </div>

            {filteredComments.length > 5 && (
              <button className="w-full mt-3 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition">
                すべてを表示 ({filteredComments.length})
              </button>
            )}
          </div>
        </div>

        {/* Middle Section - Topic Carousel */}
        <div className="lg:col-span-2">
          <TopicSlideCarousel
            slides={slides}
            onSelectSlide={handleSelectSlide}
          />
        </div>

        {/* Right Sidebar - Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivityPanel activities={activities} />
        </div>
      </div>

      {/* Comments Display Section - Full Width */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💭</span>
          討論内容
          <span className="text-sm font-normal text-gray-500">
            ({filteredComments.length}件)
          </span>
        </h3>

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
