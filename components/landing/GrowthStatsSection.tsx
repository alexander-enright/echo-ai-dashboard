'use client'

import { TrendingUp, MessageCircle, Repeat2, Users } from 'lucide-react'

const sampleStats = [
  { label: 'Followers Growth', value: '+135', subtext: 'this week', icon: Users, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  { label: 'Engagement Rate', value: '8.2%', subtext: 'avg. per post', icon: TrendingUp, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { label: 'Posts Generated', value: '42', subtext: 'AI-created', icon: MessageCircle, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { label: 'Comments Posted', value: '120', subtext: 'auto-engagement', icon: Repeat2, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
]

export default function GrowthStatsSection() {
  return (
    <section id="features" className="py-24 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Real Results, Real Growth
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Sample data showing what Echo can do for your X account
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleStats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-500">Sample Data</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          * Sample data for demo purposes. Actual results may vary based on account and usage.
        </p>
      </div>
    </section>
  )
}
