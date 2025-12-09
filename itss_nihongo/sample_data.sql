-- Sample data for testing the difficulty ranking API
-- Run this script after initializing the database with PostgreSQL_init.sql

-- Insert sample subjects
INSERT INTO subjects (name) VALUES 
  ('物理'),
  ('数学'),
  ('日本語教育'),
  ('化学'),
  ('生物')
ON CONFLICT (name) DO NOTHING;

-- Insert sample users (teachers)
INSERT INTO users (email, password_hash, full_name, school_name, specialization, years_of_experience) VALUES 
  ('suzuki@example.com', '$2b$10$dummyhash1', '鈴木先生', '東京大学', '物理学', 15),
  ('tanaka@example.com', '$2b$10$dummyhash2', '田中先生', '京都大学', '数学', 10),
  ('yamada@example.com', '$2b$10$dummyhash3', '山田先生', '大阪大学', '日本語教育', 8),
  ('sato@example.com', '$2b$10$dummyhash4', '佐藤先生', '名古屋大学', '化学', 12)
ON CONFLICT (email) DO NOTHING;

-- Insert sample slides with varying difficulty scores
INSERT INTO slides (user_id, subject_id, title, description, file_url, file_type, difficulty_level, difficulty_score, view_count, is_public) VALUES 
  (1, 1, '量子力学の基礎：波動関数', '量子力学における波動関数の基本概念を解説', 'https://example.com/slides/quantum-basics.pdf', 'pdf', '上級', 95, 45, true),
  (1, 1, '相対性理論入門', 'アインシュタインの特殊相対性理論の基礎', 'https://example.com/slides/relativity.pptx', 'pptx', '上級', 88, 62, true),
  (2, 2, '微積分の応用：最適化問題', '実世界の最適化問題における微積分の応用', 'https://example.com/slides/calculus-optimization.pdf', 'pdf', '中級', 72, 123, true),
  (2, 2, 'フーリエ変換の基礎', '信号処理におけるフーリエ変換の理論と実践', 'https://example.com/slides/fourier.pdf', 'pdf', '上級', 85, 89, true),
  (3, 3, 'N1レベルの敬語表現', '日本語能力試験N1レベルの敬語の使い分け', 'https://example.com/slides/keigo-n1.pptx', 'pptx', 'N1', 78, 156, true),
  (3, 3, '古典文法の基礎', '古文における文法事項の基本', 'https://example.com/slides/kobun-grammar.pdf', 'pdf', '中級', 65, 98, true),
  (4, 4, '有機化学反応機構', '有機化合物の反応メカニズムの詳細', 'https://example.com/slides/organic-mechanisms.pdf', 'pdf', '上級', 90, 71, true),
  (4, 4, '化学平衡の理論', '平衡定数と反応の進行方向', 'https://example.com/slides/equilibrium.pptx', 'pptx', '中級', 68, 134, true),
  (1, 1, '電磁気学の基本法則', 'マクスウェル方程式の導出と応用', 'https://example.com/slides/electromagnetism.pdf', 'pdf', '上級', 82, 105, true),
  (2, 2, '線形代数：固有値問題', '行列の固有値と固有ベクトルの応用', 'https://example.com/slides/eigenvalues.pdf', 'pdf', '中級', 75, 142, true);

-- Get the slide IDs for inserting difficulty analysis points
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

-- Verify the data
SELECT 
  s.title,
  s.difficulty_score,
  u.full_name as teacher,
  sub.name as subject,
  COUNT(dap.id) as analysis_points_count
FROM slides s
JOIN users u ON s.user_id = u.id
LEFT JOIN subjects sub ON s.subject_id = sub.id
LEFT JOIN difficulty_analysis_points dap ON s.id = dap.slide_id
GROUP BY s.id, s.title, s.difficulty_score, u.full_name, sub.name
ORDER BY s.difficulty_score DESC;
