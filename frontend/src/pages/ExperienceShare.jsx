import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import Navigation from "../components/Navigation";
import knowhowService from '../services/knowhowService';
import { useAuth } from '../contexts/AuthContext';

const ExpShare = () => {
    const { user, token } = useAuth();
    const [searchParams] = useSearchParams();
    const userIdFilter = searchParams.get('user_id');
    const [activeTab, setActiveTab] = useState('教師ノウハウ共有');
    const [showAddPostModal, setShowAddPostModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [posts, setPosts] = useState([]);
    const [searchTag, setSearchTag] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    const [newPostData, setNewPostData] = useState({
        title: '',
        author: '',
        university: '',
        content: '',
        tags: ''
    });

    // Fetch articles from API
    const fetchArticles = async (page = 1, tag = '', author = '') => {
        try {
            setLoadingPosts(true);
            setError(null);

            const response = await knowhowService.getArticles({
                page,
                limit: 10,
                tag: tag || undefined,
                author: author || undefined,
                userId: userIdFilter ? parseInt(userIdFilter) : undefined
            });

            // Transform API response to match PostCard format
            const transformedPosts = response.data.map(article => ({
                id: article.id,
                userId: article.userId, // Add userId
                avatar: article.author ? article.author[0].toUpperCase() : 'U',
                title: article.title,
                author: article.author || 'ユーザー',
                university: article.school || '大学名',
                content: article.content,
                tags: article.tags ? article.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
                likes: 0,
                comments: article.commentCount || 0,
                createdAt: article.createdAt
            }));

            setPosts(transformedPosts);
            setCurrentPage(response.pagination.page);
            setTotalPages(response.pagination.totalPages);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError(err.message || '記事の取得に失敗しました');
        } finally {
            setLoadingPosts(false);
        }
    };

    // Load articles on component mount
    useEffect(() => {
        fetchArticles(1);
    }, []);

    // Handle search
    const handleSearch = async () => {
        setCurrentPage(1);
        await fetchArticles(1, searchTag, searchAuthor);
    };

    const handleResetSearch = async () => {
        setSearchTag('');
        setSearchAuthor('');
        setCurrentPage(1);
        await fetchArticles(1, '', '');
    };

    //Code handle post ở đây
    const handleLogout = () => {
        alert('ログアウトしました');
    };

    const handleAddPost = () => {
        setShowAddPostModal(true);
    };

    const handleSubmitPost = async () => {
        // Validation
        if (!newPostData.title.trim() || !newPostData.content.trim()) {
            setError('タイトルと内容を入力してください');
            return;
        }

        if (!token) {
            setError('投稿するには認証が必要です。ログインしてください');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Parse tags from comma-separated string
            const tagsArray = newPostData.tags
                ? newPostData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : [];

            // Call API to post article
            const response = await knowhowService.postArticle({
                title: newPostData.title,
                content: newPostData.content,
                tags: tagsArray,
                is_public: true
            }, token);

            // Transform API response to match PostCard format
            const newPost = {
                avatar: user?.full_name ? user.full_name[0].toUpperCase() : 'U',
                title: response.data.title,
                author: response.data.author || 'ユーザー',
                university: response.data.school || '大学名',
                content: response.data.content,
                tags: response.data.tags ? response.data.tags.map(tag => typeof tag === 'string' ? tag : tag.name) : [],
                likes: 0,
                comments: 0,
                id: response.data.id,
                createdAt: response.data.createdAt
            };

            // Refresh posts list
            await fetchArticles(1);

            // Reset form and close modal
            setShowAddPostModal(false);
            setNewPostData({
                title: '',
                author: '',
                university: '',
                content: '',
                tags: ''
            });

            // Show success message
            alert('ノウハウの投稿に成功しました！');
        } catch (err) {
            console.error('Error submitting post:', err);
            setError(err.message || '投稿に失敗しました。もう一度お試しください');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPost = () => {
        setShowAddPostModal(false);
        setNewPostData({
            title: '',
            author: '',
            university: '',
            content: '',
            tags: ''
        });
    };

    const handleInputChange = (field, value) => {
        setNewPostData({ ...newPostData, [field]: value });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation currentTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-5 py-10">
                <div className="mb-8">
                    <button
                        onClick={handleAddPost}
                        className="float-right bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        + ノウハウを投稿
                    </button>
                    <h1 className="text-3xl text-left font-semibold mb-2">教師ノウハウ共有</h1>
                    <p className="text-gray-600 text-left text-base">
                        実践的な教育方法やヒントを共有しましょう
                    </p>
                </div>

                {/* Search/Filter Section */}
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">検索・フィルタ</h3>
                    <div className="flex gap-3 flex-wrap">
                        <input
                            type="text"
                            value={searchTag}
                            onChange={(e) => setSearchTag(e.target.value)}
                            placeholder="タグで検索..."
                            className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                        <input
                            type="text"
                            value={searchAuthor}
                            onChange={(e) => setSearchAuthor(e.target.value)}
                            placeholder="著者名で検索..."
                            className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            検索
                        </button>
                        <button
                            onClick={handleResetSearch}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-colors"
                        >
                            リセット
                        </button>
                    </div>
                </div>

                <div className="clear-both">
                    {loadingPosts ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">読み込み中...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            <p className="font-semibold">エラー</p>
                            <p>{error}</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">記事がありません</p>
                        </div>
                    ) : (
                        <>
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}

                            {/* Pagination */}
                            <div className="flex justify-center items-center gap-3 mt-8">
                                <button
                                    onClick={() => fetchArticles(currentPage - 1, searchTag, searchAuthor)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                >
                                    前へ
                                </button>

                                <span className="text-gray-600">
                                    ページ {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => fetchArticles(currentPage + 1, searchTag, searchAuthor)}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                                >
                                    次へ
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Post Modal */}
            {showAddPostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold mb-6">新しいノウハウを投稿</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                <p className="font-semibold">エラー</p>
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">タイトル *</label>
                                <input
                                    type="text"
                                    value={newPostData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="投稿のタイトルを入力"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium mb-2">投稿者名</label>
                                <input
                                    type="text"
                                    value={newPostData.author}
                                    onChange={(e) => handleInputChange('author', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="あなたの名前"
                                />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium mb-2">大学名</label>
                                <input
                                    type="text"
                                    value={newPostData.university}
                                    onChange={(e) => handleInputChange('university', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="所属大学"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">内容 *</label>
                                <textarea
                                    value={newPostData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[150px]"
                                    placeholder="共有したいノウハウや経験を入力してください"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">タグ（カンマ区切り）</label>
                                <input
                                    type="text"
                                    value={newPostData.tags}
                                    onChange={(e) => handleInputChange('tags', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="例: オンライン, 教育方法, コミュニケーション"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSubmitPost}
                                disabled={loading}
                                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '投稿中...' : '投稿する'}
                            </button>
                            <button
                                onClick={handleCancelPost}
                                disabled={loading}
                                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpShare;