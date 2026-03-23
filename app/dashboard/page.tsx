'use client'

import { useEffect, useState } from 'react'
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
import SchedulingDashboard from '@/components/SchedulingDashboard'

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'scheduling'>('overview')

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

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'scheduling'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Scheduling
              {activeTab === 'scheduling' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <QuoteGenerator />
              <ScheduledQuotes compact />
              <SportsFeed />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <TargetedRetweet />
              <ActivityFeed />
              <RetweetAutomation />
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Scheduling Dashboard (takes up 2 columns) */}
            <div className="lg:col-span-2">
              <SchedulingDashboard />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <QuoteGenerator />
              <RetweetAutomation />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
