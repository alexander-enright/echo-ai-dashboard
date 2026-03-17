-- Echo AI Dashboard Automation Schema

-- Scheduled Quotes Table
CREATE TABLE IF NOT EXISTS scheduled_quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT DEFAULT 'motivational',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_time TEXT NOT NULL,
    posted_to_x BOOLEAN DEFAULT false,
    tweet_id TEXT,
    posted_at TIMESTAMP WITH TIME ZONE
);

-- Retweet History Table
CREATE TABLE IF NOT EXISTS retweet_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tweet_id TEXT NOT NULL UNIQUE,
    tweet_text TEXT NOT NULL,
    author_username TEXT NOT NULL,
    author_id TEXT,
    likes_count INTEGER,
    retweets_count INTEGER,
    retweeted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_run_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Settings Table
CREATE TABLE IF NOT EXISTS automation_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_name TEXT NOT NULL UNIQUE,
    setting_value BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO automation_settings (setting_name, setting_value) VALUES
    ('auto_post_quotes', false),
    ('enable_auto_retweets', false)
ON CONFLICT (setting_name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_quotes_posted ON scheduled_quotes(posted_to_x);
CREATE INDEX IF NOT EXISTS idx_scheduled_quotes_scheduled_time ON scheduled_quotes(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_retweet_history_tweet_id ON retweet_history(tweet_id);
CREATE INDEX IF NOT EXISTS idx_retweet_history_retweeted_at ON retweet_history(retweeted_at DESC);

-- Enable RLS
ALTER TABLE scheduled_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retweet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all" ON scheduled_quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON retweet_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON automation_settings FOR ALL USING (true) WITH CHECK (true);
