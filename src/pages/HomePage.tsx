import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from '../components/AuthModal'
import HeroSection from '../components/sections/HeroSection'
import AuctionsPreview from '../components/sections/AuctionsPreview'
import MembershipPlans from '../components/sections/MembershipPlans'
import GrandOpeningBanner from '../components/sections/GrandOpeningBanner'

export default function HomePage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(!user)

  return (
    <>
      <GrandOpeningBanner />
      <HeroSection onJoinClick={() => setShowAuthModal(true)} />
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
