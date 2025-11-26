import React, {useState} from "react";
import PostCard from "../components/PostCard";
import Header from "../components/Header"
import Navigation from "../components/Navigation";

const ExpShare = () => {
    const[currentTab, setCurrentTab] = useState('教師ノウハウ共有');

    const posts = [{
        avatar: null,
        title: null,
        university: null,
        content: null,
        tags: null,
        likes: null,
        comments:null,
    }]

    //Code handle post ở đây

    return(
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Navigation */}
            <Navigation activeTab={activeTab} onTabChange={setCurrentTab(1)} />

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
        </div>
    );
}
export default ExpShare;