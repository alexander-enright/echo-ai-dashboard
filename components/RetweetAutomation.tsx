'use client'

import { useState, useEffect } from 'react'

interface RetweetHistory {
  id: string
  tweet_text: string
  author_username: string
  retweeted_at: string
  scheduled_run_time: string
  likes_count: number
  retweets_count: number
}

export default function RetweetAutomation() {
  const [retweets, setRetweets] = useState<RetweetHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [autoRetweet, setAutoRetweet] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRetweets()
    fetchAutoRetweetSetting()
  }, [])

  const fetchRetweets = async () => {
    try {
      const res = await fetch('/api/retweetHistory')
      const data = await res.json()
      if (data.retweets) {
        setRetweets(data.retweets)
      }
    } catch (error) {
      console.error('Error fetching retweets:', error)
    }
  }

  const fetchAutoRetweetSetting = async () => {
    try {
      const res = await fetch('/api/automationSettings?setting=enable_auto_retweets')
      if (!res.ok) {
        console.error('Failed to fetch setting:', res.status)
        return
      }
      const data = await res.json()
      console.log('Fetched auto_retweet setting:', data)
      setAutoRetweet(data.value || false)
    } catch (error) {
      console.error('Error fetching setting:', error)
    }
  }

  const toggleAutoRetweet = async () => {
    try {
      const newValue = !autoRetweet
      await fetch('/api/automationSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting: 'enable_auto_retweets', value: newValue }),
      })
      setAutoRetweet(newValue)
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }

  const runRetweetNow = async () => {
    setRunning(true)
    setMessage('')
    try {
      const res = await fetch('/api/runRetweetScheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_run_time: 'manual' }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`Processed ${data.processed} tweets, retweeted ${data.retweeted}`)
        fetchRetweets()
      } else {
        setMessage(data.error || 'Failed to run retweet scheduler')
      }
    } catch (error) {
      setMessage('Error running retweet scheduler')
    }
    setRunning(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Retweet Automation</h2>
        <button
          onClick={runRetweetNow}
          disabled={running}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {running ? 'Running...' : 'Run Retweet Now'}
        </button>
      </div>

      {/* Auto Retweet Toggle */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-700 p-3">
        <span className="text-sm text-gray-300">Enable Auto Retweets</span>
        <button
          onClick={toggleAutoRetweet}
          className={`relative h-6 w-11 rounded-full transition ${
            autoRetweet ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition ${
              autoRetweet ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${message.includes('retweeted') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <div className="space-y-3">
        {retweets.length === 0 && (
          <p className="text-sm text-gray-500">No retweets yet.</p>
        )}
        {retweets.slice(0, 10).map((retweet) => (
          <div key={retweet.id} className="rounded-lg bg-gray-900 p-4">
            <p className="mb-2 text-sm text-white line-clamp-2">{retweet.tweet_text}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div>
                <span className="text-red-400">@{retweet.author_username}</span>
                <span className="mx-2">•</span>
                <span>{retweet.likes_count} likes</span>
                <span className="mx-2">•</span>
                <span>{retweet.retweets_count} retweets</span>
              </div>
              <div>
                {new Date(retweet.retweeted_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
