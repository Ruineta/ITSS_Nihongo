-- Sample data for testing the difficulty ranking API
-- Run this script after initializing the database with PostgreSQL_init.sql

-- Use a transaction to ensure all-or-nothing insertion
BEGIN;

-- Insert sample subjects and capture IDs
INSERT INTO subjects (name) VALUES 
  ('物理'),
  ('数学'),
  ('日本語教育'),
  ('化学'),
  ('生物')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users (teachers) and capture IDs
INSERT INTO users (email, password_hash, full_name, school_name, specialization, years_of_experience) VALUES 
  ('suzuki@example.com', '$2b$10$dummyhash1', '鈴木先生', '東京大学', '物理学', 15),
  ('tanaka@example.com', '$2b$10$dummyhash2', '田中先生', '京都大学', '数学', 10),
  ('yamada@example.com', '$2b$10$dummyhash3', '山田先生', '大阪大学', '日本語教育', 8),
  ('sato@example.com', '$2b$10$dummyhash4', '佐藤先生', '名古屋大学', '化学', 12)
ON CONFLICT (email) DO NOTHING;

-- Insert sample slides with varying difficulty scores using subqueries for IDs
DO $$
DECLARE
  suzuki_id INT;
  tanaka_id INT;
  yamada_id INT;
  sato_id INT;
  physics_id INT;
  math_id INT;
  japanese_id INT;
  chemistry_id INT;
BEGIN
  -- Get user IDs
  SELECT id INTO suzuki_id FROM users WHERE email = 'suzuki@example.com';
  SELECT id INTO tanaka_id FROM users WHERE email = 'tanaka@example.com';
  SELECT id INTO yamada_id FROM users WHERE email = 'yamada@example.com';
  SELECT id INTO sato_id FROM users WHERE email = 'sato@example.com';
  
  -- Get subject IDs
  SELECT id INTO physics_id FROM subjects WHERE name = '物理';
  SELECT id INTO math_id FROM subjects WHERE name = '数学';
  SELECT id INTO japanese_id FROM subjects WHERE name = '日本語教育';
  SELECT id INTO chemistry_id FROM subjects WHERE name = '化学';
  
  -- Insert slides only if user and subject IDs are found
  IF suzuki_id IS NOT NULL AND physics_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES 
      (suzuki_id, physics_id, '量子力学の基礎：波動関数', '量子力学における波動関数の基本概念を解説', 'https://example.com/slides/quantum-basics.pdf', 'pdf', '上級', 95, 45, true),
      (suzuki_id, physics_id, '相対性理論入門', 'アインシュタインの特殊相対性理論の基礎', 'https://example.com/slides/relativity.pptx', 'pptx', '上級', 88, 62, true),
      (suzuki_id, physics_id, '電磁気学の基本法則', 'マクスウェル方程式の導出と応用', 'https://example.com/slides/electromagnetism.pdf', 'pdf', '上級', 82, 105, true);
  END IF;
  
  IF tanaka_id IS NOT NULL AND math_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES 
      (tanaka_id, math_id, '微積分の応用：最適化問題', '実世界の最適化問題における微積分の応用', 'https://example.com/slides/calculus-optimization.pdf', 'pdf', '中級', 72, 123, true),
      (tanaka_id, math_id, 'フーリエ変換の基礎', '信号処理におけるフーリエ変換の理論と実践', 'https://example.com/slides/fourier.pdf', 'pdf', '上級', 85, 89, true),
      (tanaka_id, math_id, '線形代数：固有値問題', '行列の固有値と固有ベクトルの応用', 'https://example.com/slides/eigenvalues.pdf', 'pdf', '中級', 75, 142, true);
  END IF;
  
  IF yamada_id IS NOT NULL AND japanese_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES 
      (yamada_id, japanese_id, 'N1レベルの敬語表現', '日本語能力試験N1レベルの敬語の使い分け', 'https://example.com/slides/keigo-n1.pptx', 'pptx', 'N1', 78, 156, true),
      (yamada_id, japanese_id, '古典文法の基礎', '古文における文法事項の基本', 'https://example.com/slides/kobun-grammar.pdf', 'pdf', '中級', 65, 98, true);
  END IF;
  
  IF sato_id IS NOT NULL AND chemistry_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES 
      (sato_id, chemistry_id, '有機化学反応機構', '有機化合物の反応メカニズムの詳細', 'https://example.com/slides/organic-mechanisms.pdf', 'pdf', '上級', 90, 71, true),
      (sato_id, chemistry_id, '化学平衡の理論', '平衡定数と反応の進行方向', 'https://example.com/slides/equilibrium.pptx', 'pptx', '中級', 68, 134, true);
  END IF;
