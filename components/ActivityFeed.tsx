'use client'

import { useState, useEffect } from 'react'
import { Post, Comment, EngagementLog } from '@/types'

interface ActivityData {
  posts: Post[]
  comments: Comment[]
  engagements: EngagementLog[]
}

export default function ActivityFeed() {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-white">Activity Feed</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
        <button
          onClick={fetchActivity}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-6">
        {/* Recent Posts */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-400">Recent Posts</h3>
          {(data?.posts?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {data.posts.map((post) => (
                <div key={post.id} className="rounded-lg bg-gray-900 p-3">
                  <p className="text-sm text-white line-clamp-2">{post.content}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span className="capitalize text-red-400">{post.type}</span>
                    <span>•</span>
                    <span>{formatDate(post.posted_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No posts yet</p>
          )}
        </div>

        {/* Recent Comments */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-400">Recent Comments</h3>
          {(data?.comments?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {data.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-gray-900 p-3">
                  <p className="text-sm text-white line-clamp-2">{comment.comment_text}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <span>Tweet: {comment.tweet_id.slice(0, 10)}...</span>
                    <span className="ml-2">• {formatDate(comment.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet</p>
          )}
        </div>

        {/* Recent Engagements */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-400">Recent Engagements</h3>
          {(data?.engagements?.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {data.engagements.map((engagement) => (
                <div key={engagement.id} className="flex items-center justify-between rounded-lg bg-gray-900 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      engagement.action === 'like' ? 'bg-pink-900/50 text-pink-400' :
                      engagement.action === 'retweet' ? 'bg-green-900/50 text-green-400' :
                      'bg-blue-900/50 text-blue-400'
                    }`}>
                      {engagement.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      Tweet: {engagement.tweet_id.slice(0, 10)}...
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(engagement.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No engagements yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
