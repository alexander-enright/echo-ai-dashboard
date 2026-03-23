-- Multi-User SaaS Schema Migration for Echo
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security) extension if not already enabled
-- (Supabase has this by default)

-- ============================================
-- PROFILES TABLE (extends Supabase Auth users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- X ACCOUNTS TABLE (OAuth tokens per user)
-- ============================================
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
  
  -- One X account per user
  CONSTRAINT unique_user_x_account UNIQUE (user_id)
);

-- Enable RLS on x_accounts
ALTER TABLE x_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for x_accounts
CREATE POLICY "Users can view own X account" 
  ON x_accounts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own X account" 
  ON x_accounts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own X account" 
  ON x_accounts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own X account" 
  ON x_accounts FOR DELETE 
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_x_accounts_user_id ON x_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_x_accounts_x_user_id ON x_accounts(x_user_id);

-- ============================================
-- GENERATED POSTS TABLE (per user)
-- ============================================
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

-- Enable RLS on generated_posts
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

-- Policies for generated_posts
CREATE POLICY "Users can view own posts" 
  ON generated_posts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" 
  ON generated_posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON generated_posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON generated_posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_posts_user_id ON generated_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_posts_status ON generated_posts(status);
CREATE INDEX IF NOT EXISTS idx_generated_posts_created_at ON generated_posts(created_at DESC);

-- ============================================
-- ACTIVITY LOG TABLE (per user)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for activity_log
CREATE POLICY "Users can view own activity" 
  ON activity_log FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" 
  ON activity_log FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================
-- MIGRATE EXISTING DATA (if any)
-- ============================================
-- Note: This section only runs if old tables exist
-- and migrates data to user-scoped tables

-- If you have existing posts, comments, etc. from single-user mode,
-- you would need to manually migrate or assign to a default user

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_x_accounts_updated_at ON x_accounts;
CREATE TRIGGER update_x_accounts_updated_at
  BEFORE UPDATE ON x_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_generated_posts_updated_at ON generated_posts;
CREATE TRIGGER update_generated_posts_updated_at
  BEFORE UPDATE ON generated_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action, metadata)
  VALUES (p_user_id, p_action, p_metadata)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON x_accounts TO authenticated;
GRANT ALL ON generated_posts TO authenticated;
GRANT ALL ON activity_log TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- DONE
-- ============================================
-- Run this migration in order:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a "New Query"
-- 3. Paste this entire file
-- 4. Run the query
--
-- Verify tables were created:
-- SELECT * FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('profiles', 'x_accounts', 'generated_posts', 'activity_log');