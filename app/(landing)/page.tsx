import { AuthProvider } from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import GrowthStatsSection from '@/components/landing/GrowthStatsSection'
import TweetExamplesSection from '@/components/landing/TweetExamplesSection'
import SchedulingSection from '@/components/landing/SchedulingSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main>
          <HeroSection />
          <GrowthStatsSection />
          <TweetExamplesSection />
          <SchedulingSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
