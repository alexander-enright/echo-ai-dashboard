import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { calculateExpiration, isTokenExpired, refreshAccessToken } from './twitter-oauth';

// Types for user_x_accounts
export interface UserXAccount {
  id: string;
  user_id: string;
  x_user_id: string;
  x_username: string;
  x_display_name: string | null;
  profile_image_url: string | null;
  followers_count: number;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

/**
 * Create server-side Supabase client
 * Uses service role key for admin operations or anon key for user operations
 */
function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY; // Use anon key with RLS

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Save or update X account connection
 * Called after successful OAuth flow
 */
export async function saveUserXAccount(params: {
  userId: string;
  xUserId: string;
  xUsername: string;
  xDisplayName?: string;
  profileImageUrl?: string;
  followersCount?: number;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}): Promise<UserXAccount> {
  const supabase = createServerSupabaseClient();

  const {
    userId,
    xUserId,
    xUsername,
    xDisplayName,
    profileImageUrl,
    accessToken,
    refreshToken,
    expiresIn,
    scope,
  } = params;

  // Calculate expiration timestamp
  const expiresAt = expiresIn ? calculateExpiration(expiresIn).toISOString() : null;

  console.log('[DB] Saving X account:', {
    userId: userId.substring(0, 8) + '...',
    xUserId,
    xUsername,
    hasRefreshToken: !!refreshToken,
    expiresAt,
  });

  // Upsert: Insert if new, update if exists (based on unique constraint)
  const { data, error } = await supabase
    .from('user_x_accounts')
    .upsert(
      {
        user_id: userId,
        x_user_id: xUserId,
        x_username: xUsername,
        x_display_name: xDisplayName || null,
        profile_image_url: profileImageUrl || null,
        access_token: accessToken,
        refresh_token: refreshToken || null,
        expires_at: expiresAt,
        scope: scope || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,x_user_id', // Unique constraint
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[DB] Failed to save X account:', error);
    throw new Error(`Failed to save X account: ${error.message}`);
  }

  console.log('[DB] X account saved successfully');
  return data as UserXAccount;
}

/**
 * Get all X accounts for a user
 * Returns array of connected X accounts (supports multiple accounts per user)
 */
export async function getUserXAccounts(userId: string): Promise<UserXAccount[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_x_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] Failed to fetch X accounts:', error);
    throw new Error(`Failed to fetch X accounts: ${error.message}`);
  }

  return (data || []) as UserXAccount[];
}

/**
 * Get specific X account by x_user_id
 * Used when user selects which account to post from
 */
export async function getUserXAccountByXUserId(
  userId: string,
  xUserId: string
): Promise<UserXAccount | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_x_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('x_user_id', xUserId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch X account: ${error.message}`);
  }

  return data as UserXAccount;
}

/**
 * Get valid access token for posting
 * Automatically refreshes if expired
 * This is the KEY function for token management
 */
export async function getValidAccessToken(
  userId: string,
  xUserId: string
): Promise<{ accessToken: string; xAccount: UserXAccount }> {
  const supabase = createServerSupabaseClient();

  // Fetch the account
  const xAccount = await getUserXAccountByXUserId(userId, xUserId);

  if (!xAccount) {
    throw new Error('X account not found or not connected');
  }

  // Check if token is expired
  if (xAccount.expires_at && isTokenExpired(new Date(xAccount.expires_at))) {
    console.log('[Token] Token expired, refreshing...');

    if (!xAccount.refresh_token) {
      throw new Error('Token expired and no refresh token available. Reconnect X account.');
    }

    // Refresh the token
    try {
      const refreshed = await refreshAccessToken(xAccount.refresh_token);

      // Update database with new tokens
      const { data: updated, error } = await supabase
        .from('user_x_accounts')
        .update({
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken || xAccount.refresh_token,
          expires_at: calculateExpiration(refreshed.expiresIn).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', xAccount.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update refreshed token: ${error.message}`);
      }

      console.log('[Token] Token refreshed successfully');
      return { accessToken: refreshed.accessToken, xAccount: updated as UserXAccount };
    } catch (refreshError: any) {
      console.error('[Token] Token refresh failed:', refreshError);
      
      // Mark account as inactive since token is invalid
      await supabase
        .from('user_x_accounts')
        .update({ is_active: false })
        .eq('id', xAccount.id);
      
      throw new Error('Token refresh failed. Please reconnect your X account.');
    }
  }

  // Token is still valid
  return { accessToken: xAccount.access_token, xAccount };
}

/**
 * Update last_used timestamp
 * Called after successful API call
 */
export async function updateLastUsed(userId: string, xUserId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  await supabase
    .from('user_x_accounts')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('x_user_id', xUserId);
}

/**
 * Disconnect (deactivate) X account
 * Soft delete - keeps record but marks inactive
 */
export async function disconnectXAccount(userId: string, xUserId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('user_x_accounts')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('x_user_id', xUserId);

  if (error) {
    throw new Error(`Failed to disconnect X account: ${error.message}`);
  }

  console.log('[DB] X account disconnected:', xUserId);
}

/**
 * Delete X account completely (hard delete)
 * Use with caution - removes all token data
 */
export async function deleteXAccount(userId: string, xUserId: string): Promise<void> {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('user_x_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('x_user_id', xUserId);

  if (error) {
    throw new Error(`Failed to delete X account: ${error.message}`);
  }
}

/**
 * Get X account count for a user
 * Useful for UI showing number of connected accounts
 */
export async function getXAccountCount(userId: string): Promise<number> {
  const supabase = createServerSupabaseClient();

  const { count, error } = await supabase
    .from('user_x_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to count X accounts: ${error.message}`);
  }

  return count || 0;
}

/**
 * Check if user has any connected X accounts
 */
export async function hasXAccounts(userId: string): Promise<boolean> {
  const count = await getXAccountCount(userId);
  return count > 0;
}