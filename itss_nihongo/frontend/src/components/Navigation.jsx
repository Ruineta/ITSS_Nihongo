import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { label: 'スライド検索', path: '/search' },
        { label: 'アップロード', path: '/upload' },
        { label: 'ディスカッション', path: '/discussion' },
        { label: 'ノウハウ共有', path: '/exp-share' },
        { label: '教師ランキング', path: '/ranking' },
        { label: 'プロフィール', path: '/profile' }
    ];

    const handleTabClick = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        return location.pathname === path || (location.pathname === '/' && path === '/search');
    };

    const navStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        backgroundColor: '#999999',
        padding: '8px 15px',
        borderRadius: '12px',
        margin: '20px auto',
        width: '90%',
        maxWidth: '1000px'
    };

    const itemStyle = (active) => ({
        padding: '12px 24px',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: active ? '600' : '500',
        backgroundColor: active ? '#ffffff' : 'transparent',
        color: '#333',
        border: 'none',
        transition: 'all 0.3s ease'
    });

    return (
        <nav style={navStyle}>
            {navItems.map((item, index) => (
                <div
                    key={index}
                    onClick={() => handleTabClick(item.path)}
                    style={itemStyle(isActive(item.path))}
                >
                    {item.label}
                </div>
            ))}
        </nav>
    );
};

export default Navigation;