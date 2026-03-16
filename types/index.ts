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
