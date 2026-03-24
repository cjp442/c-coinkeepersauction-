import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import AgeVerificationModal from '../components/AgeVerificationModal'
import HeroSection from '../components/sections/HeroSection'
import AuctionsPreview from '../components/sections/AuctionsPreview'
import MembershipPlans from '../components/sections/MembershipPlans'
import GrandOpeningBanner from '../components/sections/GrandOpeningBanner'

export default function HomePage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d')

  // Show age verification on first visit
  useEffect(() => {
    const verified = localStorage.getItem('age_verified')
    if (!verified) {
      setShowAgeModal(true)
    }
  }, [])

  const handleAgeVerified = () => {
    setShowAgeModal(false)
    if (!user) {
      setShowAuthModal(true)
    }
  }

  const handleAgeDenied = () => {
    // Redirect away or show denial page
    setShowAgeModal(false)
  }

  return (
    <>
      {/* Age gate first */}
      {showAgeModal && (
        <AgeVerificationModal
          onVerified={handleAgeVerified}
          onDenied={handleAgeDenied}
        />
      )}

      <GrandOpeningBanner />
      <HeroSection
        onJoinClick={() => setShowAuthModal(true)}
        onModeChange={setViewMode}
        mode={viewMode}
      />
      <AuctionsPreview />
      <MembershipPlans />

      {!user && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  )
}
