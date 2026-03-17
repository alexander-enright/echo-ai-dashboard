import { NextRequest, NextResponse } from 'next/server'
import { getAutomationSetting, setAutomationSetting } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const setting = searchParams.get('setting')
    
    if (!setting) {
      return NextResponse.json({ error: 'Setting name required' }, { status: 400 })
    }

    const value = await getAutomationSetting(setting)
    return NextResponse.json({ setting, value })
  } catch (error: any) {
    console.error('Error getting setting:', error.message, error.stack)
    return NextResponse.json({ error: error.message || 'Failed to get setting' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setting, value } = await request.json()
    
    if (!setting || typeof value !== 'boolean') {
      return NextResponse.json({ error: 'Setting name and boolean value required' }, { status: 400 })
    }

    await setAutomationSetting(setting, value)
    return NextResponse.json({ success: true, setting, value })
  } catch (error: any) {
    console.error('Error setting automation:', error)
    return NextResponse.json({ error: 'Failed to set setting' }, { status: 500 })
  }
}
