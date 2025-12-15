# 🚀 Quick Start Deployment Guide

## Step 1: Install Dependencies

Since Node.js isn't installed on your system, you'll need to install it first:

### Install Node.js
```bash
# Visit https://nodejs.org and download the LTS version
# Or use a package manager:
# macOS: brew install node
# Then verify installation:
node --version
npm --version
```

### Install Project Dependencies
```bash
cd /Users/macbook/block-puzzle-miniapp
npm install
```

## Step 2: Local Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Step 3: Smart Contract Deployment

### Option A: Using Hardhat

1. **Install Hardhat**:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. **Create deployment script** (`scripts/deploy.js`):
```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy AchievementBadges
  const AchievementBadges = await hre.ethers.getContractFactory("AchievementBadges");
  const achievementBadges = await AchievementBadges.deploy(
    "https://your-metadata-uri.com/{id}.json",
    deployer.address // treasury
  );
  await achievementBadges.waitForDeployment();
  console.log("AchievementBadges deployed to:", await achievementBadges.getAddress());

  // Deploy TournamentManager
  const TournamentManager = await hre.ethers.getContractFactory("TournamentManager");
  const tournamentManager = await TournamentManager.deploy(deployer.address);
  await tournamentManager.waitForDeployment();
  console.log("TournamentManager deployed to:", await tournamentManager.getAddress());

  // Deploy GameController
  const GameController = await hre.ethers.getContractFactory("GameController");
  const gameController = await GameController.deploy();
  await gameController.waitForDeployment();
  console.log("GameController deployed to:", await gameController.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

3. **Configure Hardhat** (`hardhat.config.js`):
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453
    }
  }
};
```

4. **Deploy**:
```bash
# Test on Base Sepolia first
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network base
```

### Option B: Using Remix IDE

1. Go to https://remix.ethereum.org
2. Create new files and paste contract code
3. Install `@openzeppelin/contracts` plugin
4. Compile contracts (Solidity 0.8.20)
5. Deploy to Base using MetaMask
6. Copy deployed addresses

## Step 4: Update Configuration

1. **Update contract addresses** in `src/contracts/config.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  ACHIEVEMENT_BADGES: '0xYourDeployedAddress1',
  TOURNAMENT_MANAGER: '0xYourDeployedAddress2',
  GAME_CONTROLLER: '0xYourDeployedAddress3'
};
```

2. **Create `.env` file**:
```bash
cp .env.example .env
# Edit .env with your actual addresses
```

## Step 5: Prepare Assets

Create and upload these images:

1. **Icon** (512x512px): App icon for Farcaster
2. **Splash** (1080x1920px): Loading screen
3. **Screenshots** (3 images, 1080x1920px): App preview
4. **OG Image** (1200x630px): Social sharing preview
5. **Hero** (1200x630px): Marketing banner

Upload to a CDN or hosting service (Cloudflare R2, AWS S3, etc.)

## Step 6: Update Farcaster Manifest

Edit `public/.well-known/farcaster.json`:

```json
{
  "miniapp": {
    "name": "Block Puzzle",
    "homeUrl": "https://your-actual-domain.com",
    "iconUrl": "https://your-cdn.com/icon.png",
    "splashImageUrl": "https://your-cdn.com/splash.png",
    "screenshotUrls": [
      "https://your-cdn.com/screenshot1.png",
      "https://your-cdn.com/screenshot2.png",
      "https://your-cdn.com/screenshot3.png"
    ],
    "ogImageUrl": "https://your-cdn.com/og-image.png",
    "heroImageUrl": "https://your-cdn.com/hero.png"
  }
}
```

## Step 7: Deploy Frontend

### Option A: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and get production URL
```

### Option B: Netlify
```bash
# Build
npm run build

# Drag & drop 'dist' folder to netlify.com
# Or use Netlify CLI
```

### Option C: GitHub Pages
```bash
# Add to package.json:
"homepage": "https://yourusername.github.io/block-puzzle",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Install gh-pages
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Step 8: Configure Account Association

1. Wait for your app to be live at production URL
2. Visit https://www.base.dev/preview
3. Enter your app URL
4. Click "Account association" tab
5. Follow instructions to generate credentials
6. Copy credentials to `public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJ...",
    "payload": "eyJ...",
    "signature": "MHg..."
  }
}
```

7. Redeploy frontend with updated manifest

## Step 9: Update Embed Metadata

In `index.html`, update the `fc:miniapp` meta tag:

```html
<meta name="fc:miniapp" content='{
  "version":"next",
  "imageUrl":"https://your-cdn.com/embed-preview.png",
  "button":{
    "title":"Play Block Puzzle",
    "action":{
      "type":"launch_miniapp",
      "name":"Block Puzzle",
      "url":"https://your-actual-domain.com",
      "splashImageUrl":"https://your-cdn.com/splash.png",
      "splashBackgroundColor":"#1a0f2e"
    }
  }
}' />
```

## Step 10: Test & Publish

### Testing
1. Use Base Build preview tool: https://www.base.dev/preview
2. Enter your app URL
3. Test:
   - Manifest validation
   - Account association
   - Metadata rendering
   - Launch button functionality

### Publish
1. Open Base app (Warpcast or compatible client)
2. Create a new post
3. Paste your app URL
4. Your app will show as a rich embed with launch button
5. Users can click to launch your mini-app!

## Step 11: Post-Launch Setup

### Smart Contract Configuration
```bash
# Set GameController in contracts
# Call from deployer address:
achievementBadges.setGameController(gameControllerAddress)
tournamentManager.setGameController(gameControllerAddress)

# Configure GameController
gameController.setContracts(achievementBadgesAddress, tournamentManagerAddress)
```

### Monitor
- Tournament contract balance
- Player entries and prizes
- Achievement minting activity
- Gas usage and optimize if needed

## Troubleshooting

### "Cannot find module 'react'"
Run `npm install` to install all dependencies.

### Contract deployment fails
- Check Base RPC is accessible
- Ensure wallet has Base ETH
- Verify OpenZeppelin contracts are installed

### Mini-app doesn't launch
- Verify manifest is at `/.well-known/farcaster.json`
- Check account association is valid
- Ensure all URLs are HTTPS
- Test in Base Build preview tool first

### Images don't load
- Use HTTPS URLs only
- Check image sizes match recommendations
- Verify CORS is enabled on CDN
- Test URLs in browser directly

## Need Help?

- Base docs: https://docs.base.org
- Farcaster mini-apps: https://miniapps.farcaster.xyz
- Base Discord: https://base.org/discord
- OpenZeppelin forum: https://forum.openzeppelin.com

---

**You're all set! 🎉 Your Block Puzzle mini-app is ready to launch on Base!**
