import { BrowserProvider, Contract, parseEther } from 'ethers';
import { 
  ACHIEVEMENT_BADGES_ABI, 
  TOURNAMENT_MANAGER_ABI,
  GAME_CONTROLLER_ABI,
  CONTRACT_ADDRESSES,
  BASE_NETWORK
} from './config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: any = null;

  async connect(): Promise<string | null> {
    // Check if mobile - use deep link for wallet apps
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!window.ethereum) {
      // On mobile without injected wallet, open MetaMask deep link
      if (isMobile) {
        const dappUrl = window.location.href;
        const metamaskUrl = `https://metamask.app.link/dapp/${dappUrl.replace(/^https?:\/\//, '')}`;
        window.location.href = metamaskUrl;
        return null;
      }
      
      console.error('No Ethereum provider found');
      alert('Please install MetaMask or use a Web3 browser');
      return null;
    }

    try {
      this.provider = new BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }

  // Achievement contract methods
  async mintAchievement(achievementId: number, signature: string): Promise<boolean> {
    if (!this.signer) return false;

    try {
      const contract = new Contract(
        CONTRACT_ADDRESSES.ACHIEVEMENT_BADGES,
        ACHIEVEMENT_BADGES_ABI,
        this.signer
      );

      const mintFee = await contract.MINT_FEE();
      const tx = await contract.mintAchievement(achievementId, signature, {
        value: mintFee
      });
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to mint achievement:', error);
      return false;
    }
  }

  async hasAchievement(address: string, achievementId: number): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const contract = new Contract(
        CONTRACT_ADDRESSES.ACHIEVEMENT_BADGES,
        ACHIEVEMENT_BADGES_ABI,
        this.provider
      );

      return await contract.hasAchievement(address, achievementId);
    } catch (error) {
      console.error('Failed to check achievement:', error);
      return false;
    }
  }

  // Tournament contract methods
  async enterTournament(): Promise<boolean> {
    if (!this.signer || !this.provider) return false;

    try {
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== BASE_NETWORK.chainId) {
        console.error('Wrong network. Please switch your wallet to Base Mainnet.');
        return false;
      }

      const contract = new Contract(
        CONTRACT_ADDRESSES.TOURNAMENT_MANAGER,
        TOURNAMENT_MANAGER_ABI,
        this.signer
      );

      let entryFee;
      try {
        entryFee = await contract.getEntryFeeETH();
      } catch (e) {
        console.warn('Failed to fetch entry fee from contract, falling back to default.', e);
      }

      const value = entryFee ?? parseEther('0.00035');

      const tx = await contract.enterTournament({
        value
      });
      
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to enter tournament:', error);
      return false;
    }
  }

  async getCurrentTournament(): Promise<any> {
    if (!this.provider) return null;

    try {
      const contract = new Contract(
        CONTRACT_ADDRESSES.TOURNAMENT_MANAGER,
        TOURNAMENT_MANAGER_ABI,
        this.provider
      );

      return await contract.getCurrentTournament();
    } catch (error) {
      console.error('Failed to get tournament:', error);
      return null;
    }
  }

  async hasEnteredTournament(address: string): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const contract = new Contract(
        CONTRACT_ADDRESSES.TOURNAMENT_MANAGER,
        TOURNAMENT_MANAGER_ABI,
        this.provider
      );

      return await contract.hasEnteredCurrent(address);
    } catch (error) {
      console.error('Failed to check tournament entry:', error);
      return false;
    }
  }

  // Game controller methods
  async getPlayerStats(address: string): Promise<any> {
    if (!this.provider) return null;

    try {
      const contract = new Contract(
        CONTRACT_ADDRESSES.GAME_CONTROLLER,
        GAME_CONTROLLER_ABI,
        this.provider
      );

      return await contract.getPlayerStats(address);
    } catch (error) {
      console.error('Failed to get player stats:', error);
      return null;
    }
  }
}

export const web3Service = new Web3Service();
