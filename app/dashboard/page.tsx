import Header from '@/components/Header'
import QuoteGenerator from '@/components/QuoteGenerator'
import SportsFeed from '@/components/SportsFeed'
import ActivityFeed from '@/components/ActivityFeed'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <QuoteGenerator />
            <SportsFeed />
          </div>

          {/* Right Column */}
          <div>
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  )
}
