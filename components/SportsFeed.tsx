'use client'

import { useState } from 'react'
import { sportsAccounts, entrepreneurAccounts } from '@/lib/sports-accounts'

interface Tweet {
  id: string
  text: string
  author: string
  createdAt: string
}

export default function SportsFeed() {
  const [selectedAccount, setSelectedAccount] = useState('')
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null)
  const [generatedComment, setGeneratedComment] = useState('')
  const [generating, setGenerating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<'sports' | 'entrepreneur'>('sports')

  const accounts = mode === 'sports' ? sportsAccounts : entrepreneurAccounts

  const loadTweets = async () => {
    if (!selectedAccount) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`/api/fetch-tweets?handle=${selectedAccount}`)
      const data = await res.json()
      if (data.tweets) {
        setTweets(data.tweets)
      } else {
        setMessage('Failed to load tweets')
      }
    } catch (error) {
      setMessage('Error loading tweets')
    }
    setLoading(false)
  }

  const generateComment = async (tweet: Tweet) => {
    setSelectedTweet(tweet)
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.id }),
      })
      const data = await res.json()
      if (data.comment) {
        setGeneratedComment(data.comment)
      } else {
        setMessage('Failed to generate comment')
      }
    } catch (error) {
      setMessage('Error generating comment')
    }
    setGenerating(false)
  }

  const postComment = async () => {
    if (!selectedTweet || !generatedComment) return
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/comment-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: selectedTweet.id, comment: generatedComment }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Posted successfully!')
        setGeneratedComment('')
        setSelectedTweet(null)
      } else {
        setMessage(data.error || 'Failed to post')
      }
    } catch (error) {
      setMessage('Error posting')
    }
    setPosting(false)
  }

  const retweet = async (tweet: Tweet) => {
    setMessage('')
    try {
      const res = await fetch('/api/retweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.id }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`Retweeted! (${data.actions.join(', ')})`)
      } else {
        setMessage(`Failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message || 'Failed to retweet'}`)
    }
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Sports & Business Feed</h2>
      
      {/* Mode Toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setMode('sports'); setSelectedAccount(''); setTweets([]) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === 'sports' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Sports
        </button>
        <button
          onClick={() => { setMode('entrepreneur'); setSelectedAccount(''); setTweets([]) }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === 'entrepreneur' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Business
        </button>
      </div>

      {/* Account Selector */}
      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-400">Select Account</label>
        <select
          value={selectedAccount}
          onChange={(e) => { setSelectedAccount(e.target.value); setTweets([]) }}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Choose an account...</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.handle}>
              {account.name} (@{account.handle})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={loadTweets}
        disabled={!selectedAccount || loading}
        className="mb-4 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Recent Tweets'}
      </button>

      {/* Tweets List */}
      {tweets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400">Recent Tweets</h3>
          {tweets.map((tweet) => (
            <div key={tweet.id} className="rounded-lg bg-gray-900 p-3">
              <p className="text-sm text-white line-clamp-3">{tweet.text}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => generateComment(tweet)}
                  disabled={generating}
                  className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Generate Comment
                </button>
                <button
                  onClick={() => retweet(tweet)}
                  className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                >
                  Retweet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Preview */}
      {selectedTweet && (
        <div className="mt-4 rounded-lg bg-gray-700 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-300">Generated Comment</h4>
          <p className="mb-3 text-sm text-white">{generatedComment || 'Click Generate Comment above...'}</p>
          {generatedComment && (
            <button
              onClick={postComment}
              disabled={posting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-4 text-sm ${message.includes('success') || message.includes('Retweeted') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
