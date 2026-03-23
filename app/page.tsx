'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Share2, 
  BarChart3, 
  Clock, 
  Plus, 
  Send,
  Image as ImageIcon,
  Video,
  Smile,
  MoreVertical,
  Check,
  X,
  LayoutGrid,
  List,
  Settings,
  Users,
  Link as LinkIcon
} from 'lucide-react'

// Platform types
interface Platform {
  id: string
  name: string
  icon: string
  color: string
  connected: boolean
  handle?: string
}

// Post types
interface Post {
  id: string
  content: string
  platforms: string[]
  scheduledFor: Date | null
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  media?: string[]
  analytics?: {
    impressions: number
    engagements: number
    clicks: number
  }
}

// Time slot suggestions
const optimalTimes = [
  { day: 'Monday', times: ['9:00 AM', '1:00 PM', '3:00 PM'] },
  { day: 'Tuesday', times: ['10:00 AM', '2:00 PM', '7:00 PM'] },
  { day: 'Wednesday', times: ['9:00 AM', '12:00 PM', '5:00 PM'] },
  { day: 'Thursday', times: ['10:00 AM', '1:00 PM', '4:00 PM'] },
  { day: 'Friday', times: ['9:00 AM', '11:00 AM', '3:00 PM'] },
  { day: 'Saturday', times: ['10:00 AM', '12:00 PM', '2:00 PM'] },
  { day: 'Sunday', times: ['11:00 AM', '2:00 PM', '4:00 PM'] },
]

const platforms: Platform[] = [
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏', color: 'bg-black', connected: true, handle: '@alexenright' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'bg-blue-700', connected: true, handle: 'Alex Enright' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500', connected: false },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: 'bg-blue-600', connected: false },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black', connected: false },
]

