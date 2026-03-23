-- Safe Migration - handles existing objects

-- X ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS x_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  x_user_id TEXT NOT NULL,
  x_username TEXT NOT NULL,
  x_display_name TEXT,
  access_token TEXT NOT NULL,
  access_secret TEXT NOT NULL,
  profile_image_url TEXT,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_x_account UNIQUE (user_id)
);

ALTER TABLE x_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can view own X account" ON x_accounts;
DROP POLICY IF EXISTS "Users can insert own X account" ON x_accounts;
DROP POLICY IF EXISTS "Users can update own X account" ON x_accounts;
DROP POLICY IF EXISTS "Users can delete own X account" ON x_accounts;

-- Create policies
CREATE POLICY "Users can view own X account" ON x_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own X account" ON x_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own X account" ON x_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own X account" ON x_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_x_accounts_user_id ON x_accounts(user_id);

-- GENERATED POSTS TABLE
CREATE TABLE IF NOT EXISTS generated_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'failed')),
  posted_at TIMESTAMPTZ,
  tweet_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own posts" ON generated_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON generated_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON generated_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON generated_posts;

CREATE POLICY "Users can view own posts" ON generated_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON generated_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON generated_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON generated_posts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_posts_user_id ON generated_posts(user_id);

-- ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_log;

CREATE POLICY "Users can view own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);

-- Helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop first if exists)
DROP TRIGGER IF EXISTS update_x_accounts_updated_at ON x_accounts;
CREATE TRIGGER update_x_accounts_updated_at BEFORE UPDATE ON x_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generated_posts_updated_at ON generated_posts;
CREATE TRIGGER update_generated_posts_updated_at BEFORE UPDATE ON generated_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done
SELECT 'Migration completed successfully' as status;
