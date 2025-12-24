-- Migration: Update know_how_reactions table to support emoji reactions
-- Drop old constraint and add new one with emoji types
ALTER TABLE know_how_reactions 
DROP CONSTRAINT know_how_reactions_reaction_type_check;

ALTER TABLE know_how_reactions 
ADD CONSTRAINT know_how_reactions_reaction_type_check 
CHECK (reaction_type IN ('love', 'like', 'haha', 'wow', 'sad', 'angry'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_know_how_reactions_article_type 
ON know_how_reactions(article_id, reaction_type);
