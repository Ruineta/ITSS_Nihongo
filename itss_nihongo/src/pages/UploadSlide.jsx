import React, { useState } from "react";
import Header from "../components/Header";
import NavBar from "../components/NavBar";

const UploadSlide = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');

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

    const handleSubmit = () => {
        if (!file || !title) {
            alert('ファイルとタイトルを入力してください');
            return;
        }
        alert(`スライドがアップロードされました: ${title}`);
        // リセット
        setFile(null);
        setTitle('');
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
            <NavBar />

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
                            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                                dragActive
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
