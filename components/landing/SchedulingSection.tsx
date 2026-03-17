'use client'

import { Clock, Calendar, CheckCircle2 } from 'lucide-react'

const scheduleExamples = [
  {
    time: '7:00 AM',
    task: 'Daily motivational quote',
    status: 'scheduled',
    type: 'post',
  },
  {
    time: '8:00 AM',
    task: 'Auto-engagement: Sports feed',
    status: 'scheduled',
    type: 'retweet',
  },
  {
    time: '12:00 PM',
    task: 'Business insight post',
    status: 'scheduled',
    type: 'post',
  },
  {
    time: '4:00 PM',
    task: 'Auto-engagement: Tech news',
    status: 'scheduled',
    type: 'retweet',
  },
  {
    time: '10:00 PM',
    task: 'Evening reflection quote',
    status: 'scheduled',
    type: 'post',
  },
]

const automationFeatures = [
  {
    title: 'Smart Scheduling',
    description: 'Set optimal posting times based on your audience activity',
    icon: Clock,
  },
  {
    title: 'Auto-Retweets',
    description: 'Automatically engage with posts from selected topics',
    icon: Calendar,
  },
  {
    title: 'Content Queue',
    description: 'Queue up weeks of content and let Echo handle the rest',
    icon: CheckCircle2,
  },
]

export default function SchedulingSection() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Features */}
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Set It and Forget It
            </h2>
            <p className="text-gray-400 text-lg mb-12">
              Schedule your content once, let Echo handle the rest. Your X account stays active 24/7.
            </p>

            <div className="space-y-8">
              {automationFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Schedule Timeline */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              Today's Schedule
            </h3>

            <div className="space-y-4">
              {scheduleExamples.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                      {item.time}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.task}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {item.type === 'post' ? '📝 Auto-post' : '🔄 Auto-engage'}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Auto-scheduling: <span className="text-green-400">Active</span></span>
                <span className="text-gray-500">Next: 7:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
