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
        { label: '難解ランキング', path: '/ranking' },
        { label: 'プロフィール', path: '/profile' }
    ];

    const handleTabClick = (path) => {
        navigate(path);
    };

    const isActive = (path) => {
        return location.pathname === path || (location.pathname === '/' && path === '/exp-share');
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
import React, {useState} from "react";

const Navigation = ({currentTab, onTabChange}) => {
    const navItems = [
        'スライド検索',
        'アップロード',
        'ディスカッション',
        'ノウハウ共有',
        '難解ランキング',
        'プロフィール'
    ];

    return(
    <nav className="bg-gray-200 px-10 flex justify-center gap-0">
        {navItems.map((item, index) => (
            <div
              key = {index}
              onClick={() => onTabChange(item)}
              className={`px-8 py-3 cursor-pointer transition-all text-sm ${
                  currentTab === item
                    ? 'bg-white font-medium text-gray-900'
                    : 'text-gray-600 hover:bg-gray-300'    
              }`}
              >{item}
            </div>
        ))}
    </nav>
    );
};

export default Navigation;
