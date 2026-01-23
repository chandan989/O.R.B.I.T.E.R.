// Real Domain Storage Service - No External Database Required
import { ValuationData } from '../types/contracts';

export interface DomainRecord {
  id: string;
  domain: string;
  owner: string;
  txHash: string;
  mintDate: string;
  blockHeight: number;
  status: 'active' | 'inactive' | 'transferring';
  valuation: {
    score: number;
    marketValue: number;
    seoAuthority: number;
    trafficEstimate: number;
    brandability: number;
    tldRarity: number;
  };
  metadata: {
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
  tokenization: {
    tokenTicker: string;
    totalSupply: number;
  };
  marketData: {
    floorPrice: number;
    dailyVolume: number;
    totalVolume: number;
    offers: number;
    priceHistory: number[];
  };
}

class DomainStorageService {
  private readonly STORAGE_KEY = 'orbiter_domains';
  private readonly CONSTELLATION_KEY = 'orbiter_constellation';

  // Save a new domain after successful transaction
  async saveDomain(domainData: {
    domain: string;
    owner: string;
    txHash: string;
    valuation: ValuationData;
  }): Promise<DomainRecord> {
    
    console.log('💾 Saving domain to real storage:', domainData);

    // Convert valuation data to numbers
    const parsedValuation = {
      score: parseInt(domainData.valuation.score) || 0,
      marketValue: parseInt(domainData.valuation.market_value) / 100000000 || 0, // Convert octas to USDCx
      seoAuthority: parseInt(domainData.valuation.seo_authority) || 0,
      trafficEstimate: parseInt(domainData.valuation.traffic_estimate) || 0,
      brandability: parseInt(domainData.valuation.brandability) || 0,
      tldRarity: parseInt(domainData.valuation.tld_rarity) || 0,
    };

    // Create domain record
    const domainRecord: DomainRecord = {
      id: `ORBIT-${Date.now().toString(36).toUpperCase()}`,
      domain: domainData.domain,
      owner: domainData.owner,
      txHash: domainData.txHash,
      mintDate: new Date().toISOString(),
      blockHeight: Math.floor(Math.random() * 1000000) + 157000000, // Simulated block height
      status: 'active',
      valuation: parsedValuation,
      metadata: {
        description: `Tokenized domain asset on Stacks blockchain`,
        attributes: [
          { trait_type: 'TLD', value: this.extractTLD(domainData.domain) },
          { trait_type: 'Length', value: domainData.domain.replace(/\.\w+$/, '').length.toString() },
          { trait_type: 'Category', value: this.categorizeDomain(domainData.domain) }
        ]
      },
      tokenization: {
        tokenTicker: this.generateTicker(domainData.domain),
        totalSupply: Math.round(parsedValuation.marketValue * 1000) // Supply based on value
      },
      marketData: {
        floorPrice: parsedValuation.marketValue * 0.8, // 80% of valuation
        dailyVolume: Math.round(Math.random() * 10000),
        totalVolume: Math.round(Math.random() * 100000),
        offers: Math.floor(Math.random() * 15),
        priceHistory: this.generatePriceHistory(parsedValuation.marketValue)
      }
    };

    // Save to localStorage (acts as real database for MVP)
    const existingDomains = this.getAllDomains();
    existingDomains.push(domainRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingDomains));

    console.log('✅ Domain saved successfully:', domainRecord);
    console.log('📊 Total domains now:', existingDomains.length);
    
    // Trigger constellation update event
    window.dispatchEvent(new CustomEvent('domainAdded', { detail: domainRecord }));
    console.log('📡 Event dispatched for constellation update');
    
    return domainRecord;
  }

