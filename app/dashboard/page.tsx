'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  Plus, 
  Image as ImageIcon, 
  Smile, 
  Clock,
  MoreHorizontal,
  ChevronDown,
  Twitter,
  Send,
  Save,
  X,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  Repeat2,
  BarChart2,
  Filter,
  Grid3X3,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Copy,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import { XAccountConnection } from './components/XAccountConnection'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Types
interface Post {
  id: string
  content: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledFor?: Date
  platform: 'twitter' | 'linkedin'
  account: string
  engagement?: {
    likes: number
    retweets: number
    replies: number
    impressions: number
  }
}

interface ConnectedAccount {
  id: string
  platform: 'twitter' | 'linkedin'
  handle: string
  avatar?: string
  isActive: boolean
  followerCount: number
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Just shipped a new feature! Building in public is the best way to stay accountable and get feedback early.',
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 3600000),
    platform: 'twitter',
    account: '@alexenright',
  },
  {
    id: '2',
    content: '6 companies running on autopilot. The power of aggressive automation What are you building?',
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 7200000),
    platform: 'twitter',
    account: '@alexenright',
  },
  {
    id: '3',
    content: 'Just published a new article on my process for building products quickly. Link in bio!',
    status: 'published',
    scheduledFor: new Date(Date.now() - 86400000),
    platform: 'linkedin',
    account: 'Alex Enright',
    engagement: { likes: 47, retweets: 12, replies: 8, impressions: 2340 }
  },
  {
    id: '4',
    content: 'The overnight changelog: what your agent should build instead of posting',
    status: 'published',
    scheduledFor: new Date(Date.now() - 172800000),
    platform: 'twitter',
    account: '@alexenright',
    engagement: { likes: 89, retweets: 34, replies: 23, impressions: 5600 }
  }
]

const connectedAccounts: ConnectedAccount[] = [
  { id: '1', platform: 'twitter', handle: '@alexenright', isActive: true, followerCount: 2847 },
  { id: '2', platform: 'linkedin', handle: 'Alex Enright', isActive: false, followerCount: 1523 },
]

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

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Draggable Post Card Component
function DraggablePost({ post, isCompact = false }: { post: Post; isCompact?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post },
    disabled: post.status === 'published',
  })

  if (post.status === 'published') {
    return (
      <div
        className={`text-xs truncate rounded px-1.5 py-0.5 bg-green-500/20 text-green-300 cursor-default ${isCompact ? '' : 'mb-1'}`}
        title={`${post.content.slice(0, 50)}...`}
      >
        "{post.content.slice(0, isCompact ? 15 : 30)}..."
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`text-xs truncate rounded px-1.5 py-0.5 cursor-move transition-all ${isCompact ? '' : 'mb-1'} ${
        isDragging
          ? 'bg-indigo-500/30 text-indigo-300 ring-2 ring-indigo-500/50'
          : post.status === 'failed'
          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
          : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
      }`}
      title={`${post.content.slice(0, 50)}...`}
    >
      <span className="flex items-center gap-1">
        <GripVertical className="h-3 w-3 flex-shrink-0" />
        "{post.content.slice(0, isCompact ? 12 : 25)}..."
      </span>
    </div>
  )
}

