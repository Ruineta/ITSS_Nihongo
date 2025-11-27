import React, { useState } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import PostCard from "../components/PostCard";
import PostFormModal from "../components/PostFormModal";

const ExpShare = () => {
    const[activeTab, setActiveTab] = useState('教師ノウハウ共有');
    const[showAddPostModal, setShowAddPostModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const[newPostData, setNewPostData] = useState({
        title: '',
        author: '',
        university: '',
        content: '',
        tags: ''
    });


    //Code handle post ở đây
    const handleLogout = () => {
        alert('ログアウトしました');
    };

    const handleAddPost = () => {
        setShowAddPostModal(true);
    };

    const handleSubmitPost = () => {
        if (!newPostData.title || !newPostData.content) {
            alert('タイトルと内容を入力してください');
            return;
        }

        const newPost = {
            avatar: newPostData.author ? newPostData.author[0].toUpperCase() : 'U',
            title: newPostData.title,
            author: newPostData.author || 'ユーザー',
            university: newPostData.university || '大学名',
            content: newPostData.content,
            tags: newPostData.tags ? newPostData.tags.split(',').map(tag => tag.trim()) : [],
            likes: 0,
            comments: 0,
        };
        
        setPosts([newPost, ...posts]);
        setShowAddPostModal(false);
        setNewPostData({
            title: '',
            author: '',
            university: '',
            content: '',
            tags: ''
        });
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
        setNewPostData({...newPostData, [field]: value});
    };

    const handleFormSubmit = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
        alert('投稿しました！');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-5 py-10">
                <div className="mb-8">
                    <button
                        onClick={handleAddPost}
                        className="float-right bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        + ノウハウを投稿
                    </button>
                    <h1 className="text-3xl font-semibold mb-2">教師ノウハウ共有</h1>
                    <p className="text-gray-600 text-base">
                        実践的な教育方法やヒントを共有しましょう
                    </p>
                </div>

                <div className="clear-both">
                    {posts.map((post, index) => (
                        <PostCard key={index} post={post} />
                    ))}
                </div>
            </div>

            {/* Post Form Modal */}
            <PostFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
            />

            {/* Add Post Modal */}
            {showAddPostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-semibold mb-6">新しいノウハウを投稿</h2>
                        
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

                            <div>
                                <label className="block text-sm font-medium mb-2">投稿者名</label>
                                <input
                                    type="text"
                                    value={newPostData.author}
                                    onChange={(e) => handleInputChange('author', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    placeholder="あなたの名前"
                                />
                            </div>

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
                                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                            >
                                投稿する
                            </button>
                            <button
                                onClick={handleCancelPost}
                                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpShare;
