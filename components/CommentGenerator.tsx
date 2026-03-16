'use client'

import { useState } from 'react'

export default function CommentGenerator() {
  const [tweetInput, setTweetInput] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')

  // Extract tweet ID from URL or use direct ID
  const extractTweetId = (input: string): string | null => {
    // If it's just numbers, use it directly
    if (/^\d+$/.test(input.trim())) {
      return input.trim()
    }
    // Try to extract from URL
    const match = input.match(/status\/(\d+)/)
    return match ? match[1] : null
  }

  const generateComment = async () => {
    const tweetId = extractTweetId(tweetInput)
    if (!tweetId) {
      setMessage('Please enter a tweet URL or Tweet ID')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId }),
      })
      const data = await res.json()
      if (data.comment) {
        setComment(data.comment)
      } else {
        setMessage(data.error || 'Failed to generate comment')
      }
    } catch (error) {
      setMessage('Error generating comment')
    }
    setLoading(false)
  }

  const postComment = async () => {
    const tweetId = extractTweetId(tweetInput)
    if (!tweetId || !comment) return
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/comment-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId, comment }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Comment posted successfully!')
        setTweetInput('')
        setComment('')
      } else {
        setMessage(data.error || 'Failed to post comment')
      }
    } catch (error) {
      setMessage('Error posting comment')
    }
    setPosting(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Comment Generator</h2>
      
      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-400">Tweet ID or URL</label>
        <input
          type="text"
          value={tweetInput}
          onChange={(e) => setTweetInput(e.target.value)}
          placeholder="1234567890 or https://x.com/user/status/1234567890"
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <p className="mt-1 text-xs text-gray-500">Enter just the Tweet ID (numbers) or full URL</p>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="AI generated comment will appear here..."
        className="mb-4 h-32 w-full resize-none rounded-lg bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
        <span>{comment.length}/280</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={generateComment}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Comment'}
        </button>
        {comment && (
          <button
            onClick={postComment}
            disabled={posting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Comment on Post'}
          </button>
        )}
      </div>

      {message && (
        <p className={`mt-4 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