// Droppable Day Component
function DroppableDay({
  id,
  day,
  isToday,
  dayPosts,
}: {
  id: string
  day: Date
  isToday: boolean
  dayPosts: Post[]
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { day },
  })

  const hasScheduled = dayPosts.some(q => q.status === 'scheduled')
  const hasPublished = dayPosts.some(q => q.status === 'published')

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] border-r border-b border-gray-800 p-2 transition-all cursor-pointer ${
        isToday
          ? 'bg-blue-500/10 border-blue-500/50'
          : isOver
          ? 'bg-indigo-500/20 ring-2 ring-indigo-500/30'
          : 'hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-400'}`}>
          {day.getDate()}
        </span>
        {(hasScheduled || hasPublished) && (
          <div className="flex gap-0.5">
            {hasScheduled && <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
            {hasPublished && <div className="h-1.5 w-1.5 rounded-full bg-green-400" />}
          </div>
        )}
      </div>
      <div className="space-y-1 overflow-hidden">
        {dayPosts.slice(0, 3).map((post) => (
          <DraggablePost key={post.id} post={post} isCompact />
        ))}
        {dayPosts.length > 3 && (
          <div className="text-xs text-gray-500 px-1">+{dayPosts.length - 3} more</div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'calendar' | 'analytics' | 'settings'>('queue')
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [showComposer, setShowComposer] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string>('1')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const scheduledPosts = posts.filter(p => p.status === 'scheduled')
  const publishedPosts = posts.filter(p => p.status === 'published')
  const draftPosts = posts.filter(p => p.status === 'draft')

  const characterCount = composerText.length
  const maxCharacters = 280

  const handleSchedulePost = () => {
    if (!composerText.trim()) return
    
    const newPost: Post = {
      id: Date.now().toString(),
      content: composerText,
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 3600000),
      platform: 'twitter',
      account: '@alexenright'
    }
    
    setPosts([newPost, ...posts])
    setComposerText('')
    setShowComposer(false)
    setMessage('Post scheduled successfully')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id))
    setShowDeleteConfirm(null)
    setMessage('Post deleted')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDuplicate = (post: Post) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 3600000),
    }
    setPosts([newPost, ...posts])
    setMessage('Post duplicated')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleReschedule = (post: Post, newDate: Date) => {
    setPosts(posts.map(p => 
      p.id === post.id ? { ...p, scheduledFor: newDate } : p
    ))
    setEditingPost(null)
    setMessage('Post rescheduled')
    setTimeout(() => setMessage(''), 3000)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (direction === 'next' ? 1 : -1), 1))
  }

  const getPostsForDate = (date: Date) => {
    const dateStr = getDateKey(date)
    return posts.filter(p => {
      if (!p.scheduledFor) return false
      return getDateKey(p.scheduledFor) === dateStr
    })
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days: (Date | null)[] = []
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveDragId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const activePost = posts.find(p => p.id === active.id)
      const overId = over.id as string
      
      if (activePost && overId.startsWith('day-')) {
        const dateStr = overId.replace('day-', '')
        const newDate = new Date(dateStr)
        newDate.setHours(9, 0, 0, 0)
        handleReschedule(activePost, newDate)
      }
    }
    
    setActiveDragId(null)
  }

  const days = generateCalendarDays()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-400" />
      default: return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Echo</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('queue')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'queue' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Queue
            {scheduledPosts.length > 0 && (
              <span className="ml-auto bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                {scheduledPosts.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Calendar
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        {/* Connected Accounts */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">X Account</h3>
          <XAccountConnection />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {activeTab === 'queue' && 'Publishing Queue'}
              {activeTab === 'calendar' && 'Content Calendar'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          
          <button 
            onClick={() => setShowComposer(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </header>

        {message && (
          <div className={`mx-8 mt-4 rounded-lg p-3 text-sm ${
            message.includes('success') || message.includes('scheduled') || message.includes('duplicated') || message.includes('rescheduled') || message.includes('deleted')
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Scheduled</span>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{scheduledPosts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">posts in queue</p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Published</span>
                    <Send className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{publishedPosts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">this month</p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Drafts</span>
                    <Save className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold">{draftPosts.length}</p>
                  <p className="text-xs text-gray-500 mt-1">saved</p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Engagement</span>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">4.2%</p>
                  <p className="text-xs text-gray-500 mt-1">avg rate</p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Your Posts</h2>
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    Calendar
                  </button>
                </div>
              </div>

              {/* Posts List View */}
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800 border-dashed">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">No posts yet</h3>
                      <p className="text-gray-500 mb-6">Create your first post to get started</p>
                      <button 
                        onClick={() => setShowComposer(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Create Post
                      </button>
                    </div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="group bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                                post.platform === 'twitter' ? 'bg-black' : 'bg-blue-700'
                              }`}>
                                {post.platform === 'twitter' ? '𝕏' : 'in'}
                              </div>
                              <span className="text-sm text-gray-400">{post.account}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                                {getStatusIcon(post.status)}
                                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                              </span>
                            </div>
                            
                            <p className="text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              {post.scheduledFor && (
                                <span className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {post.scheduledFor.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                              
                              {post.engagement && (
                                <>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {post.engagement.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Repeat2 className="w-4 h-4" />
                                    {post.engagement.retweets}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {post.engagement.replies}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BarChart2 className="w-4 h-4" />
                                    {post.engagement.impressions.toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {post.status !== 'published' && (
                              <button
                                onClick={() => setEditingPost(post)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                title="Reschedule"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDuplicate(post)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(post.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Calendar Grid View */
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-lg font-semibold">
                        {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                      </h2>
                      <button 
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setCurrentMonth(new Date())}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Today
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 border-b border-gray-800">
                    {weekDays.map(day => (
                      <div key={day} className="px-4 py-3 text-sm font-medium text-gray-500 text-center border-r border-gray-800 last:border-r-0">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-gray-800 bg-gray-900/50" />
                      }
                      
                      const dayPosts = getPostsForDate(day)
                      const isToday = new Date().toDateString() === day.toDateString()
                      const droppableId = `day-${getDateKey(day)}`
                      
                      return (
                        <DroppableDay
                          key={day.toISOString()}
                          id={droppableId}
                          day={day}
                          isToday={isToday}
                          dayPosts={dayPosts}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div className="p-8">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold">
                      {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button 
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentMonth(new Date())}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* Calendar */}
                <div className="grid grid-cols-7 border-b border-gray-800">
                  {weekDays.map(day => (
                    <div key={day} className="px-4 py-3 text-sm font-medium text-gray-500 text-center border-r border-gray-800 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="min-h-[140px] border-r border-b border-gray-800 bg-gray-900/50" />
                    }
                    
                    const dayPosts = getPostsForDate(day)
                    const isToday = new Date().toDateString() === day.toDateString()
                    const droppableId = `day-${getDateKey(day)}`
                    
                    return (
                      <DroppableDay
                        key={day.toISOString()}
                        id={droppableId}
                        day={day}
                        isToday={isToday}
                        dayPosts={dayPosts}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span>Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <span>Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-500" />
                  <span>Drag to reschedule</span>
                </div>
              </div>
            </div>
          )}
        </DndContext>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-gray-400">Followers</span>
                </div>
                <p className="text-3xl font-bold">2,847</p>
                <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% this month
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-gray-400">Engagement</span>
                </div>
                <p className="text-3xl font-bold">4.2%</p>
                <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +0.8% vs last month
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-400">Posts</span>
                </div>
                <p className="text-3xl font-bold">48</p>
                <p className="text-sm text-gray-500 mt-1">this month</p>
              </div>
              
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="text-gray-400">Impressions</span>
                </div>
                <p className="text-3xl font-bold">45.2K</p>
                <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +28% this month
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-6">Top Performing Posts</h3>
                <div className="space-y-4">
                  {publishedPosts.slice(0, 3).map((post, i) => (
                    <div key={post.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
                      <span className="text-2xl font-bold text-gray-600">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.engagement?.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Repeat2 className="w-3 h-3" />
                            {post.engagement?.retweets}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart2 className="w-3 h-3" />
                            {post.engagement?.impressions?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-6">Engagement Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Likes</span>
                      <span className="text-white font-medium">2,847</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Retweets</span>
                      <span className="text-white font-medium">892</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Replies</span>
                      <span className="text-white font-medium">456</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Impressions</span>
                      <span className="text-white font-medium">45.2K</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
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
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Default Posting Schedule</h3>
                <p className="text-gray-400 text-sm mb-4">Set your preferred times for auto-scheduling</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weekday</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>9:00 AM</option>
                      <option>12:00 PM</option>
                      <option>3:00 PM</option>
                      <option>6:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Weekend</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>10:00 AM</option>
                      <option>1:00 PM</option>
                      <option>4:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-3">
                  {[
                    'Email me when posts are published',
                    'Email me weekly analytics summary',
                    'Notify me of posting failures',
                    'Send optimal time suggestions',
                  ].map((setting, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500" />
                      <span className="text-gray-300">{setting}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Zone */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold mb-4">Time Zone</h3>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Pacific Time (US & Canada)</option>
                  <option>Mountain Time (US & Canada)</option>
                  <option>Central Time (US & Canada)</option>
                  <option>Eastern Time (US & Canada)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold">Create Post</h2>
              <button onClick={() => setShowComposer(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Account Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Post to</label>
                <div className="flex gap-3">
                  {connectedAccounts.filter(a => a.isActive).map(account => (
                    <button
                      key={account.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                        selectedAccount === account.id
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedAccount(account.id)}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${
                        account.platform === 'twitter' ? 'bg-black' : 'bg-blue-700'
                      }`}>
                        {account.platform === 'twitter' ? '𝕏' : 'in'}
                      </div>
                      {account.handle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              {/* Toolbar */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-400' : 'text-gray-500'}`}>
                  {characterCount}/{maxCharacters}
                </span>
              </div>

              {/* Scheduling */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-300">Schedule</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="time"
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
              <button 
                onClick={() => setShowComposer(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSchedulePost}
                disabled={!composerText.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Reschedule Post</h3>
            <div className="mb-4">
              <p className="text-sm text-white mb-2 italic line-clamp-3">
                "{editingPost.content}"
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">New Schedule Time</label>
              <input
                type="datetime-local"
                defaultValue={editingPost.scheduledFor?.toISOString().slice(0, 16) || ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value)
                  handleReschedule(editingPost, newDate)
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPost(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-500/20 p-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete Post?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone. The scheduled post will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
