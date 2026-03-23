'use client'

import { useState, useEffect } from 'react'

export function ContentCalendar() {
  const [posts, setPosts] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    fetch('/api/scheduled-posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/scheduled-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, scheduled_for: date })
    })
    setContent('')
    setDate('')
    loadPosts()
  }

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3 className="font-bold mb-4">Content Calendar</h3>
      
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 bg-gray-800 rounded text-white"
          rows={2}
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 p-2 bg-gray-800 rounded text-white"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 rounded">Schedule</button>
        </div>
      </form>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {(posts || []).map((post: any) => (
          <div key={post.id} className="p-2 bg-gray-800 rounded text-sm">
            <p>{post.content}</p>
            <p className="text-gray-400 text-xs">{new Date(post.scheduled_for).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}