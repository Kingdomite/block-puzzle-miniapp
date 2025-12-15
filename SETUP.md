# Block Puzzle - Farcaster Mini App on Base

A skill-based block puzzle game with daily tournaments and soulbound achievement NFTs, built as a Farcaster mini-app on Base.

## 🎮 Features

- **100% Free-to-Play**: Core gameplay is always free
- **Daily Tournaments**: Optional $0.35 entry fee to compete for ETH prizes
- **Soulbound Achievements**: Mint non-transferable achievement NFTs (0.00015 ETH)
- **Skill-Based Competition**: Rankings based on score, speed, and achievements
- **Transparent Rewards**: Top 3 players share 90% of daily prize pool
- **Base Network**: Built on Base for low fees and fast transactions

## 🏗️ Project Structure

```
block-puzzle-miniapp/
├── contracts/                  # Smart contracts
│   ├── AchievementBadges.sol  # Soulbound ERC-1155 NFTs
│   ├── TournamentManager.sol   # Daily tournament logic
│   └── GameController.sol      # Anti-cheat & verification
├── src/
│   ├── components/            # React components
│   │   ├── GameBoard.tsx      # Block puzzle game
│   │   ├── Tournament.tsx     # Tournament interface
│   │   ├── Achievements.tsx   # Achievement display
│   │   └── Header.tsx         # App header
│   ├── contracts/             # Web3 integration
│   │   ├── config.ts          # Contract addresses & ABIs
│   │   └── web3Service.ts     # Blockchain interactions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── public/
│   └── .well-known/
│       └── farcaster.json     # Farcaster mini-app manifest
└── index.html                 # HTML with embed metadata
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible wallet
- Base network RPC access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 📝 Farcaster Mini-App Configuration

### 1. Update Manifest

Edit `public/.well-known/farcaster.json`:
- Replace `your-app-domain.com` with your actual domain
- Update image URLs (icon, splash, screenshots, OG image)
- Generate `accountAssociation` credentials using Base Build tool

### 2. Account Association

1. Deploy your app to production
2. Visit [Base Build Account Association](https://base.build)
3. Enter your domain and click "Submit"
4. Click "Verify" and follow instructions
5. Copy the generated credentials to `farcaster.json`

### 3. Embed Metadata

The `index.html` already includes proper `fc:miniapp` metadata. Update the URLs:
- `imageUrl`: Embed preview image (1200x630px recommended)
- `splashImageUrl`: Loading screen image
- `url`: Your production URL

## 📦 Smart Contract Deployment

### Deploy to Base Sepolia (Testnet)

1. Install Hardhat/Foundry (choose one):
```bash
npm install --save-dev hardhat @openzeppelin/contracts
```

2. Deploy contracts:
```bash
# Deploy AchievementBadges
# Deploy TournamentManager  
# Deploy GameController
```

3. Update contract addresses in `src/contracts/config.ts`

### Deploy to Base Mainnet

Follow same steps with mainnet configuration. Update:
- `CONTRACT_ADDRESSES` in `src/contracts/config.ts`
- Network settings if needed

## 🎯 Game Mechanics

### Free Play Mode
- Practice block puzzle gameplay
- Improve skills and scores
- Unlock achievements
- No cost, unlimited plays

### Daily Tournaments
- **Entry Fee**: $0.35 in Base ETH
- **Fee Split**: 5% platform, 95% prize pool
- **Prize Distribution**:
  - Treasury gets 10% of pool
  - Top 3 share 90%: 1st (50%), 2nd (30%), 3rd (20%)
- **Duration**: 24 hours per tournament
- **Rankings**: Based on score, speed, achievements

### Achievement NFTs
- **Type**: ERC-1155 Soulbound (non-transferable)
- **Mint Fee**: 0.00015 ETH
- **Requirements**: Skill-gated (must earn achievement)
- **Benefits**: Boost tournament rankings
- **Ownership**: Permanent proof of skill

## 🔐 Smart Contract Features

### AchievementBadges.sol
- Soulbound ERC-1155 tokens
- Fixed 0.00015 ETH mint fee
- Cannot transfer, sell, or approve
- Skill verification required

### TournamentManager.sol
- 24-hour tournament cycles
- Automated prize distribution
- Transparent fee structure
- Anti-cheat integration

### GameController.sol
- Off-chain score verification
- Achievement validation
- Player statistics tracking
- Rate limiting & anti-cheat

## 🌐 Environment Variables

Create `.env` file (not tracked in git):
```
VITE_ACHIEVEMENT_BADGES_ADDRESS=0x...
VITE_TOURNAMENT_MANAGER_ADDRESS=0x...
VITE_GAME_CONTROLLER_ADDRESS=0x...
VITE_BASE_RPC_URL=https://mainnet.base.org
```

## 📱 Farcaster Integration

The app integrates with Farcaster using:
- `@farcaster/miniapp-sdk` for native mini-app features
- Proper manifest configuration
- Embed metadata for rich previews
- Account association for verification

### Testing in Farcaster

1. Deploy to production URL
2. Post your app URL in Base app
3. Click to launch mini-app
4. Test all features

## 🎨 Design Specifications

- **Font**: Lexend (loaded from Google Fonts)
- **Color Scheme**: Purple/cyan gradients (#1a0f2e, #2d1b4e, #00d4ff, #7b2ff7)
- **Optimal Width**: 640px max (Farcaster mini-app standard)
- **Responsive**: Mobile-first design

## ⚖️ Legal & Safety

- Skill-based competition only
- No guaranteed earnings
- Optional participation clearly stated
- Transparent fee structure
- Achievement NFTs as digital badges (not investments)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with custom gradients
- **Blockchain**: Base (Ethereum L2)
- **Web3**: ethers.js v6
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Mini-App**: Farcaster SDK

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a template project. Feel free to fork and customize for your needs.

## 📞 Support

For issues or questions:
- Check Base documentation: https://docs.base.org
- Farcaster mini-apps: https://miniapps.farcaster.xyz
- Base support: https://base.org/support

## 🚀 Deployment Checklist

- [ ] Install dependencies
- [ ] Deploy smart contracts to Base
- [ ] Update contract addresses in config
- [ ] Update all URLs in farcaster.json
- [ ] Generate account association credentials
- [ ] Update embed metadata URLs
- [ ] Create and upload images (icon, splash, screenshots, OG)
- [ ] Deploy frontend to production
- [ ] Test in Base Build preview tool
- [ ] Post in Base app to publish
- [ ] Monitor tournament contract balance
- [ ] Set up backend for score verification

---

**Built for Base • Powered by Farcaster • Play to Compete 🎮**
