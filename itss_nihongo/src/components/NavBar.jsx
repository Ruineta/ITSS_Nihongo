import React, {useState} from "react";

const NavBar = ({currentTab, onTabChange}) => {
    const navItems = [
        'スライド検索',
        'アップロード',
        'ディスカッション',
        'ノウハウ共有',
        '難解ランキング',
        'プロフィール'
    ];

    return(
    <nav className="bg-gray-200 px-10 flex gap-1">
        {navItems.map((item, index) => (
            <div
              key = {index}
              onClick={() => onTabChange(item)}
              className={`px-6 py-4 cursor-pointer transition-all rounded-t-lg text-sm ${
                  activeTab === item
                    ? 'bg-white font-semibold'
                    : 'hover:bg-white/50'    
              }`}
              >{item}
            </div>
        ))}
    </nav>
    );
};

export default NavBar;