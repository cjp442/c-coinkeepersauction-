import { useState, useEffect } from 'react'

interface AuctionData {
  id: string
  title: string
  currentBid: number
  status: 'active' | 'ended'
}

const useAuction = (auctionId: string) => {
  const [auction, setAuction] = useState<AuctionData | null>(null)
  const [bid, setBid] = useState(0)
  const [isBidding, setIsBidding] = useState(false)

  useEffect(() => {
    const fetchAuction = async () => {
      const response = await fetch(`/api/auctions/${auctionId}`)
      const data = await response.json() as AuctionData
      setAuction(data)
    }

    fetchAuction()

    const interval = setInterval(fetchAuction, 5000)
    return () => clearInterval(interval)
  }, [auctionId])

  const placeBid = async () => {
    setIsBidding(true)
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bid }),
      })
      const result = await response.json() as { success: boolean; auction: AuctionData }
      if (result.success) {
        setAuction(result.auction)
      }
    } finally {
      setIsBidding(false)
    }
  }

  return { auction, bid, setBid, placeBid, isBidding }
}

export default useAuction