export default function EchoDashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'calendar' | 'analytics' | 'settings'>('queue')
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Just shipped a new feature! 🚀 Building in public is the best way to stay accountable.',
      platforms: ['twitter', 'linkedin'],
      scheduledFor: new Date(Date.now() + 3600000),
      status: 'scheduled',
    },
    {
      id: '2',
      content: '6 companies running on autopilot. The power of aggressive automation ⚡',
      platforms: ['twitter'],
      scheduledFor: new Date(Date.now() + 7200000),
      status: 'scheduled',
    },
  ])
  const [newPost, setNewPost] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter'])
  const [showComposer, setShowComposer] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const schedulePost = () => {
    if (!newPost.trim()) return
    
    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      platforms: selectedPlatforms,
      scheduledFor: scheduledDate && scheduledTime 
        ? new Date(`${scheduledDate}T${scheduledTime}`)
        : null,
      status: scheduledDate && scheduledTime ? 'scheduled' : 'draft',
    }
    
    setPosts(prev => [post, ...prev])
    setNewPost('')
    setShowComposer(false)
    setScheduledDate('')
    setScheduledTime('')
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.icon || '?'
  }

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.color || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              E
            </div>
            <span className="text-xl font-bold text-gray-900">Echo</span>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'queue' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
              Publishing Queue
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Content Calendar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </nav>
        </div>
        
        {/* Connected Accounts */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Connected Accounts</h3>
          <div className="space-y-3">
            {platforms.filter(p => p.connected).map(platform => (
              <div key={platform.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{platform.name}</p>
                  <p className="text-xs text-gray-500 truncate">{platform.handle}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'queue' && 'Publishing Queue'}
                {activeTab === 'calendar' && 'Content Calendar'}
                {activeTab === 'analytics' && 'Analytics Dashboard'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === 'queue' && 'Manage your scheduled and draft posts'}
                {activeTab === 'calendar' && 'Visualize your content schedule'}
                {activeTab === 'analytics' && 'Track performance across all platforms'}
                {activeTab === 'settings' && 'Configure your preferences and accounts'}
              </p>
            </div>
            <button 
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </header>

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <StatCard 
                label="Scheduled" 
                value={posts.filter(p => p.status === 'scheduled').length.toString()} 
                icon={<Clock className="w-5 h-5" />}
                color="blue"
              />
              <StatCard 
                label="Drafts" 
                value={posts.filter(p => p.status === 'draft').length.toString()} 
                icon={<LayoutGrid className="w-5 h-5" />}
                color="gray"
              />
              <StatCard 
                label="Published (7d)" 
                value="12" 
                icon={<Send className="w-5 h-5" />}
                color="green"
              />
              <StatCard 
                label="Engagement" 
                value="4.2%" 
                icon={<BarChart3 className="w-5 h-5" />}
                color="purple"
              />
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-6">Create your first post to get started</p>
                  <button 
                    onClick={() => setShowComposer(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {post.platforms.map(platformId => (
                            <div key={platformId} className={`w-8 h-8 ${getPlatformColor(platformId)} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                              {getPlatformIcon(platformId)}
                            </div>
                          ))}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            post.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            post.status === 'published' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed mb-4">{post.content}</p>
                        {post.scheduledFor && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            Scheduled for {post.scheduledFor.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="p-8">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-semibold">March 2026</h2>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Month</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Week</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Day</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="px-4 py-3 text-sm font-semibold text-gray-600 text-center bg-gray-50">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
                  const hasPost = [5, 12, 15, 18, 22, 25].includes(date)
                  return (
                    <div key={date} className="min-h-[120px] border-b border-r border-gray-100 p-2 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{date}</span>
                        {date === 22 && <span className="text-xs text-blue-600 font-medium">Today</span>}
                      </div>
                      {hasPost && (
                        <div className="space-y-1">
                          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            9:00 AM Post
                          </div>
                          {date === 22 && (
                            <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              2:00 PM Post
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Optimal Times */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Suggested Posting Times
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {optimalTimes.slice(0, 3).map(({ day, times }) => (
                  <div key={day} className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900 mb-2">{day}</p>
                    <div className="flex flex-wrap gap-2">
                      {times.map(time => (
                        <span key={time} className="px-2 py-1 bg-white rounded text-sm text-gray-600 border border-gray-200">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <AnalyticsCard label="Total Posts" value="156" change="+12%" positive />
              <AnalyticsCard label="Total Impressions" value="45.2K" change="+28%" positive />
              <AnalyticsCard label="Engagements" value="3,847" change="+15%" positive />
              <AnalyticsCard label="Click-through Rate" value="4.2%" change="-0.8%" positive={false} />
            </div>

            {/* Platform Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Platform</h3>
                <div className="space-y-4">
                  {platforms.filter(p => p.connected).map(platform => (
                    <div key={platform.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                            {platform.icon}
                          </div>
                          <span className="font-medium text-gray-900">{platform.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">4.8% engagement</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Posts</h3>
                <div className="space-y-4">
                  {[
                    { content: '6 companies running on autopilot...', engagement: '2.4K', platform: 'twitter' },
                    { content: 'Just shipped a new feature! 🚀', engagement: '1.8K', platform: 'linkedin' },
                    { content: 'Building in public update...', engagement: '1.2K', platform: 'twitter' },
                  ].map((post, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-6 h-6 ${getPlatformColor(post.platform)} rounded flex items-center justify-center text-white text-xs font-bold`}>
                        {getPlatformIcon(post.platform)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{post.engagement} engagements</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="p-8 max-w-3xl">
            <div className="space-y-6">
              {/* Posting Schedule */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Posting Schedule</h3>
                <p className="text-gray-600 mb-4">Set your preferred times for auto-scheduling</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekday</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl">
                      <option>9:00 AM</option>
                      <option>12:00 PM</option>
                      <option>3:00 PM</option>
                      <option>6:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekend</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl">
                      <option>10:00 AM</option>
                      <option>1:00 PM</option>
                      <option>4:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  {[
                    'Email me when posts are published',
                    'Email me weekly analytics summary',
                    'Notify me of posting failures',
                    'Send optimal time suggestions',
                  ].map((setting, i) => (
                    <label key={i} className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                      <span className="text-gray-700">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Zone */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Zone</h3>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-xl">
                  <option>Pacific Time (US & Canada)</option>
                  <option>Mountain Time (US & Canada)</option>
                  <option>Central Time (US & Canada)</option>
                  <option>Eastern Time (US & Canada)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
                <button onClick={() => setShowComposer(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms</label>
                <div className="flex flex-wrap gap-3">
                  {platforms.filter(p => p.connected).map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        selectedPlatforms.includes(platform.id)
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-6 h-6 ${platform.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                        {platform.icon}
                      </div>
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="mb-6">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <span className={`text-sm ${newPost.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                    {newPost.length}/280
                  </span>
                </div>
              </div>

              {/* Scheduling */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Schedule (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!scheduledDate && !scheduledTime && (
                  <p className="text-sm text-gray-500 mt-2">Leave empty to save as draft</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {selectedPlatforms.length} platforms selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowComposer(false)}
                    className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={schedulePost}
                    disabled={!newPost.trim() || selectedPlatforms.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors"
                  >
                    {scheduledDate && scheduledTime ? 'Schedule Post' : 'Save as Draft'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  
  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function AnalyticsCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <div className={`flex items-center gap-1 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{positive ? '↑' : '↓'}</span>
        <span>{change} vs last month</span>
      </div>
    </div>
  )
}
