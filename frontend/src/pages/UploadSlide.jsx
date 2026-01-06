import React, { useState, useEffect } from "react";
import { getSubjects } from "../services/slideService";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

const UploadSlide = () => {
    const { token } = useAuth();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [difficulty, setDifficulty] = useState('初級');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    // const [subjects, setSubjects] = useState([]); // No longer needed for text input

    // useEffect(() => {
    //     // Removed subject fetching since we use text input now
    // }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const droppedFile = files[0];
            if (isValidFile(droppedFile)) {
                setFile(droppedFile);
            } else {
                alert('対応していないファイル形式またはサイズです。(PDF, PPT, PPTX, 最大10MB)');
            }
        }
    };

    const isValidFile = (file) => {
        const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        return validTypes.includes(file.type) && file.size <= maxSize;
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files[0]) {
            const selectedFile = files[0];
            if (isValidFile(selectedFile)) {
                setFile(selectedFile);
            } else {
                alert('対応していないファイル形式またはサイズです。(PDF, PPT, PPTX, 最大10MB)');
            }
        }
    };

    const handleLogout = () => {
        alert('ログアウトしました');
    };

    const handleSubmit = async () => {
        console.log('Submit State:', {
            file: !!file,
            title,
            subjectName
        });

        if (!file) {
            alert('ファイルをアップロードしてください');
            return;
        }
        if (!title.trim()) {
            alert('タイトルを入力してください');
            return;
        }
        if (!subjectName.trim()) {
            alert('科目を入力してください');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subject_name', subjectName);
        formData.append('difficulty_level', difficulty);
        tags.forEach(tag => formData.append('tags[]', tag));

        // Alternatively, if backend expects JSON for tags in multipart/form-data (uncommon but possible), or simple form fields.
        // Let's assume standard array handling 'tags[]' works with the backend middleware (likely multer).


        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/slides/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert(`スライドがアップロードされました: ${data.data.title}`);
                // リセット
                setFile(null);
                setTitle('');
                setDescription('');
                setTags([]);
                setTagInput('');
                setSubjectName('');
            } else {
                alert(`エラー: ${data.message}`);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('アップロード中にエラーが発生しました');
        }
    };

    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.pdf')) return '📄';
        if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return '🎯';
        return '📎';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-5 py-10">

                {/* Upload Form */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                    {/* File Upload Area */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-900 mb-4">
                            ファイルをアップロード
                            <p className="text-gray-500 text-base">
                                外国人生徒にとって理解しにくいスライドをアップロードしてください
                            </p>
                        </label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-gray-50'
                                }`}
                        >
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="text-4xl mb-3">
                                        {getFileIcon(file.name)}
                                    </div>
                                    <p className="text-gray-900 font-semibold mb-2">
                                        {file.name}
                                    </p>
                                    <p className="text-gray-500 text-sm mb-4">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                                    >
                                        ファイルを変更
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-5xl mb-4">📁</div>
                                    <p className="text-gray-900 font-semibold mb-2">
                                        ファイルをドラッグ＆ドロップ
                                    </p>
                                    <p className="text-gray-500 mb-4">または</p>
                                    <label className="inline-block">
                                        <input
                                            type="file"
                                            accept=".pdf,.ppt,.pptx"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <span className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer inline-block border border-gray-300">
                                            ファイルを選択
                                        </span>
                                    </label>
                                    <p className="text-gray-500 text-sm mt-4">
                                        対応形式: PDF, PPT, PPTX (最大10MB)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Title Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            タイトル<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="スライドのタイトルを入力"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>

                    {/* Description Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            説明
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="スライドの内容や特徴を簡単に説明してください"
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>

                    <div className="flex gap-6 mb-6">
                        {/* Subject Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                科目<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                placeholder="科目を入力 (例: 数学)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            />
                        </div>

                        {/* Difficulty Select */}
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                難易度
                            </label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                            >
                                <option value="初級">初級</option>
                                <option value="中級">中級</option>
                                <option value="上級">上級</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            タグ
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-300 rounded-lg min-h-[50px] bg-white">
                            {tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                    {tag}
                                    <button
                                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                        className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                            setTags([...tags, tagInput.trim()]);
                                            setTagInput('');
                                        }
                                    }
                                }}
                                placeholder={tags.length === 0 ? "タグを入力してEnter (例: テスト対策, 2024)" : ""}
                                className="flex-1 outline-none min-w-[200px]"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Enterキーでタグを追加できます</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                        >
                            アップロード
                        </button>
                        <button
                            onClick={() => {
                                setFile(null);
                                setTitle('');
                                setDescription('');
                                setTags([]);
                                setTagInput('');
                            }}
                            className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            リセット
                        </button>
                    </div>
                </div>


            </div>

        </div>
    );
};

export default UploadSlide;
