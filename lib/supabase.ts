import { createClient } from '@supabase/supabase-js'
import { Post, Comment, EngagementLog } from '@/types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Posts
export async function savePost(post: Omit<Post, 'id'>) {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single()
  
  if (error) throw error
  return data as Post
}

export async function getRecentPosts(limit: number = 10) {
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
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single()
  
  if (error) throw error
  return data as Comment
}

export async function getRecentComments(limit: number = 10) {
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
  const { data, error } = await supabase
    .from('engagement_logs')
    .insert([log])
    .select()
    .single()
  
  if (error) throw error
  return data as EngagementLog
}

export async function getRecentEngagementLogs(limit: number = 10) {
  const { data, error } = await supabase
    .from('engagement_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as EngagementLog[]
}
