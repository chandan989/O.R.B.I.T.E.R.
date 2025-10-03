// Configuration utilities for ORBITER frontend integration

import { ContractConfig, DeploymentInfo } from './types';

// Network configurations
export const NETWORK_CONFIGS = {
  testnet: {
    name: 'Testnet',
    node_url: 'https://fullnode.testnet.aptoslabs.com/v1',
    faucet_url: 'https://faucet.testnet.aptoslabs.com',
    explorer_url: 'https://explorer.aptoslabs.com/?network=testnet',
    chain_id: 2
  },
  mainnet: {
    name: 'Mainnet',
    node_url: 'https://fullnode.mainnet.aptoslabs.com/v1',
    explorer_url: 'https://explorer.aptoslabs.com/?network=mainnet',
    chain_id: 1
  },
  devnet: {
    name: 'Devnet',
    node_url: 'https://fullnode.devnet.aptoslabs.com/v1',
    faucet_url: 'https://faucet.devnet.aptoslabs.com',
    explorer_url: 'https://explorer.aptoslabs.com/?network=devnet',
    chain_id: 3
  }
} as const;

export type NetworkType = keyof typeof NETWORK_CONFIGS;

// Default configuration
export const DEFAULT_CONFIG: Partial<ContractConfig> = {
  network: 'testnet',
  node_url: NETWORK_CONFIGS.testnet.node_url,
  faucet_url: NETWORK_CONFIGS.testnet.faucet_url
};

// Configuration manager
export class ConfigManager {
  private static instance: ConfigManager;
  private config: ContractConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // Load configuration from deployment info
  async loadFromDeployment(): Promise<ContractConfig | null> {
    try {
      // Try to load from local deployment file (for development)
      const response = await fetch('/.env.deployment');
      if (response.ok) {
        const text = await response.text();
        const deploymentInfo = this.parseDeploymentInfo(text);
        return this.createConfigFromDeployment(deploymentInfo);
      }
    } catch (error) {
      console.warn('Could not load deployment info from file:', error);
    }

    // Try to load from environment variables
    const envConfig = this.loadFromEnvironment();
    if (envConfig) {
      return envConfig;
    }

    console.warn('No deployment configuration found');
    return null;
  }

  // Load configuration from environment variables
  loadFromEnvironment(): ContractConfig | null {
    const packageAddress = import.meta.env.VITE_PACKAGE_ADDRESS;
    const network = import.meta.env.VITE_NETWORK as NetworkType || 'testnet';

    if (!packageAddress) {
      return null;
    }

    const networkConfig = NETWORK_CONFIGS[network];
    if (!networkConfig) {
      console.error(`Unknown network: ${network}`);
      return null;
    }

    return {
      package_address: packageAddress,
      network,
      node_url: networkConfig.node_url,
      faucet_url: networkConfig.faucet_url
    };
  }

  // Create configuration manually
  createConfig(
    packageAddress: string,
    network: NetworkType = 'testnet'
  ): ContractConfig {
    const networkConfig = NETWORK_CONFIGS[network];
    
    return {
      package_address: packageAddress,
      network,
      node_url: networkConfig.node_url,
      faucet_url: networkConfig.faucet_url
    };
  }

  // Set current configuration
  setConfig(config: ContractConfig): void {
    this.config = config;
  }

  // Get current configuration
  getConfig(): ContractConfig | null {
    return this.config;
  }

  // Get network configuration
  getNetworkConfig(network: NetworkType) {
    return NETWORK_CONFIGS[network];
  }

  // Validate configuration
  validateConfig(config: ContractConfig): boolean {
    if (!config.package_address || !config.network || !config.node_url) {
      return false;
    }

    // Validate package address format
    if (!config.package_address.match(/^0x[a-fA-F0-9]{64}$/)) {
      console.error('Invalid package address format');
      return false;
    }

    // Validate network
    if (!NETWORK_CONFIGS[config.network as NetworkType]) {
      console.error(`Unknown network: ${config.network}`);
      return false;
    }

    return true;
  }

  // Helper methods
  private parseDeploymentInfo(text: string): DeploymentInfo {
    const lines = text.split('\n');
    const info: any = {};

    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key && value) {
        info[key.trim()] = value.trim();
      }
    }

    return info as DeploymentInfo;
  }

  private createConfigFromDeployment(deployment: DeploymentInfo): ContractConfig {
    const network = deployment.network as NetworkType || 'testnet';
    const networkConfig = NETWORK_CONFIGS[network];

    return {
      package_address: deployment.package_address,
      network,
      node_url: networkConfig.node_url,
      faucet_url: networkConfig.faucet_url
    };
  }

  // Get explorer URL for transaction/account
  getExplorerUrl(network: NetworkType, type: 'txn' | 'account', value: string): string {
    const baseUrl = NETWORK_CONFIGS[network].explorer_url;
    
    switch (type) {
      case 'txn':
        return `${baseUrl}&txn=${value}`;
      case 'account':
        return `${baseUrl}&account=${value}`;
      default:
        return baseUrl;
    }
  }

  // Get faucet URL for network
  getFaucetUrl(network: NetworkType): string | undefined {
    return NETWORK_CONFIGS[network].faucet_url;
  }

  // Format APT amount
  static formatAPT(amount: number | string, decimals: number = 8): string {
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
    const aptAmount = numAmount / Math.pow(10, decimals);
    
    if (aptAmount < 0.01) {
      return aptAmount.toFixed(decimals);
    } else if (aptAmount < 1) {
      return aptAmount.toFixed(4);
    } else if (aptAmount < 1000) {
      return aptAmount.toFixed(2);
    } else {
      return aptAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  }

  // Parse APT amount to octas
  static parseAPT(amount: string | number, decimals: number = 8): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.floor(numAmount * Math.pow(10, decimals));
  }

  // Validate address format
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  // Shorten address for display
  static shortenAddress(address: string, chars: number = 4): string {
    if (!address) return '';
    if (address.length <= chars * 2 + 2) return address;
    
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  }

  // Format timestamp
  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  // Calculate percentage
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  // Format percentage
  static formatPercentage(percentage: number, decimals: number = 2): string {
    return `${percentage.toFixed(decimals)}%`;
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();

// Environment variable types for TypeScript
declare global {
  interface ImportMetaEnv {
    readonly VITE_PACKAGE_ADDRESS: string;
    readonly VITE_NETWORK: string;
    readonly VITE_NODE_URL?: string;
    readonly VITE_FAUCET_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Configuration hooks for React components
export const useConfig = () => {
  const config = configManager.getConfig();
  
  const loadConfig = async () => {
    const loaded = await configManager.loadFromDeployment();
    if (loaded && configManager.validateConfig(loaded)) {
      configManager.setConfig(loaded);
      return loaded;
    }
    return null;
  };

  const setConfig = (newConfig: ContractConfig) => {
    if (configManager.validateConfig(newConfig)) {
      configManager.setConfig(newConfig);
      return true;
    }
    return false;
  };

  return {
    config,
    loadConfig,
    setConfig,
    isConfigured: !!config,
    validateConfig: configManager.validateConfig
  };
};