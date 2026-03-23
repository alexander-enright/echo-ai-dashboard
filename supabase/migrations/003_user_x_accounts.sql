-- Migration: Create user_x_accounts table for multi-user X OAuth 2.0 integration
-- This table stores OAuth tokens per user, supporting multiple X accounts per internal user

-- Create the user_x_accounts table
CREATE TABLE IF NOT EXISTS user_x_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  x_user_id TEXT NOT NULL,
  x_username TEXT NOT NULL,
  x_display_name TEXT,
  profile_image_url TEXT,
  
  -- OAuth 2.0 tokens (stored securely)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  
  -- Token expiration tracking
  expires_at TIMESTAMPTZ,
  scope TEXT, -- Store the scopes granted (e.g., 'tweet.read tweet.write users.read')
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  -- Status tracking
  is_active BOOLEAN DEFAULT true,
  
  -- Unique constraint: one entry per user_id + x_user_id combination
  -- This prevents duplicate connections to the same X account
  CONSTRAINT unique_user_x_account UNIQUE (user_id, x_user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_x_accounts ENABLE ROW LEVEL SECURITY;

-- Create indexes for fast lookups
-- Index on user_id: quickly find all X accounts for a given user
CREATE INDEX IF NOT EXISTS idx_user_x_accounts_user_id ON user_x_accounts(user_id);

-- Index on x_user_id: quickly find internal users connected to a specific X account
CREATE INDEX IF NOT EXISTS idx_user_x_accounts_x_user_id ON user_x_accounts(x_user_id);

-- Index on expires_at: quickly find tokens that need refreshing
CREATE INDEX IF NOT EXISTS idx_user_x_accounts_expires_at ON user_x_accounts(expires_at);

-- Index for active accounts lookup
CREATE INDEX IF NOT EXISTS idx_user_x_accounts_active ON user_x_accounts(user_id, is_active);

-- RLS Policies: Users can only access their own X accounts
-- This is critical for security - prevents token leaks across users

-- Policy: Users can SELECT their own X accounts
CREATE POLICY "Users can view their own X accounts"
  ON user_x_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own X accounts
CREATE POLICY "Users can add their own X accounts"
  ON user_x_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own X accounts
-- This allows updating tokens when refreshing
CREATE POLICY "Users can update their own X accounts"
  ON user_x_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can DELETE their own X accounts
CREATE POLICY "Users can delete their own X accounts"
  ON user_x_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_x_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_user_x_accounts_timestamp ON user_x_accounts;
CREATE TRIGGER update_user_x_accounts_timestamp
  BEFORE UPDATE ON user_x_accounts
  FOR EACH ROW EXECUTE FUNCTION update_user_x_accounts_updated_at();

-- Grant permissions to authenticated users
GRANT ALL ON user_x_accounts TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verification query
-- SELECT * FROM user_x_accounts WHERE user_id = 'your-user-id';

-- ============================================
-- COMMENTS: Security and Multi-User Design
-- ============================================

COMMENT ON TABLE user_x_accounts IS 
'Stores X (Twitter) OAuth 2.0 tokens per user. Each row represents one X account connected to one internal user. 
Unique constraint on (user_id, x_user_id) ensures a user can only connect the same X account once, 
but can connect multiple different X accounts.';

COMMENT ON COLUMN user_x_accounts.access_token IS 
'OAuth 2.0 access token for X API calls. Never exposed to client-side code. RLS policies ensure 
users can only access their own tokens.';

COMMENT ON COLUMN user_x_accounts.user_id IS 
'Internal Supabase auth user ID. References auth.users(id). Cascade delete removes X connections 
when user is deleted.';

COMMENT ON COLUMN user_x_accounts.x_user_id IS 
'X (Twitter) unique user ID returned from OAuth 2.0. Used to identify the specific X account.';

-- Done
SELECT 'user_x_accounts table created successfully' as status;