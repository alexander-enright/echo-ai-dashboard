import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Echo API is running',
    endpoints: [
      '/api/generate-quote',
      '/api/generate-comment',
      '/api/post-tweet',
      '/api/comment-tweet',
      '/api/retweet',
      '/api/activity',
    ]
  })
}
