/* * システム名: Teacher Support Hub (Eagle/Falcon Project)
 * データベース初期化スクリプト (PostgreSQL)
 */

-- 1. ユーザーテーブル (Users)
-- 機能: 教師のプロフィール情報を管理する (Backlog No.5, 6, 7, 8)
CREATE TABLE users (
    id SERIAL PRIMARY KEY, -- ユーザーID
    email VARCHAR(255) UNIQUE NOT NULL, -- メールアドレス (ログインID)
    password_hash VARCHAR(255) NOT NULL, -- 暗号化されたパスワード
    full_name VARCHAR(100) NOT NULL, -- 氏名 (例: 山田 太郎)
    school_name VARCHAR(255), -- 勤務校 (例: 〇〇大学)
    specialization VARCHAR(100), -- 専門分野 (例: 数学、物理)
    years_of_experience INT DEFAULT 0, -- 教員経験年数
    avatar_url TEXT, -- プロフィール画像のURL
    last_login_at TIMESTAMP, -- 最終ログイン日時
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- アカウント作成日時
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 情報更新日時
);

-- 2. 科目・カテゴリテーブル (Subjects)
-- 機能: スライドの検索・フィルタリングに使用する科目マスタ (Backlog No.9)
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY, -- 科目ID
    name VARCHAR(100) UNIQUE NOT NULL -- 科目名 (例: 数学、物理、日本語教育)
);

-- 3. スライドテーブル (Slides)
-- 機能: 教師がアップロードした授業資料を管理する (Backlog No.1, 4)
CREATE TABLE slides (
    id SERIAL PRIMARY KEY, -- スライドID
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- 投稿者 (ユーザーID)
    subject_id INT REFERENCES subjects(id) ON DELETE RESTRICT, -- 科目 (科目ID)
    title VARCHAR(100) NOT NULL, -- タイトル (100文字以内)
    description TEXT, -- 説明文
    file_url TEXT NOT NULL, -- ファイルの保存先URL (S3など)
    file_type VARCHAR(10) CHECK (file_type IN ('pdf', 'pptx', 'ppt')), -- 対応ファイル形式
    difficulty_level VARCHAR(50), -- 難易度レベル (フィルタ用: 例 'N1', '上級')
    difficulty_score INT DEFAULT 0 CHECK (difficulty_score BETWEEN 0 AND 100), -- 難解度スコア (ランキング用 0-100点)
    view_count INT DEFAULT 0, -- 閲覧数 (人気順フィルタ用)
    is_public BOOLEAN DEFAULT TRUE, -- 公開フラグ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 投稿日時
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日時
);

-- 4. ノウハウ記事テーブル (Know_How_Articles)
-- 機能: 教師の指導ノウハウや経験を共有する (Backlog No.3)
CREATE TABLE know_how_articles (
    id SERIAL PRIMARY KEY, -- 記事ID
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- 投稿者
    title VARCHAR(255) NOT NULL, -- 記事のタイトル
    content TEXT NOT NULL, -- 記事の本文 (指導の工夫など)
    is_public BOOLEAN DEFAULT TRUE, -- 公開フラグ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 投稿日時
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日時
);

-- 5. タグテーブル (Tags)
-- 機能: スライドや記事に付与するキーワード (Backlog No.1, 3, 9)
CREATE TABLE tags (
    id SERIAL PRIMARY KEY, -- タグID
    name VARCHAR(50) UNIQUE NOT NULL, -- タグ名
    type VARCHAR(20) DEFAULT 'keyword' CHECK (type IN ('keyword', 'system')), -- タグの種類
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. スライドとタグの中間テーブル (Slide_Tags)
CREATE TABLE slide_tags (
    slide_id INT REFERENCES slides(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (slide_id, tag_id)
);

-- 7. ノウハウとタグの中間テーブル (Know_How_Tags)
CREATE TABLE know_how_tags (
    article_id INT REFERENCES know_how_articles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 8. スライドコメントテーブル (Slide_Comments)
-- 機能: スライドに対する議論や提案を行う (Backlog No.2)
CREATE TABLE slide_comments (
    id SERIAL PRIMARY KEY, -- コメントID
    slide_id INT REFERENCES slides(id) ON DELETE CASCADE, -- 対象スライド
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- 投稿者
    content TEXT NOT NULL, -- コメント内容
    type VARCHAR(20) DEFAULT 'comment' CHECK (type IN ('comment', 'proposal')), -- 種類: 通常コメント or 指導案の提案
    parent_id INT REFERENCES slide_comments(id), -- 返信機能用 (親コメントID)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 投稿日時
);

-- 9. ノウハウコメントテーブル (Know_How_Comments)
-- 機能: ノウハウ記事に対するフィードバック (Backlog No.3)
CREATE TABLE know_how_comments (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES know_how_articles(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INT REFERENCES know_how_comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. スライドへの「いいね」テーブル (Slide_Likes)
-- 機能: スライドに対する単純な評価 (Backlog No.2 - 'Like'のみ記述あり)
CREATE TABLE slide_likes (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    slide_id INT REFERENCES slides(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, slide_id) -- 1ユーザーにつき1スライド1回まで
);

-- 11. ノウハウへのリアクションテーブル (Know_How_Reactions)
-- 機能: 記事に対する多様な感情表現 (Backlog No.3 - 'Thích', 'Hữu ích'等)
CREATE TABLE know_how_reactions (
    user_id INT REFERENCES users(id) ON DELETE CASCADE, -- ユーザー
    article_id INT REFERENCES know_how_articles(id) ON DELETE CASCADE, -- 対象記事
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'useful', 'thanks', 'empathy')), 
    -- reaction_type: 'like'(いいね), 'useful'(役立つ), 'thanks'(ありがとう), 'empathy'(共感)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, article_id) -- 1ユーザーにつき1記事1リアクション (変更可能だが重複不可とする設計)
);

-- 12. 難解ポイント分析テーブル (Difficulty_Analysis_Points)
-- 機能: スライドがなぜ難しいかの分析ポイントを保持 (Backlog No.4 - 難解ランキング詳細)
CREATE TABLE difficulty_analysis_points (
    id SERIAL PRIMARY KEY,
    slide_id INT REFERENCES slides(id) ON DELETE CASCADE,
    point_description TEXT NOT NULL -- 難解理由 (例: "専門用語が多すぎる", "数式が複雑")
);

CREATE TABLE slide_ratings (
                               id SERIAL PRIMARY KEY,
                               slide_id INTEGER NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
                               user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               difficulty_score INTEGER NOT NULL CHECK (difficulty_score >= 0 AND difficulty_score <= 100),
                               feedback TEXT,
                               created_at TIMESTAMP DEFAULT NOW(),
                               updated_at TIMESTAMP DEFAULT NOW(),
                               UNIQUE(slide_id, user_id)
);

CREATE INDEX idx_slide_ratings_slide_id ON slide_ratings(slide_id);
CREATE INDEX idx_slide_ratings_user_id ON slide_ratings(user_id);

-- インデックス作成 (パフォーマンス最適化)
CREATE INDEX idx_slides_subject ON slides(subject_id); -- 科目検索用
CREATE INDEX idx_slides_title ON slides(title); -- タイトル検索用
CREATE INDEX idx_slides_difficulty_score ON slides(difficulty_score DESC); -- 難解ランキング生成用
CREATE INDEX idx_knowhow_reactions_type ON know_how_reactions(reaction_type); -- リアクション種別集計用