import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data: posts } = await supabase
    .from('scheduled_posts')
    .select('*')
    .gte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
  
  return NextResponse.json({ posts: posts || [] })
}

export async function POST(req: NextRequest) {
  const { content, scheduled_for } = await req.json()
  
  const { data, error } = await supabase
    .from('scheduled_posts')
    .insert({ content, scheduled_for, status: 'pending' })
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, post: data })
}