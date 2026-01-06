import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { getGlobalActivities } from "../services/discussionService";
import { useAuth } from "../contexts/AuthContext";

const ActivityItem = ({ activity, onClick }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return '💬';
      case 'reply': return '↩️';
      case 'like': return '👍';
      default: return '📝';
    }
  };

  const getAvatarGradient = (color) => {
    switch (color) {
      case 'blue': return 'from-blue-400 to-cyan-400';
      case 'green': return 'from-emerald-400 to-teal-400';
      case 'orange': return 'from-rose-400 to-amber-400';
      case 'pink': return 'from-orange-300 to-fuchsia-400';
      default: return 'from-indigo-400 to-purple-400';
    }
  };

  return (
    <div
      className="flex gap-4 p-5 rounded-xl mb-3 cursor-pointer transition-all duration-200 border border-transparent hover:bg-gray-50 hover:border-gray-200 bg-white shadow-sm"
      onClick={() => onClick(activity.slideId)}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(activity.avatarColor)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm`}>
        {activity.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <span className="font-semibold text-gray-900 text-[15px]">{activity.user}</span>
          <span className="text-gray-500 text-sm">{activity.action}</span>

          {/* Rating Display */}
          {activity.rating > 0 && (
            <span className="flex items-center ml-1">
              <span className="text-yellow-400 text-sm">
                {"★".repeat(activity.rating)}
                <span className="text-gray-300">{"★".repeat(5 - activity.rating)}</span>
              </span>
            </span>
          )}

          <span className="text-gray-400 text-xs ml-auto whitespace-nowrap">{activity.time}</span>
        </div>

        <div
          className="text-blue-500 font-medium text-sm mb-2 hover:underline inline-block"
          onClick={(e) => {
            e.stopPropagation();
            onClick(activity.slideId);
          }}
        >
          📄 {activity.slideTitle}
        </div>

        <div className="bg-gray-50 border-l-[3px] border-blue-500 p-3 rounded-r-md text-sm text-gray-700 leading-relaxed">
          {activity.preview}
        </div>

        {activity.tags && activity.tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {activity.tags.map((tag, i) => (
              <span key={i} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DiscussionList = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities(1, true);
  }, [filter]);

  const fetchActivities = async (pageNum, reset = false) => {
    try {
      setIsLoading(true);
      const limit = 20;
      const response = await getGlobalActivities({
        filter,
        page: pageNum,
        limit,
        token
      });

      if (response.success) {
        setActivities(prev => reset ? response.data : [...prev, ...response.data]);
        setHasMore(response.data.length === limit);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    fetchActivities(page + 1);
  };

  const handleSlideClick = (slideId) => {
    navigate(`/discussion/${slideId}`);
  };

  const handleLogout = () => {
    alert("ログアウトしました");
    // Implement actual logout logic
  };

  const filters = [
    { id: 'all', label: 'すべて' },
    { id: 'comment', label: 'コメント' },
    { id: 'reply', label: '返信' },
    // { id: 'like', label: 'いいね' }, // TODO: Implement backend support for likes feed
    { id: 'mine', label: '自分の投稿' }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-12">
      <Header onLogout={handleLogout} />
      <Navigation />

      <div className="max-w-[1000px] mx-auto px-5">

        {/* Page Header */}
        <div className="bg-white rounded-xl p-8 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <h1 className="text-[28px] font-bold text-gray-900 mb-2">ディスカッション</h1>
          <p className="text-[15px] text-gray-500">最新のコメントや返信をチェックしましょう</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex gap-2.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${filter === f.id
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-blue-400'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] min-h-[400px]">
          {activities.length > 0 ? (
            <div className="flex flex-col">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id + '-' + activity.type} // Ensure unique key
                  activity={activity}
                  onClick={handleSlideClick}
                />
              ))}

              {hasMore && (
                <div className="text-center pt-5 pb-2">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-blue-500 hover:text-blue-500 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? '読み込み中...' : 'さらに読み込む'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="text-[64px] mb-5 opacity-50">📭</div>
                <div className="text-base font-medium text-gray-600 mb-2">アクティビティがありません</div>
                <div className="text-sm text-gray-400">新しいコメントや返信が表示されます</div>
              </div>
            )
          )}

          {isLoading && activities.length === 0 && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DiscussionList;
