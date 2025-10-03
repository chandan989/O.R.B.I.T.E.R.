// Real APT Price Integration
export class APTPriceService {
  private static instance: APTPriceService;
  private cachedPrice: number = 10; // Default fallback
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  static getInstance(): APTPriceService {
    if (!APTPriceService.instance) {
      APTPriceService.instance = new APTPriceService();
    }
    return APTPriceService.instance;
  }

  // Get current APT price in USD
  async getCurrentPrice(): Promise<number> {
    const now = Date.now();
    
    // Return cached price if still fresh
    if (now - this.lastUpdate < this.CACHE_DURATION) {
      return this.cachedPrice;
    }

    try {
      // Try multiple price sources
      const price = await this.fetchFromMultipleSources();
      this.cachedPrice = price;
      this.lastUpdate = now;
      return price;
    } catch (error) {
      console.warn('Failed to fetch APT price, using cached:', error);
      return this.cachedPrice;
    }
  }

  private async fetchFromMultipleSources(): Promise<number> {
    const sources = [
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromCoinMarketCap(),
      () => this.fetchFromBinance()
    ];

    for (const source of sources) {
      try {
        const price = await source();
        if (price > 0) return price;
      } catch (error) {
        console.warn('Price source failed:', error);
      }
    }

    throw new Error('All price sources failed');
  }

  private async fetchFromCoinGecko(): Promise<number> {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd'
    );
    const data = await response.json();
    return data.aptos?.usd || 0;
  }

  private async fetchFromCoinMarketCap(): Promise<number> {
    // Would need API key for production
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=APT',
      {
        headers: {
          'X-CMC_PRO_API_KEY': 'your-api-key'
        }
      }
    );
    const data = await response.json();
    return data.data?.APT?.quote?.USD?.price || 0;
  }

  private async fetchFromBinance(): Promise<number> {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=APTUSDT'
    );
    const data = await response.json();
    return parseFloat(data.price) || 0;
  }

  // Convert APT to USD
  async convertToUSD(aptAmount: number): Promise<number> {
    const price = await this.getCurrentPrice();
    return aptAmount * price;
  }

  // Format APT amount with USD equivalent
  async formatWithUSD(aptAmount: number): Promise<string> {
    const usdValue = await this.convertToUSD(aptAmount);
    const price = await this.getCurrentPrice();
    
    if (aptAmount >= 1000000) {
      return `${(aptAmount / 1000000).toFixed(1)}M APT (≈$${(usdValue / 1000000).toFixed(1)}M @ $${price.toFixed(2)}/APT)`;
    } else if (aptAmount >= 1000) {
      return `${(aptAmount / 1000).toFixed(1)}K APT (≈$${(usdValue / 1000).toFixed(1)}K @ $${price.toFixed(2)}/APT)`;
    } else {
      return `${aptAmount.toFixed(2)} APT (≈$${usdValue.toFixed(2)} @ $${price.toFixed(2)}/APT)`;
    }
  }
}

export const aptPriceService = APTPriceService.getInstance();