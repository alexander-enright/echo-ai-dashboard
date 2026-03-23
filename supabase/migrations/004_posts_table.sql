-- Create posts table for Echo Dashboard
-- Stores user posts with scheduling and publishing status

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  platform TEXT NOT NULL DEFAULT 'twitter' CHECK (platform IN ('twitter', 'linkedin')),
  x_user_id TEXT,
  tweet_id TEXT,
  engagement_likes INTEGER DEFAULT 0,
  engagement_retweets INTEGER DEFAULT 0,
  engagement_replies INTEGER DEFAULT 0,
  engagement_impressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own posts" 
  ON posts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_updated_at();

-- Grant permissions
GRANT ALL ON posts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to get post count for user
CREATE OR REPLACE FUNCTION get_user_post_count(user_uuid UUID)
RETURNS TABLE (total BIGINT, scheduled BIGINT, published BIGINT, draft BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE status = 'scheduled')::BIGINT as scheduled,
    COUNT(*) FILTER (WHERE status = 'published')::BIGINT as published,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft
  FROM posts
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;