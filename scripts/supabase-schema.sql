-- Echo AI Dashboard - Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('motivational', 'famous')),
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tweet_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tweet_id TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement logs table
CREATE TABLE IF NOT EXISTS engagement_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tweet_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('like', 'retweet', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table (for quote categories)
CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default topics
INSERT INTO topics (name, slug) VALUES
    ('General', 'general'),
    ('Sports', 'sports'),
    ('Entrepreneurship', 'entrepreneurship')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tweet_id ON posts(tweet_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_tweet_id ON comments(tweet_id);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_created_at ON engagement_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_tweet_id ON engagement_logs(tweet_id);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - update for auth later)
CREATE POLICY "Allow all" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON engagement_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON topics FOR ALL USING (true) WITH CHECK (true);