END $$;

-- Insert difficulty analysis points using slide titles to find IDs
DO $$
DECLARE
  slide_id_var INT;
BEGIN
  -- Analysis points for "量子力学の基礎：波動関数" (highest difficulty)
  SELECT id INTO slide_id_var FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '専門用語が難しい'),
      (slide_id_var, '抽象的な概念'),
      (slide_id_var, '数式の理解');
  END IF;

  -- Analysis points for "有機化学反応機構"
  SELECT id INTO slide_id_var FROM slides WHERE title = '有機化学反応機構' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '反応機構の複雑さ'),
      (slide_id_var, '立体化学の理解'),
      (slide_id_var, '矢印の記法');
  END IF;

  -- Analysis points for "相対性理論入門"
  SELECT id INTO slide_id_var FROM slides WHERE title = '相対性理論入門' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '時空の概念が難解'),
      (slide_id_var, '数学的背景知識'),
      (slide_id_var, '直感に反する内容');
  END IF;

  -- Analysis points for "フーリエ変換の基礎"
  SELECT id INTO slide_id_var FROM slides WHERE title = 'フーリエ変換の基礎' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '積分の計算'),
      (slide_id_var, '複素数の扱い');
  END IF;

  -- Analysis points for "電磁気学の基本法則"
  SELECT id INTO slide_id_var FROM slides WHERE title = '電磁気学の基本法則' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, 'ベクトル解析が必要'),
      (slide_id_var, '偏微分方程式');
  END IF;

  -- Analysis points for "N1レベルの敬語表現"
  SELECT id INTO slide_id_var FROM slides WHERE title = 'N1レベルの敬語表現' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '謙譲語と尊敬語の区別'),
      (slide_id_var, '場面による使い分け');
  END IF;

  -- Analysis points for "線形代数：固有値問題"
  SELECT id INTO slide_id_var FROM slides WHERE title = '線形代数：固有値問題' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, '行列の対角化'),
      (slide_id_var, '応用例の理解');
  END IF;

  -- Analysis points for "微積分の応用：最適化問題"
  SELECT id INTO slide_id_var FROM slides WHERE title = '微積分の応用：最適化問題' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES 
      (slide_id_var, 'ラグランジュ乗数法'),
      (slide_id_var, '制約条件の設定');
  END IF;
END $$;
-- Insert sample slides with varying difficulty scores and creation dates
-- Physics slides by Suzuki
INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '量子力学の基礎：波動関数', 
  '量子力学における波動関数の基本概念を解説', 
  'https://example.com/slides/quantum-basics.pdf', 
  'pdf', 
  '上級', 
  95, 
  45, 
  true,
  '2024-03-15 10:30:00'::timestamp,
  'https://picsum.photos/seed/quantum/400/300'
FROM users u, subjects s
WHERE u.email = 'suzuki@example.com' AND s.name = '物理';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '相対性理論入門', 
  'アインシュタインの特殊相対性理論の基礎', 
  'https://example.com/slides/relativity.pptx', 
  'pptx', 
  '上級', 
  88, 
  62, 
  true,
  '2024-06-20 14:15:00'::timestamp,
  'https://picsum.photos/seed/relativity/400/300'
FROM users u, subjects s
WHERE u.email = 'suzuki@example.com' AND s.name = '物理';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '電磁気学の基本法則', 
  'マクスウェル方程式の導出と応用', 
  'https://example.com/slides/electromagnetism.pdf', 
  'pdf', 
  '上級', 
  82, 
  105, 
  true,
  '2023-09-10 09:00:00'::timestamp,
  'https://picsum.photos/seed/electro/400/300'
