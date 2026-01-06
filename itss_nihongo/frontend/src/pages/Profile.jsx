import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navigation from '../components/Navigation.jsx';
import ProfileModal from '../components/ProfileModal.jsx';
import { fetchUserProfile, fetchUserStats, fetchUserActivities } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

export default function ProfessorProfile() {
  const [activeTab, setActiveTab] = useState('activity');
  const [showEditModal, setShowEditModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileForm, setProfileForm] = useState({
    email: '',
    fullName: '',
    schoolName: '',
    specialization: '',
    yearsOfExperience: 0
  });

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const [stats, setStats] = useState([
    { icon: '📄', number: 0, label: 'アップロードしたスライド' },
    { icon: '📊', number: 0, label: '投稿した記事' },
    { icon: '💬', number: 0, label: '投稿したコメント' },
    { icon: '🏅', number: 0, label: '獲得したいいね' }
  ]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profileData = await fetchUserProfile();
        setProfileForm({
          email: profileData.email,
          fullName: profileData.fullName,
          schoolName: profileData.schoolName,
          specialization: profileData.specialization,
          yearsOfExperience: profileData.yearsOfExperience
        });

        const statsData = await fetchUserStats();
        setStats([
          { icon: '📄', number: statsData.slidesUploaded, label: 'アップロードしたスライド' },
          { icon: '📊', number: statsData.articlesPosted, label: '投稿した記事' },
          { icon: '💬', number: statsData.commentsPosted, label: '投稿したコメント' },
          { icon: '🏅', number: statsData.likesReceived, label: '獲得したいいね' }
        ]);

        // Fetch activities
        setLoadingActivities(true);
        const activitiesData = await fetchUserActivities(20);
        setActivities(activitiesData);
        setLoadingActivities(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoadingActivities(false);
        // Có thể thêm thông báo lỗi cho user ở đây
      }
    };

    loadUserData();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('新しいパスワードが一致しません');
      return;
    }
    // Xử lý đổi mật khẩu ở đây
    alert('パスワードが正常に変更されました');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Xử lý cập nhật profile ở đây
    alert('プロフィールが正常に更新されました');
    setShowEditModal(false);
  };

  const navigate = useNavigate();

  const handleRedirectClick = (path) => {
    if (path === '/exp-share' && user && user.id) {
      navigate(`${path}?user_id=${user.id}`);
    } else {
      navigate(path);
    }
  }

  const { user, logout } = useAuth();

  const handleLogout = () => {
    alert('ログアウトしました');
    logout();
    navigate('/auth');
  };

  // Helper functions for activities
  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return '📄';
      case 'slide_comment': return '💬';
      case 'knowhow_comment': return '📝';
      case 'knowhow_post': return '📊';
      default: return '📋';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'upload':
        return (
          <>
            スライド <span className="text-blue-600 font-medium">{activity.title}</span> をアップロードしました
          </>
        );
      case 'slide_comment':
        return (
          <>
            <span className="text-blue-600 font-medium">{activity.title}</span> にコメントしました
          </>
        );
      case 'knowhow_comment':
        return (
          <>
            ノウハウ記事 <span className="text-blue-600 font-medium">{activity.title}</span> にコメントしました
          </>
        );
      case 'knowhow_post':
        return (
          <>
            ノウハウ記事 <span className="text-blue-600 font-medium">{activity.title}</span> を投稿しました
          </>
        );
      default:
        return activity.title;
    }
  };

  const handleActivityClick = (activity) => {
    switch (activity.type) {
      case 'upload':
      case 'slide_comment':
        navigate(`/discussion/${activity.itemId}`);
        break;
      case 'knowhow_comment':
      case 'knowhow_post':
        navigate('/exp-share');
        break;
    }
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}日前`;
    if (hours > 0) return `${hours}時間前`;
    if (minutes > 0) return `${minutes}分前`;
    return 'たった今';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      {/* Header */}
      <Header onLogout={handleLogout} />
      {/* Navigation */}
      <Navigation setActiveTab={setActiveTab} />
      <div className="max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-10 mb-5 flex flex-col md:flex-row items-start gap-8 relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold flex-shrink-0">
            山
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-left">{profileForm.fullName}</h1>

            <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
              <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>{profileForm.email}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
              <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
              </svg>
              <span>{profileForm.schoolName}</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
              <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
              </svg>
              <span>准教授 | 経験年数: {profileForm.yearsOfExperience}年</span>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              {profileForm.specialization && profileForm.specialization.split('、').map((spec, index) => (
                spec.trim() && (
                  <span key={index} className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs font-medium">
                    {spec.trim()}
                  </span>
                )
              ))}
            </div>

            <button
              onClick={() => handleRedirectClick('/exp-share')}
              className="flex justify-start bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold transition-colors">
              ノウハウ共有
            </button>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="md:absolute top-8 right-8 w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
          >
            プロフィール編集
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Activity/Settings Section với Navigation */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Navigation Bar */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'activity'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">📋</span>
                <span>最近の活動</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">⚙️</span>
                <span>設定</span>
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {activeTab === 'activity' ? (
              // Activity View
              <div className="flex flex-col gap-5">
                {loadingActivities ? (
                  <div className="text-center py-8 text-gray-500">読み込み中...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    最近の活動はありません
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div
                      key={index}
                      onClick={() => handleActivityClick(activity)}
                      className="flex gap-5 p-5 rounded-lg bg-gray-50 hover:bg-gray-100 hover:translate-x-1 transition-all duration-200 cursor-pointer"
                    >
                      <div className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-900 mb-2 leading-relaxed">
                          {getActivityText(activity)}
                        </div>
                        {activity.content && (
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {activity.content}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {formatActivityTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Settings View - Change Password
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">パスワード変更</h3>
                  <p className="text-sm text-gray-600">アカウントのセキュリティを保護するために、パスワードを変更してください。</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      現在のパスワード
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="現在のパスワードを入力"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="新しいパスワードを入力 (8文字以上)"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      ※ 8文字以上で、英数字を含むパスワードを設定してください。
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード (確認)
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="新しいパスワードを再入力"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      パスワードを変更
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>

                {/* Additional Security Info */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex gap-3">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">セキュリティのヒント</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 他のサイトで使用していないパスワードを使用してください</li>
                        <li>• 定期的にパスワードを変更することをお勧めします</li>
                        <li>• パスワードは誰にも教えないでください</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <ProfileModal
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          profileForm={profileForm}
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
        />
      </div>
    </div>
  );
}