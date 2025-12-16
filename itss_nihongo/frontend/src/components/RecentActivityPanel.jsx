import React, { useState } from "react";

const RecentActivityPanel = ({ activities = [] }) => {
  const [expandedActivity, setExpandedActivity] = useState(null);

  // Activity type icon mapping
  const activityIcons = {
    comment: "💬",
    rating: "⭐",
    proposal: "📝",
    view: "👁️",
    upload: "📤",
  };

  // Activity color mapping
  const activityColors = {
    comment: "bg-blue-50 border-blue-200",
    rating: "bg-yellow-50 border-yellow-200",
    proposal: "bg-purple-50 border-purple-200",
    view: "bg-green-50 border-green-200",
    upload: "bg-indigo-50 border-indigo-200",
  };

  // Get activity type label
  const getActivityLabel = (type) => {
    const labels = {
      comment: "コメント追加",
      rating: "評価投稿",
      proposal: "改善案提案",
      view: "閲覧",
      upload: "アップロード",
    };
    return labels[type] || type;
  };

  const displayActivities = activities.slice(0, 8); // Show max 8 activities

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span></span>最近の活動
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          最近の活動はありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24">
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span></span>最近の活動
      </h3>

      {/* Activities List */}
      <div className="space-y-3">
        {displayActivities.map((activity, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
              activityColors[activity.type] || "bg-gray-50 border-gray-200"
            }`}
            onClick={() =>
              setExpandedActivity(expandedActivity === idx ? null : idx)
            }
          >
            {/* Activity Header */}
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">
                {activityIcons[activity.type] || "📌"}
              </span>

              <div className="flex-1 min-w-0">
                {/* Activity Type and User */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    {getActivityLabel(activity.type)}
                  </span>
                  {activity.rating && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                      {activity.rating} ⭐
                    </span>
                  )}
                </div>

                {/* User and Timestamp */}
                <p className="text-xs text-gray-600 truncate">
                  <span className="font-semibold">{activity.user}</span> •{" "}
                  {activity.timestamp}
                </p>

                {/* Activity Content Preview */}
                {activity.content && (
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {activity.content}
                  </p>
                )}
              </div>

              {/* Expand Indicator */}
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                  expandedActivity === idx ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>

            {/* Expanded Content */}
            {expandedActivity === idx && activity.content && (
              <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {activity.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {activities.length > 8 && (
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition">
          すべての活動を表示 ({activities.length})
        </button>
      )}

      {/* Activity Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 uppercase font-semibold mb-3">
          統計
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {activities.filter((a) => a.type === "comment").length}
            </p>
            <p className="text-xs text-gray-600">コメント</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {activities.filter((a) => a.type === "rating").length}
            </p>
            <p className="text-xs text-gray-600">評価</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityPanel;
