import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navigation from '../components/Navigation.jsx';
import { fetchPublicUserProfile, fetchPublicUserStats, fetchPublicUserActivities } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

export default function PublicProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [activeTab, setActiveTab] = useState('activity');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [profileData, setProfileData] = useState({
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
                setLoading(true);
                setError(null);

                // Load Profile
                const userProfile = await fetchPublicUserProfile(userId);
                setProfileData({
                    email: userProfile.email,
                    fullName: userProfile.fullName,
                    schoolName: userProfile.schoolName,
                    specialization: userProfile.specialization,
                    yearsOfExperience: userProfile.yearsOfExperience
                });

                // Load Stats
                const statsData = await fetchPublicUserStats(userId);
                setStats([
                    { icon: '📄', number: statsData.slidesUploaded, label: 'アップロードしたスライド' },
                    { icon: '📊', number: statsData.articlesPosted, label: '投稿した記事' },
                    { icon: '💬', number: statsData.commentsPosted, label: '投稿したコメント' },
                    { icon: '🏅', number: statsData.likesReceived, label: '獲得したいいね' }
                ]);

                setLoading(false);

                // Fetch activities
                setLoadingActivities(true);
                const activitiesData = await fetchPublicUserActivities(userId, 20);
                setActivities(activitiesData);
                setLoadingActivities(false);

            } catch (err) {
                console.error('Error loading public user data:', err);
                setError('ユーザーが見つかりません、またはアクセスできません。');
                setLoading(false);
                setLoadingActivities(false);
            }
        };

        if (userId) {
            loadUserData();
        }
    }, [userId]);

    const handleLogout = () => {
        alert('ログアウトしました');
        logout();
        navigate('/auth');
    };

    // Check if viewing own profile
    const isOwnProfile = user && user.id === parseInt(userId);

    // Helper functions for activities (Same as Profile.jsx)
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
                navigate('/exp-share'); // Ideally link to specific article if supported
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
                <div className="text-gray-500">読み込み中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-5">
                <Header onLogout={handleLogout} />
                <div className="max-w-6xl mx-auto mt-10 text-center">
                    <div className="bg-white p-10 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">エラーが発生しました</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/exp-share')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                        >
                            トップページへ戻る
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            {/* Header */}
            <Header onLogout={handleLogout} />
            {/* Navigation */}
            <Navigation /> {/* No active tab props as we are on a specific user page */}

            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb / Back Link */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-blue-600 text-sm flex items-center gap-1"
                    >
                        ← 戻る
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm p-10 mb-5 flex flex-col md:flex-row items-start gap-8 relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold flex-shrink-0">
                        {profileData.fullName ? profileData.fullName[0].toUpperCase() : 'U'}
                    </div>

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-left">{profileData.fullName}</h1>

                        {/* Hide Email for Public Profile or Show masked? Decided to hide/show generic info based on privacy best practices, but user implementation plan implied basic info. Showing email same as mock for consistency but maybe we should review. For now let's keep it but formatted. */}
                        {/* 
            <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
              <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>{profileData.email}</span>
            </div> 
            */}

                        <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
                            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                            </svg>
                            <span>{profileData.schoolName || '所属なし'}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
                            <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
                            </svg>
                            <span>専門分野 | 経験年数: {profileData.yearsOfExperience}年</span>
                        </div>

                        <div className="flex gap-2 mb-4 flex-wrap">
                            {profileData.specialization && profileData.specialization.split('、').map((spec, index) => (
                                spec.trim() && (
                                    <span key={index} className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs font-medium">
                                        {spec.trim()}
                                    </span>
                                )
                            ))}
                        </div>

                        {/* View Contributed Articles Button */}
                        <button
                            onClick={() => navigate(`/exp-share?user_id=${userId}`)}
                            className="flex justify-start border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-md text-sm font-bold transition-colors">
                            投稿したノウハウを見る
                        </button>
                    </div>


                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="text-5xl mb-3">{stat.icon}</div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                            <div className="text-xs text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Activity Section - Read Only */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Navigation Bar */}
                    <div className="flex border-b border-gray-200">
                        <div
                            className={`flex-1 px-6 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-lg">📋</span>
                                <span>最近の活動</span>
                            </div>
                        </div>
                        {/* No Settings Tab for Public Profile */}
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
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
                    </div>
                </div>
            </div>
        </div>
    );
}
