'use client'

import { useState } from 'react'

export default function CommentGenerator() {
  const [tweetUrl, setTweetUrl] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')

  const generateComment = async () => {
    if (!tweetUrl) {
      setMessage('Please enter a tweet URL')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl }),
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
    if (!tweetUrl || !comment) return
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/comment-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl, comment }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Comment posted successfully!')
        setTweetUrl('')
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
        <label className="mb-2 block text-sm text-gray-400">X Post URL</label>
        <input
          type="text"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          placeholder="https://x.com/username/status/1234567890"
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
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
