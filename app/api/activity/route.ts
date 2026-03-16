import { NextResponse } from 'next/server'
import { getRecentPosts, getRecentComments, getRecentEngagementLogs } from '@/lib/supabase'

export async function GET() {
  try {
    const [posts, comments, engagements] = await Promise.all([
      getRecentPosts(5),
      getRecentComments(5),
      getRecentEngagementLogs(5),
    ])

    return NextResponse.json({ posts, comments, engagements })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
