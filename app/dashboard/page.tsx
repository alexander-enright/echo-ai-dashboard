'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Header from '@/components/Header'
import QuoteGenerator from '@/components/QuoteGenerator'
import SportsFeed from '@/components/SportsFeed'
import ActivityFeed from '@/components/ActivityFeed'
import ScheduledQuotes from '@/components/ScheduledQuotes'
import RetweetAutomation from '@/components/RetweetAutomation'
import TargetedRetweet from '@/components/TargetedRetweet'
import GrowthStats from '@/components/GrowthStats'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Growth Stats - Top Section */}
        <div className="mb-6">
          <GrowthStats />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <QuoteGenerator />
            <ScheduledQuotes />
            <SportsFeed />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TargetedRetweet />
            <ActivityFeed />
            <RetweetAutomation />
          </div>
        </div>
      </main>
    </div>
  )
}
