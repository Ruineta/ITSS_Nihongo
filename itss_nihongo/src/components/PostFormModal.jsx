import React, { useState } from "react";

const PostFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        university: '',
        content: '',
        tags: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getAvatarFromAuthor = (author) => {
        if (!author) return '👤';
        // 日本語の最初の文字を取得（kanji）
        return author.charAt(0);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'タイトルを入力してください';
        if (!formData.author.trim()) newErrors.author = '名前を入力してください';
        if (!formData.university.trim()) newErrors.university = '大学名を入力してください';
        if (!formData.content.trim()) newErrors.content = '内容を入力してください';
        if (!formData.tags.trim()) newErrors.tags = 'タグを入力してください';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const newPost = {
            ...formData,
            avatar: getAvatarFromAuthor(formData.author),
            tags: formData.tags.split(',').map(tag => tag.trim()),
            likes: 0,
            comments: 0
        };

        onSubmit(newPost);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            university: '',
            content: '',
            tags: ''
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        + ノウハウを投稿
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-semibold transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            タイトル<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="ノウハウのタイトルを入力"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.title
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Author Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            お名前<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            placeholder="例: 田中太郎"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.author
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
                    </div>

                    {/* University */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            大学名<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="university"
                            value={formData.university}
                            onChange={handleChange}
                            placeholder="例: 東京大学"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.university
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                    </div>

                    {/* Content Textarea */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            内容<span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="あなたのノウハウや経験を詳しく共有してください..."
                            rows="6"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                                errors.content
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                        <p className="text-gray-500 text-xs mt-1">
                            {formData.content.length}/1000 文字
                        </p>
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            タグ（カンマ区切り）<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="例: オンライン授業, 学生エンゲージメント, 教育技術"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                errors.tags
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                        />
                        {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
                        <p className="text-gray-500 text-xs mt-1">
                            3-5個のタグを推奨
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                            投稿する
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostFormModal;
