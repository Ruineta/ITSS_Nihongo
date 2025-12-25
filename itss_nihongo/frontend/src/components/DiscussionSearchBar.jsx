import React, { useState, useCallback } from "react";

const DiscussionSearchBar = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      if (onSearch) {
        onSearch(value);
      }
    },
    [onSearch]
  );

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
    if (onFilterChange) {
      onFilterChange({
        keyword: searchQuery,
        rating: rating === "all" ? null : parseInt(rating),
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedRating("all");
    if (onSearch) {
      onSearch("");
    }
    if (onFilterChange) {
      onFilterChange({
        keyword: "",
        rating: null,
      });
    }
  };

  const ratingOptions = [
    { value: "all", label: "すべて" },
    { value: "5", label: "⭐⭐⭐⭐⭐ 5.0" },
    { value: "4", label: "⭐⭐⭐⭐ 4.0以上" },
    { value: "3", label: "⭐⭐⭐ 3.0以上" },
    { value: "2", label: "⭐⭐ 2.0以上" },
    { value: "1", label: "⭐ 1.0以上" },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Search Input Section */}
      <div className="flex gap-3 items-center mb-4">
        {/* Search Icon and Input */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="キーワードを検索... (例: 数学, N3レベル)"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
            isExpanded
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          フィルター
        </button>
      </div>

      {/* Filter Options - Expandable */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Rating Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                評価でフィルター
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRatingChange(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedRating === option.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Applied Filters Summary */}
            {(searchQuery || selectedRating !== "all") && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">
                  ✓ 適用中のフィルター:
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      キーワード: {searchQuery}
                      <button
                        onClick={() => handleSearchChange("")}
                        className="ml-1 font-bold hover:scale-110 transition"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedRating !== "all" && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      {
                        ratingOptions.find((o) => o.value === selectedRating)
                          ?.label
                      }
                      <button
                        onClick={() => handleRatingChange("all")}
                        className="ml-1 font-bold hover:scale-110 transition"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
            clipRule="evenodd"
          />
        </svg>
        キーワードまたは評価で討論内容を絞り込めます
      </div>
    </div>
  );
};

export default DiscussionSearchBar;
