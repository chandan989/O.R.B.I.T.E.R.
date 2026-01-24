import { domainStorage } from './domainStorage';

export interface PortfolioHolding {
  domain: string;
  tokenTicker: string;
  sharesOwned: number;
  totalSupply: number;
  ownershipPercentage: number;
  currentPrice: number;
  totalValue: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  holdings: PortfolioHolding[];
  diversificationScore: number;
}

class PortfolioService {
  
  /**
   * Get user's portfolio holdings from tokenized domains
   */
  async getUserPortfolio(userAddress?: string): Promise<PortfolioSummary> {
    try {
      console.log('📊 Getting portfolio for user:', userAddress);
      
      // Get all tokenized domains from storage
      const domains = domainStorage.getAllDomains();
      console.log('📦 Found domains in storage:', domains.length, domains);
      
      // Get user-owned domains
      const userDomains = userAddress ? domains.filter(d => d.owner === userAddress) : [];
      console.log('👤 User owns domains:', userDomains.length, userDomains);
      
      // Convert user domains to holdings
      const userHoldings: PortfolioHolding[] = userDomains.map((domain) => {
        const ownershipPercentage = 100; // User owns 100% of their created domains
        const totalSupply = domain.tokenization.totalSupply || 100000;
        const sharesOwned = totalSupply; // Own all shares
        const currentPrice = domain.marketData.floorPrice || domain.valuation.marketValue;
        const totalValue = currentPrice;
        
        // Simulate 24h price changes
        const priceChange24h = (Math.random() - 0.5) * 4; // -2 to +2 USDCx
        const priceChangePercent24h = (priceChange24h / currentPrice) * 100;
        
        return {
          domain: domain.domain,
          tokenTicker: domain.tokenization.tokenTicker,
          sharesOwned,
          totalSupply,
          ownershipPercentage,
          currentPrice,
          totalValue,
          priceChange24h,
          priceChangePercent24h
        };
      });
      
      // Only add mock holdings if user has no real domains (for demo purposes)
      let allHoldings = userHoldings;
      
      if (userHoldings.length === 0) {
        console.log('👤 User has no real domains, showing demo holdings for presentation');
        // Add demo holdings only when no real holdings exist
        const mockHoldings: PortfolioHolding[] = [
          {
            domain: "crypto-exchange.com",
            tokenTicker: "CRYP",
            sharesOwned: 15420,
            totalSupply: 250000,
            ownershipPercentage: 6.17,
            currentPrice: 18.50,
            totalValue: 1141.5,
            priceChange24h: 1.20,
            priceChangePercent24h: 6.9
          },
          {
            domain: "defi-protocol.io", 
            tokenTicker: "DEFI",
            sharesOwned: 8950,
            totalSupply: 180000,
            ownershipPercentage: 4.97,
            currentPrice: 22.80,
            totalValue: 1133.6,
            priceChange24h: -0.85,
            priceChangePercent24h: -3.6
          }
        ];
        allHoldings = mockHoldings;
      } else {
        console.log('👤 User has real domains, showing only actual holdings');
      }
      console.log('💰 Total holdings:', allHoldings.length, allHoldings);
      
      // Calculate portfolio summary
      const totalValue = allHoldings.reduce((sum, holding) => sum + holding.totalValue, 0);
      const totalChange24h = allHoldings.reduce((sum, holding) => sum + (holding.totalValue * holding.priceChangePercent24h / 100), 0);
      const totalChangePercent24h = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;
      
      // Calculate diversification score (higher is better, max 100)
      const uniqueHoldings = allHoldings.length;
      const maxOwnership = Math.max(...allHoldings.map(h => h.ownershipPercentage));
      const diversificationScore = Math.min(100, (uniqueHoldings * 10) + (100 - maxOwnership));
      
      const portfolio = {
        totalValue,
        totalChange24h,
        totalChangePercent24h,
        holdings: allHoldings,
        diversificationScore
      };
      
      console.log('📈 Final portfolio:', portfolio);
      return portfolio;
      
    } catch (error) {
      console.error('❌ Error fetching portfolio:', error);
      return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercent24h: 0,
        holdings: [],
        diversificationScore: 0
      };
    }
  }
  
  /**
   * Get portfolio performance metrics
   */
  getPortfolioMetrics(portfolio: PortfolioSummary) {
    const totalHoldings = portfolio.holdings.length;
    const profitableHoldings = portfolio.holdings.filter(h => h.priceChangePercent24h > 0).length;
    const profitablePercentage = totalHoldings > 0 ? (profitableHoldings / totalHoldings) * 100 : 0;
    
    const bestPerformer = portfolio.holdings.reduce((best, current) => 
      current.priceChangePercent24h > best.priceChangePercent24h ? current : best,
      portfolio.holdings[0] || { priceChangePercent24h: 0, domain: 'N/A' }
    );
    
    const worstPerformer = portfolio.holdings.reduce((worst, current) => 
      current.priceChangePercent24h < worst.priceChangePercent24h ? current : worst,
      portfolio.holdings[0] || { priceChangePercent24h: 0, domain: 'N/A' }
    );
    
    return {
      totalHoldings,
      profitableHoldings,
      profitablePercentage,
      bestPerformer,
      worstPerformer,
      diversificationScore: portfolio.diversificationScore,
      riskLevel: portfolio.diversificationScore > 70 ? 'Low' : portfolio.diversificationScore > 40 ? 'Medium' : 'High'
    };
  }
  
  /**
   * Format currency values for display
   */
  formatCurrency(value: number, currency: string = 'USDCx'): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M ${currency}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K ${currency}`;
    } else {
      return `${value.toFixed(2)} ${currency}`;
    }
  }
  
  /**
   * Get color for price change display
   */
  getPriceChangeColor(change: number): string {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-muted-foreground';
  }
  
  /**
   * Calculate portfolio allocation percentages
   */
  getPortfolioAllocation(portfolio: PortfolioSummary) {
    const totalValue = portfolio.totalValue;
    
    return portfolio.holdings.map(holding => ({
      ...holding,
      allocationPercentage: totalValue > 0 ? (holding.totalValue / totalValue) * 100 : 0
    })).sort((a, b) => b.allocationPercentage - a.allocationPercentage);
  }
}

export const portfolioService = new PortfolioService();