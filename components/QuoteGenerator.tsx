'use client'

import { useState } from 'react'

const topics = [
  { value: '', label: 'General' },
  { value: 'sports', label: 'Sports' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
]

interface Quote {
  text: string
  type: string
  author?: string
}

export default function QuoteGenerator() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [quoteCount, setQuoteCount] = useState(1)

  const generateQuotes = async (type: 'motivational' | 'famous' | 'mixed') => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, topic: selectedTopic, count: quoteCount }),
      })
      const data = await res.json()
      if (data.quotes) {
        setQuotes(data.quotes.map((q: any) => ({ text: q.quote, type: q.type, author: q.author })))
      } else if (data.quote) {
        setQuotes([{ text: data.quote, type: data.type, author: data.author }])
      }
    } catch (error) {
      setMessage('Failed to generate quotes')
    }
    setLoading(false)
  }

  const postToX = async (quote: Quote, index: number) => {
    setPosting(index.toString())
    setMessage('')
    try {
      const res = await fetch('/api/post-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: quote.text, type: quote.type }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Posted to X successfully!')
      } else {
        setMessage('Failed to post')
      }
    } catch (error) {
      setMessage('Error posting to X')
    }
    setPosting(null)
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

      <div className="mb-4">
        <label className="mb-2 block text-sm text-gray-400">Number of Quotes</label>
        <select
          value={quoteCount}
          onChange={(e) => setQuoteCount(Number(e.target.value))}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => generateQuotes('motivational')}
          disabled={loading}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : `Generate ${quoteCount} AI Quotes`}
        </button>
        <button
          onClick={() => generateQuotes('famous')}
          disabled={loading}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-600 disabled:opacity-50"
        >
          Generate {quoteCount} Famous
        </button>
        <button
          onClick={() => generateQuotes('mixed')}
          disabled={loading}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          Generate {quoteCount} Mixed
        </button>
      </div>

      {quotes.length > 0 && (
        <div className="space-y-3">
          {quotes.map((quote, index) => (
            <div key={index} className="rounded-lg bg-gray-900 p-4">
              <p className="text-sm text-white mb-2">{quote.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 capitalize">{quote.type}</span>
                <button
                  onClick={() => postToX(quote, index)}
                  disabled={posting === index.toString()}
                  className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {posting === index.toString() ? 'Posting...' : 'Post to X'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <p className={`mt-4 text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
