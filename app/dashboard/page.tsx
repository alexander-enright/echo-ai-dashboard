'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import SchedulingDashboard from '@/components/SchedulingDashboard'
import { 
  Twitter, 
  LogOut, 
  Settings, 
  RefreshCw, 
  Send,
  Repeat,
  Sparkles,
  Activity,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Clock,
  List
} from 'lucide-react'
import Link from 'next/link'

interface XAccount {
  id: string
  x_user_id: string
  x_username: string
  x_display_name: string
  profile_image_url: string | null
  followers_count: number
  verified: boolean
}

interface GeneratedPost {
  id: string
  content: string
  status: 'draft' | 'posted' | 'failed'
  created_at: string
  tweet_id?: string
}

interface ActivityItem {
  id: string
  action: string
  metadata: any
  created_at: string
}

interface ScheduledQuote {
  id: string
  quote_text: string
  author: string
  category: string
  scheduled_time: string
  created_at: string
  posted_to_x: boolean
  tweet_id?: string
  posted_at?: string
  status?: 'scheduled' | 'published' | 'failed'
}

type DashboardTab = 'overview' | 'scheduling'

// Safe date parsing helper
function safeDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return date
  } catch {
    return null
  }
}

function formatDateSafe(dateString: string | null | undefined): string {
  const date = safeDate(dateString)
  if (!date) return 'Invalid date'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  const { user, signOut, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  
  const [xAccount, setXAccount] = useState<XAccount | null>(null)
  const [isLoadingX, setIsLoadingX] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  
  const [isPosting, setIsPosting] = useState(false)
  const [retweetUrl, setRetweetUrl] = useState('')
  const [isRetweeting, setIsRetweeting] = useState(false)
  
  const [recentPosts, setRecentPosts] = useState<GeneratedPost[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Scheduling stats
  const [scheduledCount, setScheduledCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledQuote[]>([])

  // Fetch X account status
  useEffect(() => {
    if (user) {
      fetchXAccount()
      fetchPosts()
      fetchActivity()
      fetchSchedulingStats()
    }
  }, [user])

  const fetchXAccount = async () => {
    try {
      const res = await fetch('/api/x/profile')
      const data = await res.json()
      if (data.connected) {
        setXAccount(data.account)
      }
    } catch (error) {
      console.error('Failed to fetch X account:', error)
    } finally {
      setIsLoadingX(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?limit=5')
      const data = await res.json()
      if (data.posts) {
        setRecentPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity?limit=10')
      const data = await res.json()
      if (data.activity) {
        setActivity(data.activity)
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setIsLoadingData(false)
    }
  }
  
  const fetchSchedulingStats = async () => {
    try {
      const res = await fetch('/api/scheduledQuotes')
      const data = await res.json()
      if (data.quotes) {
        const quotes = data.quotes
          .filter((q: any) => q && q.id)
          .map((q: any) => ({
            ...q,
            status: q.posted_to_x ? 'published' : 'scheduled'
          }))
        
        setScheduledCount(quotes.filter((q: any) => q.status === 'scheduled').length)
        setPublishedCount(quotes.filter((q: any) => q.status === 'published').length)
        
        // Get next 3 upcoming posts
        const upcoming = quotes
          .filter((q: any) => q.status === 'scheduled')
          .sort((a: any, b: any) => {
            const dateA = safeDate(a.scheduled_time)
            const dateB = safeDate(b.scheduled_time)
            if (!dateA || !dateB) return 0
            return dateA.getTime() - dateB.getTime()
          })
          .slice(0, 3)
        
        setUpcomingPosts(upcoming)
      }
    } catch (error) {
      console.error('Failed to fetch scheduling stats:', error)
    }
  }

  const handleConnectX = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/x/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Failed to connect X:', error)
      setIsConnecting(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'motivational' })
      })
      const data = await res.json()
      if (data.content) {
        setGeneratedContent(data.content)
        setCurrentPostId(data.postId)
      }
    } catch (error) {
      console.error('Failed to generate:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostToX = async () => {
    if (!generatedContent || !xAccount) return
    
    setIsPosting(true)
    try {
      const res = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: generatedContent,
          postId: currentPostId 
        })
      })
      const data = await res.json()
      if (data.success) {
        setGeneratedContent('')
        setCurrentPostId(null)
        fetchPosts()
        fetchActivity()
      }
    } catch (error) {
      console.error('Failed to post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  const handleRetweet = async () => {
    if (!retweetUrl || !xAccount) return
    
    setIsRetweeting(true)
    try {
      const res = await fetch('/api/x/retweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl: retweetUrl })
      })
      const data = await res.json()
      if (data.success) {
        setRetweetUrl('')
        fetchActivity()
      }
    } catch (error) {
      console.error('Failed to retweet:', error)
    } finally {
      setIsRetweeting(false)
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'connect_x': return <Twitter className="h-4 w-4" />
      case 'generate_post': return <Sparkles className="h-4 w-4" />
      case 'post_to_x': return <Send className="h-4 w-4" />
      case 'retweet': return <Repeat className="h-4 w-4" />
      case 'login': return <User className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getActivityText = (item: ActivityItem) => {
    switch (item.action) {
      case 'connect_x': return `Connected X account @${item.metadata.x_username}`
      case 'generate_post': return 'Generated a new post'
      case 'post_to_x': return 'Posted to X'
      case 'retweet': return 'Retweeted a post'
      case 'login': return 'Logged in'
      case 'logout': return 'Logged out'
      default: return item.action
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <h1 className="text-xl font-bold text-white">Echo Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Activity className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'scheduling'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Scheduling
              {scheduledCount > 0 && (
                <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                  {scheduledCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* X Account Card */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    X Account
                  </h2>
                  {xAccount && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                </div>

                {isLoadingX ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : xAccount ? (
                  <div className="flex items-center gap-4">
                    {xAccount.profile_image_url ? (
                      <img 
                        src={xAccount.profile_image_url} 
                        alt={xAccount.x_display_name}
                        className="h-16 w-16 rounded-full"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {xAccount.x_display_name}
                        {xAccount.verified && (
                          <span className="ml-2 text-blue-400">✓</span>
                        )}
                      </p>
                      <p className="text-gray-400">@{xAccount.x_username}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {xAccount.followers_count.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      Connect your X account to start posting
                    </p>
                    <button
                      onClick={handleConnectX}
                      disabled={isConnecting}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Twitter className="h-4 w-4" />
                          Connect X Account
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Generate Section */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Generate Post
                  </h2>
                </div>

                {!generatedContent ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">
                      Let AI create an engaging post for you
                    </p>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                      <p className="text-white whitespace-pre-wrap">{generatedContent}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {generatedContent.length}/280 characters
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      {xAccount && (
                        <button
                          onClick={handlePostToX}
                          disabled={isPosting}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isPosting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Post to X
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Retweet Section */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-green-400" />
                    Quick Retweet
                  </h2>
                </div>

                {xAccount ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={retweetUrl}
                      onChange={(e) => setRetweetUrl(e.target.value)}
                      placeholder="Paste tweet URL here..."
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                    />
                    <button
                      onClick={handleRetweet}
                      disabled={isRetweeting || !retweetUrl}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isRetweeting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Retweeting...
                        </>
                      ) : (
                        <>
                          <Repeat className="h-4 w-4" />
                          Retweet
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Connect your X account to use retweet functionality
                  </p>
                )}
              </div>
              
              {/* Quick Scheduling Preview */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    Upcoming Scheduled Posts
                  </h2>
                  <button
                    onClick={() => setActiveTab('scheduling')}
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    View All →
                  </button>
                </div>
                
                {upcomingPosts.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingPosts.map((post) => (
                      <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDateSafe(post.scheduled_time).split(',')[0]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 truncate flex-1">
                          "{post.quote_text?.slice(0, 60)}..."
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">No upcoming scheduled posts.</p>
                    <button
                      onClick={() => setActiveTab('scheduling')}
                      className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      Go to Scheduling →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Activity */}
            <div className="space-y-6">
              {/* Scheduling Stats */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Scheduling Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-800 p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-400">{scheduledCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Scheduled</p>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Published</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('scheduling')}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/30 transition"
                >
                  <Calendar className="h-4 w-4" />
                  Open Calendar
                </button>
              </div>

              {/* Recent Posts */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Posts</h2>
                
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : recentPosts.length > 0 ? (
                  <div className="space-y-3">
                    {recentPosts.slice(0, 5).map((post) => (
                      <div 
                        key={post.id}
                        className="rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs ${
                            post.status === 'posted' ? 'text-green-400' : 
                            post.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {post.status === 'posted' ? '✓ Posted' : 
                             post.status === 'failed' ? '✗ Failed' : 'Draft'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(post.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm py-4">No posts yet. Generate your first post!</p>
                )}
              </div>

              {/* Activity Log */}
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Activity Log
                </h2>
                
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <div className="rounded-full bg-gray-700 p-1.5">
                          {getActivityIcon(item.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300">{getActivityText(item)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(item.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Scheduling Tab */}
        {activeTab === 'scheduling' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Scheduling Calendar</h2>
                <p className="text-gray-400 mt-1">
                  Drag and drop posts to reschedule. View your content calendar at a glance.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate New Post
                  </>
                )}
              </button>
            </div>
            
            <SchedulingDashboard />
          </div>
        )}
      </main>
    </div>
  )
}
