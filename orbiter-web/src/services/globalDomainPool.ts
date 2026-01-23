// Global Domain Pool Service for Cross-Wallet Domain Trading
// This service provides a demo-friendly interface for domain trading
// that works regardless of blockchain connection status

interface GlobalDomain {
  id: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  shares: number;
  totalShares: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

class GlobalDomainPoolService {
  private domains: GlobalDomain[] = [
    {
      id: 'apex-1',
      name: 'apex.com',
      price: 1250,
      change24h: 12.5,
      volume: 45600,
      shares: 1000,
      totalShares: 10000,
      description: 'Premium gaming domain with global reach',
      rarity: 'Legendary'
    },
    {
      id: 'meta-2',
      name: 'metaverse.io',
      price: 890,
      change24h: -3.2,
      volume: 23400,
      shares: 2500,
      totalShares: 15000,
      description: 'Virtual world platform domain',
      rarity: 'Epic'
    },
    {
      id: 'crypto-3',
      name: 'cryptonova.xyz',
      price: 445,
      change24h: 8.7,
      volume: 12300,
      shares: 5000,
      totalShares: 20000,
      description: 'Next-gen cryptocurrency trading platform',
      rarity: 'Rare'
    },
    {
      id: 'nft-4',
      name: 'nftmarket.app',
      price: 234,
      change24h: 15.3,
      volume: 8900,
      shares: 7500,
      totalShares: 25000,
      description: 'Decentralized NFT marketplace',
      rarity: 'Rare'
    },
    {
      id: 'defi-5',
      name: 'defiprotocol.com',
      price: 567,
      change24h: -1.8,
      volume: 18700,
      shares: 3200,
      totalShares: 12000,
      description: 'Innovative DeFi lending protocol',
      rarity: 'Epic'
    }
  ];

  getAllGlobalDomains(): GlobalDomain[] {
    return this.domains;
  }

  getDomainById(id: string): GlobalDomain | undefined {
    return this.domains.find(domain => domain.id === id);
  }

  buyShares(domainId: string, shares: number, walletAddress: string): boolean {
    console.log(`🛒 Buying ${shares} shares of ${domainId} for wallet ${walletAddress}`);
    
    const domain = this.getDomainById(domainId);
    if (!domain) {
      console.error('Domain not found');
      return false;
    }

    if (domain.shares < shares) {
      console.error('Insufficient shares available');
      return false;
    }

    // Simulate successful purchase
    domain.shares -= shares;
    domain.volume += shares * domain.price;
    
    console.log(`✅ Successfully bought ${shares} shares of ${domain.name}`);
    return true;
  }

  sellShares(domainId: string, shares: number, walletAddress: string): boolean {
    console.log(`💰 Selling ${shares} shares of ${domainId} for wallet ${walletAddress}`);
    
    const domain = this.getDomainById(domainId);
    if (!domain) {
      console.error('Domain not found');
      return false;
    }

    // Simulate successful sale
    domain.shares += shares;
    domain.volume += shares * domain.price;
    
    console.log(`✅ Successfully sold ${shares} shares of ${domain.name}`);
    return true;
  }

  getPortfolioValue(walletAddress: string): number {
    // Simulate portfolio value calculation
    return Math.floor(Math.random() * 50000) + 10000;
  }

  getDomainHistory(domainId: string): Array<{timestamp: number, price: number}> {
    // Generate demo price history
    const history = [];
    const domain = this.getDomainById(domainId);
    const basePrice = domain?.price || 100;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const price = basePrice * (1 + variation);
      
      history.push({
        timestamp: date.getTime(),
        price: Math.floor(price)
      });
    }
    
    return history;
  }
}

export const globalDomainPool = new GlobalDomainPoolService();
export type { GlobalDomain };