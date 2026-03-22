'use client'

import { useState, useEffect } from 'react'
import { Calendar, List, Clock, Edit2, Trash2, Copy, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

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

type ViewMode = 'calendar' | 'list'
type FilterStatus = 'all' | 'scheduled' | 'published' | 'failed'

export default function SchedulingDashboard() {
  const [quotes, setQuotes] = useState<ScheduledQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [editingQuote, setEditingQuote] = useState<ScheduledQuote | null>(null)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotes()
  }, [filterStatus])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/scheduledQuotes')
      const data = await res.json()
      if (data.quotes) {
        // Add status field based on posted_to_x
        const quotesWithStatus = data.quotes.map((q: ScheduledQuote) => ({
          ...q,
          status: q.posted_to_x ? 'published' : 'scheduled'
        }))
        setQuotes(quotesWithStatus)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scheduledQuotes?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setQuotes(quotes.filter(q => q.id !== id))
        setMessage('Quote deleted successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      setMessage('Failed to delete quote')
    }
    setShowDeleteConfirm(null)
  }

  const handleDuplicate = async (quote: ScheduledQuote) => {
    try {
      const res = await fetch('/api/scheduledQuotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_text: quote.quote_text,
          author: quote.author,
          category: quote.category,
          scheduled_time: quote.scheduled_time
        }),
      })
      if (res.ok) {
        fetchQuotes()
        setMessage('Quote duplicated successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error duplicating quote:', error)
      setMessage('Failed to duplicate quote')
    }
  }

  const handleReschedule = async (quote: ScheduledQuote, newDate: string) => {
    try {
      const res = await fetch('/api/scheduledQuotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, scheduled_time: newDate }),
      })
      if (res.ok) {
        fetchQuotes()
        setEditingQuote(null)
        setMessage('Quote rescheduled successfully')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error rescheduling quote:', error)
      setMessage('Failed to reschedule quote')
    }
  }

  // Filter quotes based on status
  const filteredQuotes = quotes.filter(q => {
    if (filterStatus === 'all') return true
    return q.status === filterStatus
  })

  // Get quotes for selected month in calendar view
  const getQuotesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredQuotes.filter(q => {
      const quoteDate = new Date(q.scheduled_time).toISOString().split('T')[0]
      return quoteDate === dateStr
    })
  }

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  const days = generateCalendarDays()
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Scheduled Posts</h2>
          <p className="text-sm text-gray-400 mt-1">
            {filteredQuotes.length} posts • {filteredQuotes.filter(q => q.status === 'scheduled').length} upcoming
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'scheduled', 'published', 'failed'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filterStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${
          message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="space-y-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-24 bg-gray-900/30 rounded-lg" />
                  }
                  
                  const dayQuotes = getQuotesForDate(day)
                  const isToday = new Date().toDateString() === day.toDateString()
                  const hasScheduled = dayQuotes.some(q => q.status === 'scheduled')
                  const hasPublished = dayQuotes.some(q => q.status === 'published')
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 rounded-lg border p-1 transition ${
                        isToday
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-indigo-400' : 'text-gray-400'
                        }`}>
                          {day.getDate()}
                        </span>
                        {(hasScheduled || hasPublished) && (
                          <div className="flex gap-0.5">
                            {hasScheduled && (
                              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                            )}
                            {hasPublished && (
                              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 space-y-1 overflow-hidden">
                        {dayQuotes.slice(0, 2).map((quote) => (
                          <div
                            key={quote.id}
                            className={`text-xs truncate rounded px-1.5 py-0.5 ${
                              quote.status === 'published'
                                ? 'bg-green-500/20 text-green-300'
                                : quote.status === 'failed'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                            title={`"${quote.quote_text.slice(0, 50)}..." — ${quote.author}`}
                          >
                            "{quote.quote_text.slice(0, 20)}..."
                          </div>
                        ))}
                        {dayQuotes.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayQuotes.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Published</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <span>Failed</span>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredQuotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mb-3 opacity-50" />
                  <p>No scheduled posts found</p>
                  <p className="text-sm mt-1">Create a new quote from the generator</p>
                </div>
              ) : (
                filteredQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="group rounded-lg border border-gray-700 bg-gray-900/50 p-4 hover:bg-gray-900 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(quote.status || 'scheduled')}`}>
                            {getStatusIcon(quote.status || 'scheduled')}
                            {(quote.status || 'scheduled').charAt(0).toUpperCase() + (quote.status || 'scheduled').slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(quote.scheduled_time)}
                          </span>
                        </div>
                        
                        <blockquote className="text-sm text-white mb-1">
                          "{quote.quote_text}"
                        </blockquote>
                        <p className="text-xs text-gray-400">— {quote.author}</p>
                        
                        {quote.tweet_id && (
                          <p className="text-xs text-gray-500 mt-2">
                            Tweet ID: {quote.tweet_id}
                          </p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {quote.status !== 'published' && (
                          <button
                            onClick={() => setEditingQuote(quote)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                            title="Reschedule"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(quote)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(quote.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Reschedule Post</h3>
            <div className="mb-4">
              <blockquote className="text-sm text-white mb-2 italic">
                "{editingQuote.quote_text}"
              </blockquote>
              <p className="text-xs text-gray-400">— {editingQuote.author}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">New Schedule Time</label>
              <input
                type="datetime-local"
                defaultValue={editingQuote.scheduled_time.slice(0, 16)}
                onChange={(e) => {
                  const newDate = new Date(e.target.value).toISOString()
                  handleReschedule(editingQuote, newDate)
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingQuote(null)}
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