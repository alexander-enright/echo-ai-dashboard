'use client'

import { useState } from 'react'

export default function RetweetTool() {
  const [tweetUrl, setTweetUrl] = useState('')
  const [includeComment, setIncludeComment] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [actions, setActions] = useState<string[]>([])

  const handleRetweet = async () => {
    if (!tweetUrl) {
      setMessage('Please enter a tweet URL')
      return
    }
    setLoading(true)
    setMessage('')
    setActions([])
    try {
      const res = await fetch('/api/retweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl, includeComment }),
      })
      const data = await res.json()
      if (data.success) {
        setActions(data.actions)
        setMessage(`Successfully ${data.actions.join(', ')}!`)
        setTweetUrl('')
      } else {
        setMessage(data.error || 'Failed to complete actions')
      }
    } catch (error) {
      setMessage('Error processing request')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Retweet Tool</h2>
      
      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-400">Tweet URL</label>
        <input
          type="text"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          placeholder="https://x.com/username/status/1234567890"
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="includeComment"
          checked={includeComment}
          onChange={(e) => setIncludeComment(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
        />
        <label htmlFor="includeComment" className="text-sm text-gray-300">
          Include engagement comment
        </label>
      </div>

      <button
        onClick={handleRetweet}
        disabled={loading}
        className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Like & Retweet'}
      </button>

      {actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <span
              key={action}
              className="rounded-full bg-green-900/50 px-3 py-1 text-xs font-medium capitalize text-green-400"
            >
              ✓ {action}
            </span>
          ))}
        </div>
      )}

      {message && (
        <p className={`mt-4 text-sm ${message.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
