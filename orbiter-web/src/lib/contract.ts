// Contract interaction utilities for ORBITER smart contracts

import { AptosClient, AptosAccount, TxnBuilderTypes, BCS, HexString } from 'aptos';
import {
  ContractConfig,
  CreateDomainPayload,
  TransferSharesPayload,
  CreateListingPayload,
  BuySharesPayload,
  DomainInfo,
  MarketplaceStats,
  UserPortfolio,
  ValuationData,
  FractionalConfig
} from './types';

export class OrbiterContract {
  private client: AptosClient;
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
    this.client = new AptosClient(config.node_url);
  }

  // Helper method to build function names
  private getFunctionName(module: string, functionName: string): string {
    return `${this.config.package_address}::${module}::${functionName}`;
  }

  // Domain Registry Functions
  async createDomainObject(
    account: AptosAccount,
    payload: CreateDomainPayload
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('domain_registry', 'create_domain_object'),
      [],
      [
        BCS.bcsSerializeStr(payload.domain_name),
        BCS.bcsSerializeStr(payload.verification_hash),
        this.serializeValuationData(payload.valuation),
        payload.fractional_config 
          ? this.serializeFractionalConfig(payload.fractional_config)
          : BCS.bcsSerializeOption(null)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async transferDomain(
    account: AptosAccount,
    domainObject: string,
    newOwner: string
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('domain_registry', 'transfer_domain'),
      [],
      [
        BCS.bcsSerializeStr(domainObject),
        BCS.bcsSerializeStr(newOwner)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async getDomainInfo(domainObject: string): Promise<DomainInfo | null> {
    try {
      const resource = await this.client.getAccountResource(
        domainObject,
        `${this.config.package_address}::domain_registry::DomainAsset`
      );

      return this.parseDomainInfo(resource.data);
    } catch (error) {
      console.error('Error fetching domain info:', error);
      return null;
    }
  }

  async domainExists(domainName: string): Promise<boolean> {
    try {
      const result = await this.client.view({
        function: this.getFunctionName('domain_registry', 'domain_exists'),
        arguments: [domainName],
        type_arguments: []
      });

      return result[0] as boolean;
    } catch (error) {
      console.error('Error checking domain existence:', error);
      return false;
    }
  }

  // Fractional Ownership Functions
  async initializeFractionalOwnership(
    account: AptosAccount,
    domainObject: string,
    totalSupply: number,
    ticker: string
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('fractional', 'initialize_fractional_ownership'),
      [],
      [
        BCS.bcsSerializeStr(domainObject),
        BCS.bcsSerializeU64(totalSupply),
        BCS.bcsSerializeStr(ticker)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async transferShares(
    account: AptosAccount,
    payload: TransferSharesPayload
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('fractional', 'transfer_shares'),
      [],
      [
        BCS.bcsSerializeStr(payload.domain_object),
        BCS.bcsSerializeStr(payload.to),
        BCS.bcsSerializeU64(payload.amount)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async getShareBalance(domainObject: string, owner: string): Promise<number> {
    try {
      const result = await this.client.view({
        function: this.getFunctionName('fractional', 'get_share_balance'),
        arguments: [domainObject, owner],
        type_arguments: []
      });

      return parseInt(result[0] as string);
    } catch (error) {
      console.error('Error fetching share balance:', error);
      return 0;
    }
  }

  async getTotalSupply(domainObject: string): Promise<number> {
    try {
      const result = await this.client.view({
        function: this.getFunctionName('fractional', 'get_total_supply'),
        arguments: [domainObject],
        type_arguments: []
      });

      return parseInt(result[0] as string);
    } catch (error) {
      console.error('Error fetching total supply:', error);
      return 0;
    }
  }

  // Marketplace Functions
  async createListing(
    account: AptosAccount,
    payload: CreateListingPayload
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('marketplace', 'create_listing'),
      [],
      [
        BCS.bcsSerializeStr(payload.domain_object),
        BCS.bcsSerializeU64(payload.price_per_share),
        BCS.bcsSerializeU64(payload.shares_to_sell)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async buyShares(
    account: AptosAccount,
    payload: BuySharesPayload
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('marketplace', 'buy_shares'),
      [],
      [
        BCS.bcsSerializeStr(payload.listing_object),
        BCS.bcsSerializeU64(payload.shares_to_buy)
      ]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async cancelListing(
    account: AptosAccount,
    listingObject: string
  ): Promise<string> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName('marketplace', 'cancel_listing'),
      [],
      [BCS.bcsSerializeStr(listingObject)]
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction
    );

    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);

    return transactionRes.hash;
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const result = await this.client.view({
        function: this.getFunctionName('marketplace', 'get_marketplace_stats'),
        arguments: [],
        type_arguments: []
      });

      return {
        total_volume: parseInt(result[0] as string),
        active_listings: parseInt(result[1] as string),
        total_trades: parseInt(result[2] as string),
        total_domains: parseInt(result[3] as string) || 0
      };
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
      return {
        total_volume: 0,
        active_listings: 0,
        total_trades: 0,
        total_domains: 0
      };
    }
  }

  // Utility Functions
  private serializeValuationData(valuation: ValuationData): Uint8Array {
    // This is a simplified serialization - in practice, you'd use proper BCS serialization
    const serializer = new BCS.Serializer();
    serializer.serializeU64(valuation.score);
    serializer.serializeU64(valuation.market_value);
    serializer.serializeU64(valuation.seo_authority);
    serializer.serializeU64(valuation.traffic_estimate);
    serializer.serializeU64(valuation.brandability);
    serializer.serializeU64(valuation.tld_rarity);
    serializer.serializeU64(valuation.updated_at);
    return serializer.getBytes();
  }

  private serializeFractionalConfig(config: FractionalConfig): Uint8Array {
    const serializer = new BCS.Serializer();
    serializer.serializeStr(config.ticker);
    serializer.serializeU64(config.total_supply);
    serializer.serializeU64(config.circulating_supply);
    serializer.serializeBool(config.trading_enabled);
    return serializer.getBytes();
  }

  private parseDomainInfo(data: any): DomainInfo {
    // Parse the raw contract data into our TypeScript types
    // This would need to be implemented based on the actual data structure
    return {
      object_address: data.object_address || '',
      domain_asset: {
        domain_name: data.domain_name || '',
        original_owner: data.original_owner || '',
        verification_hash: data.verification_hash || '',
        created_at: parseInt(data.created_at || '0'),
        valuation: data.valuation || {
          score: 0,
          market_value: 0,
          seo_authority: 0,
          traffic_estimate: 0,
          brandability: 0,
          tld_rarity: 0,
          updated_at: 0
        },
        fractional_config: data.fractional_config
      },
      active_listings: data.active_listings || []
    };
  }

  // Account and balance utilities
  async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await this.client.getAccountResources(address);
      const coinResource = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource) {
        return parseInt((coinResource.data as any).coin.value);
      }
      return 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }

  async getUserPortfolio(address: string): Promise<UserPortfolio> {
    // This would aggregate data from multiple contract calls
    // Implementation would depend on the specific contract structure
    return {
      owned_domains: [],
      share_holdings: [],
      active_listings: [],
      trade_history: []
    };
  }
}