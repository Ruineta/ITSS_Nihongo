-- Migration: Add thumbnail_url field to slides table
-- Run this if your database already exists

-- Add thumbnail_url column
ALTER TABLE slides ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN slides.thumbnail_url IS 'サムネイル画像のURL（第1ページから自動生成）';

-- Optional: Update existing slides with placeholder thumbnails
-- UPDATE slides SET thumbnail_url = CONCAT('https://via.placeholder.com/400x300/', 
--   CASE file_type 
--     WHEN 'pdf' THEN '4A90E2'
--     WHEN 'pptx' THEN '50C878'
--     WHEN 'ppt' THEN 'FF6B6B'
--     ELSE '9B59B6'
--   END,
--   '/ffffff?text=', UPPER(file_type), '+Slide')
-- WHERE thumbnail_url IS NULL;
