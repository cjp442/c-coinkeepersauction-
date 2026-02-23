import React from 'react'

interface ActiveAuction {
  id: string
  name: string
}

interface Player {
  id: string
  name: string
}

const MultiplayerLobby = () => {
  const [activeAuctions, setActiveAuctions] = React.useState<ActiveAuction[]>([])
  const [players, setPlayers] = React.useState<Player[]>([])

  React.useEffect(() => {
    fetchActiveAuctions()
    fetchPlayers()
  }, [])

  const fetchActiveAuctions = async () => {
    const auctions = await fetch('/api/active-auctions').then(res => res.json()) as ActiveAuction[]
    setActiveAuctions(auctions)
  }

  const fetchPlayers = async () => {
    const playersList = await fetch('/api/players').then(res => res.json()) as Player[]
    setPlayers(playersList)
  }

  const joinAuction = (auctionId: string) => {
    console.log(`Joining auction with ID: ${auctionId}`)
  }

  return (
    <div>
      <h1>Multiplayer Lobby</h1>
      <h2>Active Auctions</h2>
      <ul>
        {activeAuctions.map(auction => (
          <li key={auction.id}>
            {auction.name} <button onClick={() => joinAuction(auction.id)}>Join</button>
          </li>
        ))}
      </ul>
      <h2>Players</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default MultiplayerLobby