FROM users u, subjects s
WHERE u.email = 'suzuki@example.com' AND s.name = '物理';

-- Math slides by Tanaka
INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '微積分の応用：最適化問題', 
  '実世界の最適化問題における微積分の応用', 
  'https://example.com/slides/calculus-optimization.pdf', 
  'pdf', 
  '中級', 
  72, 
  123, 
  true,
  '2024-01-10 11:00:00'::timestamp,
  'https://picsum.photos/seed/calculus/400/300'
FROM users u, subjects s
WHERE u.email = 'tanaka@example.com' AND s.name = '数学';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  'フーリエ変換の基礎', 
  '信号処理におけるフーリエ変換の理論と実践', 
  'https://example.com/slides/fourier.pdf', 
  'pdf', 
  '上級', 
  85, 
  89, 
  true,
  '2023-05-25 16:30:00'::timestamp,
  'https://picsum.photos/seed/fourier/400/300'
FROM users u, subjects s
WHERE u.email = 'tanaka@example.com' AND s.name = '数学';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '線形代数：固有値問題', 
  '行列の固有値と固有ベクトルの応用', 
  'https://example.com/slides/eigenvalues.pdf', 
  'pdf', 
  '中級', 
  75, 
  142, 
  true,
  '2022-11-08 13:45:00'::timestamp,
  'https://picsum.photos/seed/linear/400/300'
FROM users u, subjects s
WHERE u.email = 'tanaka@example.com' AND s.name = '数学';

-- Japanese education slides by Yamada
INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  'N1レベルの敬語表現', 
  '日本語能力試験N1レベルの敬語の使い分け', 
  'https://example.com/slides/keigo-n1.pptx', 
  'pptx', 
  'N1', 
  78, 
  156, 
  true,
  '2024-08-03 10:20:00'::timestamp,
  'https://picsum.photos/seed/keigo/400/300'
FROM users u, subjects s
WHERE u.email = 'yamada@example.com' AND s.name = '日本語教育';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '古典文法の基礎', 
  '古文における文法事項の基本', 
  'https://example.com/slides/kobun-grammar.pdf', 
  'pdf', 
  '中級', 
  65, 
  98, 
  true,
  '2021-04-18 15:00:00'::timestamp,
  'https://picsum.photos/seed/kobun/400/300'
FROM users u, subjects s
WHERE u.email = 'yamada@example.com' AND s.name = '日本語教育';

-- Chemistry slides by Sato
INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '有機化学反応機構', 
  '有機化合物の反応メカニズムの詳細', 
  'https://example.com/slides/organic-mechanisms.pdf', 
  'pdf', 
  '上級', 
  90, 
  71, 
  true,
  '2023-12-22 08:30:00'::timestamp,
  'https://picsum.photos/seed/organic/400/300'
FROM users u, subjects s
WHERE u.email = 'sato@example.com' AND s.name = '化学';

INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public, created_at, thumbnail_url)
SELECT 
  u.id, 
  s.id, 
  '化学平衡の理論', 
  '平衡定数と反応の進行方向', 
  'https://example.com/slides/equilibrium.pptx', 
  'pptx', 
  '中級', 
  68, 
  134, 
  true,
  '2024-02-14 12:00:00'::timestamp,
  'https://picsum.photos/seed/equilibrium/400/300'
FROM users u, subjects s
WHERE u.email = 'sato@example.com' AND s.name = '化学';

-- Insert difficulty analysis points using slide titles to find IDs
-- Analysis points for "量子力学の基礎：波動関数" (highest difficulty)
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '専門用語が難しい' FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '抽象的な概念' FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '数式の理解' FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1;

-- Analysis points for "有機化学反応機構"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '反応機構の複雑さ' FROM slides WHERE title = '有機化学反応機構' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '立体化学の理解' FROM slides WHERE title = '有機化学反応機構' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '矢印の記法' FROM slides WHERE title = '有機化学反応機構' LIMIT 1;

