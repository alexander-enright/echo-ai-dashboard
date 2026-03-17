'use client'

import { useState } from 'react'

const categories = [
  { id: 'business', label: 'Business', color: 'bg-blue-600' },
  { id: 'sports', label: 'Sports', color: 'bg-green-600' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', color: 'bg-purple-600' },
]

export default function TargetedRetweet() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['business', 'sports', 'entrepreneurship'])
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any>(null)

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const runTargetedRetweet = async () => {
    if (selectedCategories.length === 0) {
      setMessage('Please select at least one category')
      return
    }

    setRunning(true)
    setMessage('')
    setResults(null)
    
    try {
      const res = await fetch('/api/targetedRetweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          categories: selectedCategories,
          scheduled_run_time: 'manual'
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        setResults(data)
        setMessage(`Checked ${data.accounts_checked} accounts, retweeted ${data.retweeted} tweets`)
      } else {
        setMessage(data.error || 'Failed to run targeted retweet')
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    }
    
    setRunning(false)
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-white">Targeted Retweet</h2>
      <p className="mb-4 text-sm text-gray-400">
        Retweet from major accounts in selected categories
      </p>

      {/* Category Selection */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategories.includes(cat.id)
                ? cat.color + ' text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {selectedCategories.includes(cat.id) ? '✓ ' : ''}{cat.label}
          </button>
        ))}
      </div>

      {/* Run Button */}
      <button
        onClick={runTargetedRetweet}
        disabled={running || selectedCategories.length === 0}
        className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {running ? 'Running...' : 'Run Targeted Retweet'}
      </button>

      {message && (
        <p className={`mt-4 text-sm ${message.includes('retweeted') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      {/* Results */}
      {results && results.retweeted_tweets && results.retweeted_tweets.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Retweeted:</h3>
          {results.retweeted_tweets.map((tweet: any, index: number) => (
            <div key={index} className="rounded bg-gray-900 p-3 text-sm">
              <p className="text-white line-clamp-2">{tweet.text}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                <span className="text-blue-400">@{tweet.author}</span>
                <span>•</span>
                <span>{tweet.likes} likes</span>
                <span>•</span>
                <span>{tweet.retweets} retweets</span>
                <span className={`ml-auto ${tweet.actually_retweeted ? 'text-green-400' : 'text-yellow-400'}`}>
                  {tweet.actually_retweeted ? '✓ Retweeted' : 'Saved (auto off)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