  // Get all domains for constellation view
  getAllDomains(): DomainRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const domains = stored ? JSON.parse(stored) : [];
      console.log(`📦 Retrieved ${domains.length} domains from localStorage:`, domains);
      return domains;
    } catch (error) {
      console.error('❌ Error loading domains from localStorage:', error);
      return [];
    }
  }

  // Get domains by owner
  getDomainsByOwner(ownerAddress: string): DomainRecord[] {
    return this.getAllDomains().filter(domain => domain.owner === ownerAddress);
  }

  // Check if domain exists
  domainExists(domainName: string): boolean {
    return this.getAllDomains().some(domain => domain.domain.toLowerCase() === domainName.toLowerCase());
  }

  // Get domain by transaction hash
  getDomainByTxHash(txHash: string): DomainRecord | null {
    return this.getAllDomains().find(domain => domain.txHash === txHash) || null;
  }

  // Update domain status (for transfers, etc.)
  updateDomainStatus(txHash: string, status: 'active' | 'inactive' | 'transferring'): boolean {
    const domains = this.getAllDomains();
    const domainIndex = domains.findIndex(domain => domain.txHash === txHash);
    
    if (domainIndex >= 0) {
      domains[domainIndex].status = status;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(domains));
      return true;
    }
    return false;
  }

  // Clear all data (for testing)
  clearAllDomains(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All domain data cleared');
  }

  // Get portfolio stats
  getPortfolioStats(ownerAddress?: string): {
    totalDomains: number;
    totalValue: number;
    activeCount: number;
    avgValue: number;
  } {
    const domains = ownerAddress ? this.getDomainsByOwner(ownerAddress) : this.getAllDomains();
    
    const totalValue = domains.reduce((sum, domain) => sum + domain.valuation.marketValue, 0);
    const activeCount = domains.filter(domain => domain.status === 'active').length;
    
    return {
      totalDomains: domains.length,
      totalValue: totalValue,
      activeCount: activeCount,
      avgValue: domains.length > 0 ? totalValue / domains.length : 0
    };
  }

  // Private helper methods
  private extractTLD(domain: string): string {
    const tld = domain.split('.').pop();
    return tld ? `.${tld}` : '.com';
  }

  private categorizeDomain(domain: string): string {
    const name = domain.replace(/\.\w+$/, '').toLowerCase();
    
    if (['ai', 'ml', 'robot', 'tech', 'data'].some(keyword => name.includes(keyword))) {
      return 'Technology';
    } else if (['crypto', 'coin', 'token', 'defi', 'web3'].some(keyword => name.includes(keyword))) {
      return 'Crypto';
    } else if (['shop', 'store', 'buy', 'sell', 'market'].some(keyword => name.includes(keyword))) {
      return 'Commerce';
    } else if (['game', 'play', 'fun', 'sport'].some(keyword => name.includes(keyword))) {
      return 'Gaming';
    } else {
      return 'General';
    }
  }

  private generateTicker(domain: string): string {
    const name = domain.replace(/\.\w+$/, '').toUpperCase();
    if (name.length <= 4) return name;
    
    // Extract meaningful chars for ticker
    const vowels = name.match(/[AEIOU]/g) || [];
    const consonants = name.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || [];
    
    let ticker = '';
    
    // Start with first consonant
    if (consonants.length > 0) ticker += consonants[0];
    
    // Add vowels and consonants alternately
    for (let i = 0; i < 3 && ticker.length < 4; i++) {
      if (i < vowels.length && ticker.length < 4) ticker += vowels[i];
      if (i + 1 < consonants.length && ticker.length < 4) ticker += consonants[i + 1];
    }
    
    // Ensure 3-4 characters
    while (ticker.length < 3) ticker += 'X';
    
    return ticker.substring(0, 4);
  }

  private generatePriceHistory(basePrice: number): number[] {
    const history = [];
    let price = basePrice * 0.9; // Start 10% below current
    
    for (let i = 0; i < 7; i++) {
      const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
      price = price * (1 + change);
      history.push(Math.round(price * 100) / 100);
    }
    
    return history;
  }
}

// Export singleton instance
export const domainStorage = new DomainStorageService();