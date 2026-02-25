import React from 'react'
import GameEngine from './game/GameEngine'
import VoiceChat from './components/VoiceChat'
import SpinWheel from './components/SpinWheel'
import { ENABLE_3D_BETA, ENABLE_VOICE_BETA, ENABLE_WHEEL_BETA } from './lib/featureFlags'

function App() {
  return (
    <>
      {ENABLE_3D_BETA && <GameEngine />}
      {ENABLE_VOICE_BETA && <VoiceChat />}
      {ENABLE_WHEEL_BETA && <SpinWheel />}
    </>
  )
}

export default App