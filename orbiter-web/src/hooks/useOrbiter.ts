// React hook for ORBITER smart contract integration

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AptosAccount } from 'aptos';
import { 
  OrbiterSDK, 
  ContractConfig, 
  NetworkType,
  DomainInfo,
  MarketplaceStats,
  UserPortfolio,
  TransactionResult,
  CreateDomainPayload,
  CreateListingPayload,
  BuySharesPayload,
  TransferSharesPayload
} from '../lib';

interface UseOrbiterOptions {
  packageAddress?: string;
  network?: NetworkType;
  autoLoad?: boolean;
}

interface UseOrbiterState {
  sdk: OrbiterSDK | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  config: ContractConfig | null;
}

interface UseOrbiterActions {
  initialize: (packageAddress?: string, network?: NetworkType) => Promise<boolean>;
  updateConfig: (config: ContractConfig) => boolean;
  
  // Domain operations
  createDomain: (account: AptosAccount, payload: CreateDomainPayload) => Promise<TransactionResult>;
  transferDomain: (account: AptosAccount, domainObject: string, newOwner: string) => Promise<TransactionResult>;
  getDomainInfo: (domainObject: string) => Promise<DomainInfo | null>;
  checkDomainExists: (domainName: string) => Promise<boolean>;
  
  // Fractional ownership operations
  initializeFractional: (account: AptosAccount, domainObject: string, totalSupply: number, ticker: string) => Promise<TransactionResult>;
  transferShares: (account: AptosAccount, payload: TransferSharesPayload) => Promise<TransactionResult>;
  getShareBalance: (domainObject: string, owner: string) => Promise<number>;
  getTotalSupply: (domainObject: string) => Promise<number>;
  
  // Marketplace operations
  createListing: (account: AptosAccount, payload: CreateListingPayload) => Promise<TransactionResult>;
  buyShares: (account: AptosAccount, payload: BuySharesPayload) => Promise<TransactionResult>;
  cancelListing: (account: AptosAccount, listingObject: string) => Promise<TransactionResult>;
  getMarketplaceStats: () => Promise<MarketplaceStats>;
  
  // User data
  getUserPortfolio: (address: string) => Promise<UserPortfolio>;
  getAccountBalance: (address: string) => Promise<number>;
  
  // Utilities
  getExplorerUrl: (type: 'txn' | 'account', value: string) => string;
  getFaucetUrl: () => string | undefined;
}

