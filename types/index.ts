// ============================================
// LEGACY TYPES (keeping for backward compatibility)
// ============================================
export interface Post {
  id: string
  content: string
  type: 'motivational' | 'famous'
  posted_at: string
  tweet_id?: string
}

export interface Comment {
  id: string
  tweet_id: string
  comment_text: string
  created_at: string
}

export interface EngagementLog {
  id: string
  tweet_id: string
  action: 'like' | 'retweet' | 'comment'
  created_at: string
}

export interface Topic {
  id: string
  name: string
  slug: string
}

export interface Quote {
  text: string
  author: string
  category: string
}

// ============================================
// MULTI-USER SAAS TYPES
// ============================================

// User Profile (extends Supabase Auth)
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// X/Twitter Account Connection
export interface XAccount {
  id: string
  user_id: string
  x_user_id: string
  x_username: string
  x_display_name: string | null
  access_token: string
  access_secret: string
  profile_image_url: string | null
  followers_count: number
  created_at: string
  updated_at: string
}

// Generated Post (AI-generated content)
export interface GeneratedPost {
  id: string
  user_id: string
  content: string
  status: 'draft' | 'posted' | 'failed'
  posted_at: string | null
  tweet_id: string | null
  created_at: string
  updated_at: string
}

// Activity Log Entry
export interface ActivityLogEntry {
  id: string
  user_id: string
  action: ActivityAction
  metadata: ActivityMetadata
  created_at: string
}

// Activity Action Types
export type ActivityAction =
  | 'signup'
  | 'login'
  | 'logout'
  | 'connect_x'
  | 'disconnect_x'
  | 'generate_post'
  | 'post_to_x'
  | 'retweet'
  | 'like'
  | 'reply'
  | 'update_settings'
  | 'reset_password'

// Activity Metadata (varies by action)
export interface ActivityMetadata {
  ip?: string
  userAgent?: string
  postId?: string
  tweetId?: string
  targetUsername?: string
  error?: string
  [key: string]: any
}

// X Profile Data (from Twitter API)
export interface XProfileData {
  id: string
  username: string
  displayName: string
  profileImageUrl: string | null
  followersCount: number
  verified: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Auth Types
export interface SignUpCredentials {
  email: string
  password: string
  fullName?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

// Dashboard Data
export interface DashboardData {
  xAccount: XAccount | null
  recentPosts: GeneratedPost[]
  recentActivity: ActivityLogEntry[]
  stats: {
    totalPosts: number
    postedCount: number
    followers: number
  }
}
