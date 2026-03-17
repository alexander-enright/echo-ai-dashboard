'use client'

import { useState, useEffect } from 'react'

interface ScheduledQuote {
  id: string
  quote_text: string
  author: string
  scheduled_time: string
  created_at: string
  posted_to_x: boolean
  tweet_id?: string
}

export default function ScheduledQuotes() {
  const [quotes, setQuotes] = useState<ScheduledQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState<string | null>(null)
  const [autoPost, setAutoPost] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchQuotes()
    fetchAutoPostSetting()
  }, [])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/scheduledQuotes')
      const data = await res.json()
      if (data.quotes) {
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
  }

  const fetchAutoPostSetting = async () => {
    try {
      const res = await fetch('/api/automationSettings?setting=auto_post_quotes')
      const data = await res.json()
      setAutoPost(data.value || false)
    } catch (error) {
      console.error('Error fetching setting:', error)
    }
  }

  const toggleAutoPost = async () => {
    try {
      const newValue = !autoPost
      await fetch('/api/automationSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting: 'auto_post_quotes', value: newValue }),
      })
      setAutoPost(newValue)
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const postToX = async (quote: ScheduledQuote) => {
    setPosting(quote.id)
    setMessage('')
    try {
      const res = await fetch('/api/postScheduledQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_id: quote.id }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Posted to X successfully!')
        fetchQuotes()
      } else {
        setMessage(data.error || 'Failed to post')
      }
    } catch (error) {
      setMessage('Error posting to X')
    }
    setPosting(null)
  }

  const generateNow = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generateScheduledQuote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_time: 'manual' }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Quote generated!')
        fetchQuotes()
      } else {
        setMessage(data.error || 'Failed to generate')
      }
    } catch (error) {
      setMessage('Error generating quote')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Scheduled Quotes</h2>
        <button
          onClick={generateNow}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Now'}
        </button>
      </div>

      {/* Auto Post Toggle */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-700 p-3">
        <span className="text-sm text-gray-300">Auto Post Quotes</span>
        <button
          onClick={toggleAutoPost}
          className={`relative h-6 w-11 rounded-full transition ${
            autoPost ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
              autoPost ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <div className="space-y-3">
        {quotes.length === 0 && (
          <p className="text-sm text-gray-500">No scheduled quotes yet.</p>
        )}
        {quotes.map((quote) => (
          <div key={quote.id} className="rounded-lg bg-gray-900 p-4">
            <blockquote className="mb-2 text-sm text-white">
              "{quote.quote_text}"
            </blockquote>
            <p className="mb-2 text-xs text-gray-400">— {quote.author}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <span>Scheduled: {quote.scheduled_time}</span>
                {quote.posted_to_x && (
                  <span className="ml-2 text-green-400">✓ Posted</span>
                )}
              </div>
              
              {!quote.posted_to_x && (
                <button
                  onClick={() => postToX(quote)}
                  disabled={posting === quote.id}
                  className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {posting === quote.id ? 'Posting...' : 'Post to X'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
