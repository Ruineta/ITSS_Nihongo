import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <header className="bg-white px-10 py-4 shadow-sm flex justify-between items-center">
            <div className="text-2xl font-semibold text-blue-500">
                教師サポートHub
            </div>
            {isAuthenticated ? (
                <button
                    onClick={handleLogout}
                    className="px-5 py-2 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                    ログアウト
                </button>
            ) : (
                <button
                    onClick={() => navigate('/auth')}
                    className="px-5 py-2 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                    ログイン
                </button>
            )}
        </header>
    );
};

export default Header;

