import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Post, Comment, EngagementLog } from '@/types'

// Server-side client creation function
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Posts
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

// Comments
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

// Engagement Logs
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

// Scheduled Quotes
export async function saveScheduledQuote(quote: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('scheduled_quotes')
    .insert([quote])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getScheduledQuotes(limit: number = 50) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('scheduled_quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

export async function updateScheduledQuote(id: string, updates: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('scheduled_quotes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteScheduledQuote(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('scheduled_quotes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

// Retweet History
export async function saveRetweetHistory(retweet: any) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('retweet_history')
    .insert([retweet])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getRetweetHistory(limit: number = 100) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('retweet_history')
    .select('*')
    .order('retweeted_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Automation Settings
export async function getAutomationSetting(name: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('automation_settings')
    .select('setting_value')
    .eq('setting_name', name)
    .maybeSingle()
  
  if (error) {
    console.error('Error getting setting:', error)
    return false
  }
  return data?.setting_value || false
}

export async function setAutomationSetting(name: string, value: boolean) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('automation_settings')
    .upsert({
      setting_name: name,
      setting_value: value,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'setting_name'
    })
    .select()
  
  if (error) throw error
  return data
}