-- Analysis points for "相対性理論入門"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '時空の概念が難解' FROM slides WHERE title = '相対性理論入門' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '数学的背景知識' FROM slides WHERE title = '相対性理論入門' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '直感に反する内容' FROM slides WHERE title = '相対性理論入門' LIMIT 1;

-- Analysis points for "フーリエ変換の基礎"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '積分の計算' FROM slides WHERE title = 'フーリエ変換の基礎' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '複素数の扱い' FROM slides WHERE title = 'フーリエ変換の基礎' LIMIT 1;

-- Analysis points for "電磁気学の基本法則"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, 'ベクトル解析が必要' FROM slides WHERE title = '電磁気学の基本法則' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '偏微分方程式' FROM slides WHERE title = '電磁気学の基本法則' LIMIT 1;

-- Analysis points for "N1レベルの敬語表現"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '謙譲語と尊敬語の区別' FROM slides WHERE title = 'N1レベルの敬語表現' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '場面による使い分け' FROM slides WHERE title = 'N1レベルの敬語表現' LIMIT 1;

-- Analysis points for "線形代数：固有値問題"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '行列の対角化' FROM slides WHERE title = '線形代数：固有値問題' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '応用例の理解' FROM slides WHERE title = '線形代数：固有値問題' LIMIT 1;

-- Analysis points for "微積分の応用：最適化問題"
INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, 'ラグランジュ乗数法' FROM slides WHERE title = '微積分の応用：最適化問題' LIMIT 1;

INSERT INTO difficulty_analysis_points (slide_id, point_description)
SELECT id, '制約条件の設定' FROM slides WHERE title = '微積分の応用：最適化問題' LIMIT 1;

-- Insert tags for search functionality
INSERT INTO tags (name, type) VALUES 
  ('初級', 'system'),
  ('中級', 'system'),
  ('上級', 'system'),
  ('物理', 'keyword'),
  ('数学', 'keyword'),
  ('化学', 'keyword'),
  ('日本語教育', 'keyword'),
  ('生物', 'keyword'),
  ('量子力学', 'keyword'),
  ('相対性理論', 'keyword'),
  ('微積分', 'keyword'),
  ('フーリエ変換', 'keyword'),
  ('敬語', 'keyword'),
  ('古典文法', 'keyword'),
  ('有機化学', 'keyword'),
  ('化学平衡', 'keyword'),
  ('電磁気学', 'keyword'),
  ('線形代数', 'keyword'),
  ('実験', 'keyword'),
  ('理論', 'keyword'),
  ('応用', 'keyword'),
  ('やさしい日本語', 'keyword')
ON CONFLICT (name) DO NOTHING;

-- Link tags to slides
-- 量子力学の基礎：波動関数
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '物理', '量子力学', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '量子力学の基礎：波動関数' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 相対性理論入門
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '相対性理論入門' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '物理', '相対性理論', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '相対性理論入門' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 微積分の応用：最適化問題
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '微積分の応用：最適化問題' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('中級', '数学', '微積分', '応用')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '微積分の応用：最適化問題' LIMIT 1)
      AND st.tag_id = t.id
  );

-- フーリエ変換の基礎
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = 'フーリエ変換の基礎' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '数学', 'フーリエ変換', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = 'フーリエ変換の基礎' LIMIT 1)
      AND st.tag_id = t.id
  );

-- N1レベルの敬語表現
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = 'N1レベルの敬語表現' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '日本語教育', '敬語', 'やさしい日本語')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = 'N1レベルの敬語表現' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 古典文法の基礎
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '古典文法の基礎' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('中級', '日本語教育', '古典文法')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '古典文法の基礎' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 有機化学反応機構
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '有機化学反応機構' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '化学', '有機化学', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '有機化学反応機構' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 化学平衡の理論
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '化学平衡の理論' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('中級', '化学', '化学平衡', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '化学平衡の理論' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 電磁気学の基本法則
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '電磁気学の基本法則' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('上級', '物理', '電磁気学', '理論')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '電磁気学の基本法則' LIMIT 1)
      AND st.tag_id = t.id
  );

