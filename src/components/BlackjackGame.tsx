import { useState, useCallback } from 'react'
import { useTokens } from '../contexts/TokenContext'

interface Card { suit: string; value: string; numValue: number }
interface BlackjackGameProps { onClose: () => void }

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const numValue = value === 'A' ? 11 : ['J', 'Q', 'K'].includes(value) ? 10 : parseInt(value)
      deck.push({ suit, value, numValue })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

function handValue(cards: Card[]): number {
  let total = cards.reduce((sum, c) => sum + c.numValue, 0)
  let aces = cards.filter(c => c.value === 'A').length
  while (total > 21 && aces > 0) { total -= 10; aces-- }
  return total
}

const BET_OPTIONS = [10, 25, 50, 100, 250, 500]

const CardView = ({ card, hidden = false }: { card: Card; hidden?: boolean }) => (
  <div style={{
    width: '52px', height: '76px', backgroundColor: hidden ? '#1e40af' : '#fff',
    border: '2px solid #374151', borderRadius: '6px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', flexShrink: 0,
    color: hidden ? 'transparent' : ['♥', '♦'].includes(card.suit) ? '#dc2626' : '#111',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
  }}>
    {hidden ? '?' : `${card.value}${card.suit}`}
  </div>
)

const BlackjackGame: React.FC<BlackjackGameProps> = ({ onClose }) => {
  const { tokens, deductTokens, addTokens } = useTokens()
  const [deck, setDeck] = useState<Card[]>([])
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerCards, setDealerCards] = useState<Card[]>([])
  const [bet, setBet] = useState(25)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle')
  const [message, setMessage] = useState('')

  const resolveGame = useCallback((dCards: Card[], pCards: Card[]) => {
    const pVal = handValue(pCards)
    const dVal = handValue(dCards)
    setGameState('ended')
    if (pVal > dVal || dVal > 21) {
      addTokens(bet * 2, 'Blackjack win')
      setMessage(`You win ${bet} tokens! 🎉`)
    } else if (pVal === dVal) {
      addTokens(bet, 'Blackjack push')
      setMessage('Push — bet returned.')
    } else {
      setMessage(`Dealer wins. You lose ${bet} tokens.`)
    }
  }, [bet, addTokens])

  const deal = useCallback(async () => {
    if (!tokens || tokens.balance < bet) { setMessage('Insufficient tokens!'); return }
    await deductTokens(bet, 'Blackjack bet')
    const d = createDeck()
    const pCards = [d.pop()!, d.pop()!]
    const dCards = [d.pop()!, d.pop()!]
    setDeck(d)
    setPlayerCards(pCards)
    setDealerCards(dCards)
    setGameState('playing')
    setMessage('')
    if (handValue(pCards) === 21) {
      // Natural blackjack — pays 3:2
      addTokens(Math.floor(bet * 2.5), 'Blackjack natural')
      setMessage(`Blackjack! You win ${Math.floor(bet * 1.5)} tokens! 🎉`)
      setGameState('ended')
    }
  }, [tokens, bet, deductTokens, addTokens])

  const hit = () => {
    const d = [...deck]
    const pCards = [...playerCards, d.pop()!]
    setDeck(d)
    setPlayerCards(pCards)
    if (handValue(pCards) > 21) {
      setGameState('ended')
      setMessage(`Bust! You lose ${bet} tokens.`)
    }
  }

  const stand = () => {
    let dCards = [...dealerCards]
    let d = [...deck]
    while (handValue(dCards) < 17) dCards.push(d.pop()!)
    setDealerCards(dCards)
    setDeck(d)
    resolveGame(dCards, playerCards)
  }

  const isIdle = gameState === 'idle' || gameState === 'ended'
  const canBet = !!tokens && tokens.balance >= bet

  const msgBg = message.includes('win') || message.includes('Blackjack')
    ? '#065f46'
    : message.includes('Push')
      ? '#374151'
      : '#7f1d1d'

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ backgroundColor: '#14532d', border: '3px solid #ffd700', borderRadius: '16px', padding: '28px', maxWidth: '460px', width: '90%', textAlign: 'center', color: '#fff', fontFamily: 'Arial' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ color: '#ffd700', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🃏 21 — Blackjack</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>✕</button>
        </div>

        <p style={{ color: '#86efac', fontSize: '13px', marginBottom: '14px' }}>
          Balance: <strong>{tokens?.balance ?? 0}</strong> tokens
        </p>

        {/* Dealer hand */}
        {dealerCards.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
              Dealer {gameState === 'ended' ? `(${handValue(dealerCards)})` : ''}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {dealerCards.map((c, i) => (
                <CardView key={i} card={c} hidden={gameState === 'playing' && i === 1} />
              ))}
            </div>
          </div>
        )}

        {/* Player hand */}
        {playerCards.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>
              You ({handValue(playerCards)})
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {playerCards.map((c, i) => <CardView key={i} card={c} />)}
            </div>
          </div>
        )}

        {/* Result message */}
        {message && (
          <div style={{ padding: '12px', backgroundColor: msgBg, borderRadius: '8px', marginBottom: '14px', fontWeight: 'bold', fontSize: '14px' }}>
            {message}
          </div>
        )}

        {/* Bet selector */}
        {isIdle && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Bet: {bet} tokens</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {BET_OPTIONS.map(amount => (
                <button
                  key={amount}
                  onClick={() => setBet(amount)}
                  style={{ padding: '6px 12px', backgroundColor: bet === amount ? '#ffd700' : '#166534', color: bet === amount ? '#000' : '#fff', border: `1px solid ${bet === amount ? '#ffd700' : '#4ade80'}`, borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {isIdle && (
            <button
              onClick={deal}
              disabled={!canBet}
              style={{ padding: '12px 28px', backgroundColor: canBet ? '#ffd700' : '#374151', color: canBet ? '#000' : '#6b7280', border: 'none', borderRadius: '8px', cursor: canBet ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: 'bold' }}
            >
              {gameState === 'ended' ? '🔄 Play Again' : '🃏 Deal'}
            </button>
          )}
          {gameState === 'playing' && (
            <>
              <button onClick={hit} style={{ padding: '12px 24px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                Hit
              </button>
              <button onClick={stand} style={{ padding: '12px 24px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                Stand
              </button>
            </>
          )}
        </div>

        <p style={{ color: '#4ade80', fontSize: '11px', marginTop: '14px', opacity: 0.7 }}>
          Blackjack pays 3:2 · Dealer stands on soft 17
        </p>
      </div>
    </div>
  )
}

export default BlackjackGame