export function useOrbiter(options: UseOrbiterOptions = {}): UseOrbiterState & UseOrbiterActions {
  const [state, setState] = useState<UseOrbiterState>({
    sdk: null,
    isLoading: false,
    isConfigured: false,
    error: null,
    config: null
  });

  // Initialize SDK
  const initialize = useCallback(async (
    packageAddress?: string,
    network: NetworkType = 'testnet'
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const sdk = await OrbiterSDK.create(
        packageAddress || options.packageAddress,
        network || options.network || 'testnet'
      );

      if (!sdk) {
        throw new Error('Failed to initialize ORBITER SDK');
      }

      setState(prev => ({
        ...prev,
        sdk,
        isLoading: false,
        isConfigured: true,
        config: sdk.config
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  }, [options.packageAddress, options.network]);

  // Update configuration
  const updateConfig = useCallback((config: ContractConfig): boolean => {
    if (!state.sdk) return false;

    const success = state.sdk.updateConfig(config);
    if (success) {
      setState(prev => ({ ...prev, config }));
    }
    return success;
  }, [state.sdk]);

  // Domain operations
  const createDomain = useCallback(async (
    account: AptosAccount,
    payload: CreateDomainPayload
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildCreateDomainTransaction(
        account,
        payload.domain_name,
        payload.verification_hash,
        payload.valuation,
        payload.fractional_config
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const transferDomain = useCallback(async (
    account: AptosAccount,
    domainObject: string,
    newOwner: string
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildTransferDomainTransaction(
        account,
        domainObject,
        newOwner
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const getDomainInfo = useCallback(async (domainObject: string): Promise<DomainInfo | null> => {
    if (!state.sdk) return null;
    return await state.sdk.contract.getDomainInfo(domainObject);
  }, [state.sdk]);

  const checkDomainExists = useCallback(async (domainName: string): Promise<boolean> => {
    if (!state.sdk) return false;
    return await state.sdk.contract.domainExists(domainName);
  }, [state.sdk]);

  // Fractional ownership operations
  const initializeFractional = useCallback(async (
    account: AptosAccount,
    domainObject: string,
    totalSupply: number,
    ticker: string
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildInitializeFractionalTransaction(
        account,
        domainObject,
        totalSupply,
        ticker
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const transferShares = useCallback(async (
    account: AptosAccount,
    payload: TransferSharesPayload
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildTransferSharesTransaction(
        account,
        payload.domain_object,
        payload.to,
        payload.amount
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const getShareBalance = useCallback(async (domainObject: string, owner: string): Promise<number> => {
    if (!state.sdk) return 0;
    return await state.sdk.contract.getShareBalance(domainObject, owner);
  }, [state.sdk]);

  const getTotalSupply = useCallback(async (domainObject: string): Promise<number> => {
    if (!state.sdk) return 0;
    return await state.sdk.contract.getTotalSupply(domainObject);
  }, [state.sdk]);

  // Marketplace operations
  const createListing = useCallback(async (
    account: AptosAccount,
    payload: CreateListingPayload
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildCreateListingTransaction(
        account,
        payload.domain_object,
        payload.price_per_share,
        payload.shares_to_sell
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const buyShares = useCallback(async (
    account: AptosAccount,
    payload: BuySharesPayload
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildBuySharesTransaction(
        account,
        payload.listing_object,
        payload.shares_to_buy
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const cancelListing = useCallback(async (
    account: AptosAccount,
    listingObject: string
  ): Promise<TransactionResult> => {
    if (!state.sdk) {
      return { hash: '', success: false, error: 'SDK not initialized' };
    }

    try {
      const transaction = await state.sdk.transactions.buildCancelListingTransaction(
        account,
        listingObject
      );

      return await state.sdk.transactions.executeTransaction(account, transaction);
    } catch (error) {
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [state.sdk]);

  const getMarketplaceStats = useCallback(async (): Promise<MarketplaceStats> => {
    if (!state.sdk) {
      return { total_volume: 0, active_listings: 0, total_trades: 0, total_domains: 0 };
    }
    return await state.sdk.contract.getMarketplaceStats();
  }, [state.sdk]);

  // User data
  const getUserPortfolio = useCallback(async (address: string): Promise<UserPortfolio> => {
    if (!state.sdk) {
      return { owned_domains: [], share_holdings: [], active_listings: [], trade_history: [] };
    }
    return await state.sdk.contract.getUserPortfolio(address);
  }, [state.sdk]);

  const getAccountBalance = useCallback(async (address: string): Promise<number> => {
    if (!state.sdk) return 0;
    return await state.sdk.contract.getAccountBalance(address);
  }, [state.sdk]);

  // Utilities
  const getExplorerUrl = useCallback((type: 'txn' | 'account', value: string): string => {
    if (!state.sdk) return '';
    return state.sdk.getExplorerUrl(type, value);
  }, [state.sdk]);

  const getFaucetUrl = useCallback((): string | undefined => {
    if (!state.sdk) return undefined;
    return state.sdk.getFaucetUrl();
  }, [state.sdk]);

  // Auto-initialize on mount if options provided
  useEffect(() => {
    if (options.autoLoad !== false && (options.packageAddress || options.network)) {
      initialize(options.packageAddress, options.network);
    }
  }, [initialize, options.autoLoad, options.packageAddress, options.network]);

  return {
    // State
    ...state,
    
    // Actions
    initialize,
    updateConfig,
    
    // Domain operations
    createDomain,
    transferDomain,
    getDomainInfo,
    checkDomainExists,
    
    // Fractional ownership operations
    initializeFractional,
    transferShares,
    getShareBalance,
    getTotalSupply,
    
    // Marketplace operations
    createListing,
    buyShares,
    cancelListing,
    getMarketplaceStats,
    
    // User data
    getUserPortfolio,
    getAccountBalance,
    
    // Utilities
    getExplorerUrl,
    getFaucetUrl
  };
}