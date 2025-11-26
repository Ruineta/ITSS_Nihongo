import React, {useState} from "react";

const Header = ({ onLogout }) => {
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            alert('ログアウトしました');
        }
    };

    return (
        <header className="bg-white px-10 py-4 shadow-sm flex justify-between items-center">
            <div className="text-2xl font-semibold text-blue-500">
                教師サポートHub
            </div>
            <button
                onClick={handleLogout}
                className="px-5 py-2 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
                ログアウト
            </button>
        </header>
    );
};

export default Header;