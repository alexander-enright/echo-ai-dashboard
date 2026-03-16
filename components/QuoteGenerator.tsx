'use client'

import { useState } from 'react'

const topics = [
  { value: '', label: 'General' },
  { value: 'sports', label: 'Sports' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
]

export default function QuoteGenerator() {
  const [quote, setQuote] = useState('')
  const [quoteType, setQuoteType] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')

  const generateQuote = async (type: 'motivational' | 'famous') => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic: selectedTopic }),
      })
      const data = await res.json()
      if (data.quote) {
        setQuote(data.quote)
        setQuoteType(data.type)
      }
    } catch (error) {
      setMessage('Failed to generate quote')
    }
    setLoading(false)
  }

  const postToX = async () => {
    if (!quote) return
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/post-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: quote, type: quoteType }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Posted to X successfully!')
        setQuote('')
      } else {
        setMessage('Failed to post')
      }
    } catch (error) {
      setMessage('Error posting to X')
    }
    setPosting(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Quote Generator</h2>
      
      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-400">Topic</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <textarea
        value={quote}
        readOnly
        placeholder="Your generated quote will appear here..."
        className="mb-4 h-32 w-full resize-none rounded-lg bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
      />

      <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
        <span>{quote.length}/280</span>
        {quoteType && <span className="capitalize text-red-400">{quoteType}</span>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => generateQuote('motivational')}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Motivational'}
        </button>
        <button
          onClick={() => generateQuote('famous')}
          disabled={loading}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-600 disabled:opacity-50"
        >
          Generate Famous
        </button>
        {quote && (
          <button
            onClick={postToX}
            disabled={posting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {posting ? 'Posting...' : 'Post to X'}
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
