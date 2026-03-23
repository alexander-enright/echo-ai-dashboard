import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { 
  Profile, 
  XAccount, 
  GeneratedPost, 
  ActivityLogEntry, 
  ActivityAction, 
  ActivityMetadata 
} from '@/types'

// Server-side client creation function
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// ============================================
// PROFILES
// ============================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

// ============================================
// X ACCOUNTS (User's Twitter Connection)
// ============================================

export async function getXAccount(userId: string): Promise<XAccount | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('x_accounts')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as XAccount
}

export async function saveXAccount(account: Omit<XAccount, 'id' | 'created_at' | 'updated_at'>): Promise<XAccount> {
  const supabase = createServerSupabaseClient()
  
  // Check if account already exists for this user
  const existing = await getXAccount(account.user_id)
  
  if (existing) {
    // Update existing account
    const { data, error } = await supabase
      .from('x_accounts')
      .update({
        x_user_id: account.x_user_id,
        x_username: account.x_username,
        x_display_name: account.x_display_name,
        access_token: account.access_token,
        access_secret: account.access_secret,
        profile_image_url: account.profile_image_url,
        followers_count: account.followers_count,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', account.user_id)
      .select()
      .single()
    
    if (error) throw error
    return data as XAccount
  } else {
    // Insert new account
    const { data, error } = await supabase
      .from('x_accounts')
      .insert([{
        user_id: account.user_id,
        x_user_id: account.x_user_id,
        x_username: account.x_username,
        x_display_name: account.x_display_name,
        access_token: account.access_token,
        access_secret: account.access_secret,
        profile_image_url: account.profile_image_url,
        followers_count: account.followers_count
      }])
      .select()
      .single()
    
    if (error) throw error
    return data as XAccount
  }
}

export async function deleteXAccount(userId: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('x_accounts')
    .delete()
    .eq('user_id', userId)
  
  if (error) throw error
}

// ============================================
// GENERATED POSTS
// ============================================

export async function createGeneratedPost(
  userId: string, 
  content: string
): Promise<GeneratedPost> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('generated_posts')
    .insert([{
      user_id: userId,
      content,
      status: 'draft'
    }])
    .select()
    .single()
  
  if (error) throw error
  return data as GeneratedPost
}

export async function getGeneratedPosts(
  userId: string, 
  limit: number = 50
): Promise<GeneratedPost[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('generated_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as GeneratedPost[]
}

export async function getPostById(userId: string, postId: string): Promise<GeneratedPost | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('generated_posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as GeneratedPost
}

export async function updatePostStatus(
  userId: string,
  postId: string,
  status: 'draft' | 'posted' | 'failed',
  tweetId?: string
): Promise<GeneratedPost> {
  const supabase = createServerSupabaseClient()
  const updates: any = { status }
  
  if (status === 'posted') {
    updates.posted_at = new Date().toISOString()
    if (tweetId) updates.tweet_id = tweetId
  }
  
  const { data, error } = await supabase
    .from('generated_posts')
    .update(updates)
    .eq('id', postId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as GeneratedPost
}

export async function deleteGeneratedPost(userId: string, postId: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('generated_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId)
  
  if (error) throw error
}

// ============================================
// ACTIVITY LOG
// ============================================

export async function logActivity(
  userId: string,
  action: ActivityAction,
  metadata: ActivityMetadata = {}
): Promise<ActivityLogEntry> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('activity_log')
    .insert([{
      user_id: userId,
      action,
      metadata
    }])
    .select()
    .single()
  
  if (error) throw error
  return data as ActivityLogEntry
}

export async function getActivityLog(
  userId: string, 
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as ActivityLogEntry[]
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getUserStats(userId: string) {
  const supabase = createServerSupabaseClient()
  
  // Get post counts
  const { data: posts, error: postsError } = await supabase
    .from('generated_posts')
    .select('status')
    .eq('user_id', userId)
  
  if (postsError) throw postsError
  
  const totalPosts = posts.length
  const postedCount = posts.filter(p => p.status === 'posted').length
  
  // Get X account followers
  const { data: xAccount, error: xError } = await supabase
    .from('x_accounts')
    .select('followers_count')
    .eq('user_id', userId)
    .single()
  
  const followers = xAccount?.followers_count || 0
  
  return {
    totalPosts,
    postedCount,
    followers
  }
}

// ============================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================

import { Post, Comment, EngagementLog } from '@/types'

export async function savePost(post: Omit<Post, 'id'>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()
  
  if (error) throw error
  return data as Post
}

export async function getRecentPosts(limit: number = 10) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('posted_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Post[]
}

export async function saveComment(comment: Omit<Comment, 'id'>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single()
  
  if (error) throw error
  return data as Comment
}

export async function getRecentComments(limit: number = 10) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Comment[]
}

export async function saveEngagementLog(log: Omit<EngagementLog, 'id'>) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('engagement_logs')
    .insert([log])
    .select()
    .single()
  
  if (error) throw error
  return data as EngagementLog
}

export async function getRecentEngagementLogs(limit: number = 10) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as EngagementLog[]
}