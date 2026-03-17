'use client'

import { useState, useEffect } from 'react'

interface Stats {
  followers: {
    current: number
    gained: number
  }
  dailyPosts: number
  engagementRate: string
  totalInteractions: number
  weeklyActivity: {
    posts: number
    engagements: number
  }
  username: string
}

export default function GrowthStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (!data.error) {
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  if (loading && !stats) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-400">Loading stats...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Growth Stats</h2>
          {stats?.username && (
            <p className="text-sm text-gray-400">@{stats.username}</p>
          )}
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="rounded-lg bg-gray-700 px-3 py-1 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Followers Gained */}
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="mb-1 text-xs text-gray-400">Followers Gained (24h)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">+{formatNumber(stats?.followers?.gained || 0)}</span>
          </div>
          <p className="text-xs text-gray-500">
            {formatNumber(stats?.followers?.current || 0)} total
          </p>
        </div>

        {/* Daily Posts */}
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="mb-1 text-xs text-gray-400">Daily Posts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">{stats?.dailyPosts || 0}</span>
          </div>
          <p className="text-xs text-gray-500">
            {stats?.weeklyActivity?.posts || 0} this week
          </p>
        </div>

        {/* Engagement Rate */}
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="mb-1 text-xs text-gray-400">Engagement Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-400">{stats?.engagementRate || '0.00%'}</span>
          </div>
          <p className="text-xs text-gray-500">Interactions / Followers</p>
        </div>

        {/* Total Interactions */}
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="mb-1 text-xs text-gray-400">Total Interactions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-400">{formatNumber(stats?.totalInteractions || 0)}</span>
          </div>
          <p className="text-xs text-gray-500">Last 24 hours</p>
        </div>
      </div>

      {lastUpdated && (
        <p className="mt-4 text-right text-xs text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
