# CoinKeepersAuction - Complete Live Auction Platform

A comprehensive real-time auction platform for coins and bullion with 3D interactive rooms, live streaming, games, and full token-based economy.

## Features

- 🏠 **3D Interactive Rooms** - Avatar-based 3D rooms with real-time multiplayer
- 🎬 **Live Streaming** - WebRTC streaming with OBS integration
- 🎰 **Gaming** - Wheel of Fortune, Pool, Poker, Darts with token rewards
- 🔨 **Live Auctions** - Real-time bidding with seller verification
- 👥 **Private Rooms** - VIP-only customizable rooms with scheduling
- 🎤 **Voice Chat** - VIP voice communication in 3D rooms
- 💰 **Token Economy** - Internal token-based payment system
- 📊 **Admin Dashboard** - Comprehensive site management
- 📱 **FedEx Shipping** - Integrated shipping with tracking
- 🔐 **Legal Framework** - Full compliance and user agreements

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   ├── sections/     # Page sections
│   ├── 3d/          # Three.js 3D components
│   └── features/    # Feature-specific components
├── contexts/        # React context providers
├── hooks/          # Custom React hooks
├── services/       # API and Supabase services
├── types/          # TypeScript type definitions
├── lib/            # Utility functions
└── styles/         # CSS and Tailwind
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **3D**: Three.js, React Three Fiber
- **Backend**: Supabase
- **Real-time**: Supabase Realtime
- **Streaming**: WebRTC
- **Payment**: Internal token system
- **Shipping**: FedEx API

## Environment Variables

See `.env.example` for required environment variables.

## Building for Production

```bash
npm run build
npm run preview
```

## Deployment

Deploy to Vercel or Netlify using the provided configuration files.

## Legal

All users must agree to Terms of Service before accessing the platform. See `/legal/terms.md` for details.

## Support

For hosting and platform inquiries, call: **(606) 412-3121**

---

**CoinKeepersAuction.com** - Live Auctions for Coins & Bullion
