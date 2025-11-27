import React from "react";
import { useNavigate } from "react-router-dom";

const NavBar = ({currentTab, onTabChange}) => {
    const navigate = useNavigate();
    
    const navItems = [
        { label: 'スライド検索', path: '/' },
        { label: 'アップロード', path: '/upload-slide' },
        { label: 'ディスカッション', path: '/' },
        { label: 'ノウハウ共有', path: '/exp-share' },
        { label: '難解ランキング', path: '/' },
        { label: 'プロフィール', path: '/' }
    ];

    const handleClick = (item) => {
        onTabChange(item.label);
        navigate(item.path);
    };

    return(
        <nav className="bg-gray-200 px-10 flex justify-center gap-0">
            {navItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleClick(item)}
                  className={`px-8 py-3 cursor-pointer transition-all text-sm ${
                      currentTab === item.label
                        ? 'bg-white font-medium text-gray-900'
                        : 'text-gray-600 hover:bg-gray-300'    
                  }`}
                >
                    {item.label}
                </div>
            ))}
        </nav>
    );
};

export default NavBar;