-- 線形代数：固有値問題
INSERT INTO slide_tags (slide_id, tag_id)
SELECT 
  (SELECT id FROM slides WHERE title = '線形代数：固有値問題' LIMIT 1) as slide_id,
  t.id as tag_id
FROM tags t
WHERE t.name IN ('中級', '数学', '線形代数', '応用')
  AND NOT EXISTS (
    SELECT 1 FROM slide_tags st 
    WHERE st.slide_id = (SELECT id FROM slides WHERE title = '線形代数：固有値問題' LIMIT 1)
      AND st.tag_id = t.id
  );

-- Additional minimal records for lightweight testing (about 3 slides)
DO $$
DECLARE
  suzuki_id INT;
  tanaka_id INT;
  yamada_id INT;
  physics_id INT;
  math_id INT;
  japanese_id INT;
BEGIN
  SELECT id INTO suzuki_id FROM users WHERE email = 'suzuki@example.com';
  SELECT id INTO tanaka_id FROM users WHERE email = 'tanaka@example.com';
  SELECT id INTO yamada_id FROM users WHERE email = 'yamada@example.com';
  SELECT id INTO physics_id FROM subjects WHERE name = '物理';
  SELECT id INTO math_id FROM subjects WHERE name = '数学';
  SELECT id INTO japanese_id FROM subjects WHERE name = '日本語教育';

  IF suzuki_id IS NOT NULL AND physics_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES
      (suzuki_id, physics_id, '量子情報入門', '量子ビットと重ね合わせの基礎', 'https://example.com/slides/quantum-info.pdf', 'pdf', '上級', 92, 12, true)
    ON CONFLICT DO NOTHING;
  END IF;

  IF tanaka_id IS NOT NULL AND math_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES
      (tanaka_id, math_id, '統計的学習理論', '汎化誤差とVC次元の概要', 'https://example.com/slides/stat-learning.pptx', 'pptx', '上級', 81, 18, true)
    ON CONFLICT DO NOTHING;
  END IF;

  IF yamada_id IS NOT NULL AND japanese_id IS NOT NULL THEN
    INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES
      (yamada_id, japanese_id, '日本語教育の評価設計', '評価ルーブリックと信頼性の確保', 'https://example.com/slides/jp-assessment.pdf', 'pdf', '中級', 77, 9, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Analysis points for the additional minimal records
DO $$
DECLARE
  slide_id_var INT;
BEGIN
  SELECT id INTO slide_id_var FROM slides WHERE title = '量子情報入門' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES
      (slide_id_var, '線形代数と量子力学の前提知識が必要'),
      (slide_id_var, '抽象的なベクトル空間の理解が求められる')
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO slide_id_var FROM slides WHERE title = '統計的学習理論' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES
      (slide_id_var, '汎化誤差の式変形が多い'),
      (slide_id_var, '確率論の復習が必要')
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO slide_id_var FROM slides WHERE title = '日本語教育の評価設計' LIMIT 1;
  IF slide_id_var IS NOT NULL THEN
    INSERT INTO difficulty_analysis_points (slide_id, point_description) VALUES
      (slide_id_var, '評価基準の整合性を考える必要'),
      (slide_id_var, '信頼性と妥当性の概念が抽象的')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Commit the transaction
COMMIT;

-- Verify the data
SELECT 
  s.title,
  s.difficulty_score,
  u.full_name as teacher,
  sub.name as subject,
  COUNT(DISTINCT dap.id) as analysis_points_count,
  ARRAY_AGG(DISTINCT t.name) as tags
FROM slides s
JOIN users u ON s.user_id = u.id
LEFT JOIN subjects sub ON s.subject_id = sub.id
LEFT JOIN difficulty_analysis_points dap ON s.id = dap.slide_id
LEFT JOIN slide_tags st ON s.id = st.slide_id
LEFT JOIN tags t ON st.tag_id = t.id
GROUP BY s.id, s.title, s.difficulty_score, u.full_name, sub.name
ORDER BY s.difficulty_score DESC;
