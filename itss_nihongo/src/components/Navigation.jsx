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

export default NavBar;