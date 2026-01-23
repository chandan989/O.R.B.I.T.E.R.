// Main export file for ORBITER frontend integration utilities

// Core classes
export { OrbiterContract } from './contract';
export { EventHandler } from './events';
export { TransactionBuilder } from './transactions';
export { ConfigManager, configManager, useConfig } from './config';

// Types
export type {
  // Core data types
  ValuationData,
  FractionalConfig,
  DomainAsset,
  ShareOwnership,
  ShareTransferEvent,
  ShareListing,
  Marketplace,
  TradeEvent,
  DomainRegistry,
  ValuationOracle,
  PendingValuation,
  
  // Event types
  DomainTokenizedEvent,
  OwnershipTransferredEvent,
  ListingCreatedEvent,
  TradeExecutedEvent,
  
  // API response types
  DomainInfo,
  MarketplaceStats,
  UserPortfolio,
  
  // Transaction payload types
  CreateDomainPayload,
  TransferSharesPayload,
  CreateListingPayload,
  BuySharesPayload,
  
  // Configuration types
  ContractConfig,
  DeploymentInfo
} from './types';

// Transaction types
export type {
  TransactionOptions,
  TransactionResult
} from './transactions';

// Network configurations
export { NETWORK_CONFIGS, DEFAULT_CONFIG } from './config';
export type { NetworkType } from './config';

// Utility functions
export const utils = {
  formatAPT: ConfigManager.formatAPT,
  parseAPT: ConfigManager.parseAPT,
  isValidAddress: ConfigManager.isValidAddress,
  shortenAddress: ConfigManager.shortenAddress,
  formatTimestamp: ConfigManager.formatTimestamp,
  calculatePercentage: ConfigManager.calculatePercentage,
  formatPercentage: ConfigManager.formatPercentage
};

// Event filtering utilities
export const eventUtils = {
  filterEventsByTimeRange: EventHandler.filterEventsByTimeRange,
  filterEventsByAddress: EventHandler.filterEventsByAddress,
  sortEventsByTimestamp: EventHandler.sortEventsByTimestamp
};

// Main SDK class that combines all functionality
export class OrbiterSDK {
  public contract: OrbiterContract;
  public events: EventHandler;
  public transactions: TransactionBuilder;
  public config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
    this.contract = new OrbiterContract(config);
    this.events = new EventHandler(config);
    this.transactions = new TransactionBuilder(config);
  }

  // Factory method to create SDK instance
  static async create(packageAddress?: string, network: NetworkType = 'testnet'): Promise<OrbiterSDK | null> {
    let config: ContractConfig | null = null;

    if (packageAddress) {
      // Create config from provided parameters
      config = configManager.createConfig(packageAddress, network);
    } else {
      // Try to load from deployment or environment
      config = await configManager.loadFromDeployment();
    }

    if (!config || !configManager.validateConfig(config)) {
      console.error('Failed to create valid configuration');
      return null;
    }

    configManager.setConfig(config);
    return new OrbiterSDK(config);
  }

  // Update configuration
  updateConfig(newConfig: ContractConfig): boolean {
    if (!configManager.validateConfig(newConfig)) {
      return false;
    }

    this.config = newConfig;
    this.contract = new OrbiterContract(newConfig);
    this.events = new EventHandler(newConfig);
    this.transactions = new TransactionBuilder(newConfig);
    configManager.setConfig(newConfig);
    
    return true;
  }

  // Get network information
  getNetworkInfo() {
    return configManager.getNetworkConfig(this.config.network as NetworkType);
  }

  // Get explorer URLs
  getExplorerUrl(type: 'txn' | 'account', value: string): string {
    return configManager.getExplorerUrl(this.config.network as NetworkType, type, value);
  }

  // Get faucet URL
  getFaucetUrl(): string | undefined {
    return configManager.getFaucetUrl(this.config.network as NetworkType);
  }
}

// Default export
export default OrbiterSDK;