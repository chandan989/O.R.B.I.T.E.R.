// Transaction building and signing helpers for ORBITER smart contracts

import { AptosClient, AptosAccount, TxnBuilderTypes, BCS } from 'aptos';
import { ContractConfig } from './types';

export interface TransactionOptions {
  maxGasAmount?: number;
  gasUnitPrice?: number;
  expirationTimestampSecs?: number;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: number;
  error?: string;
}

export class TransactionBuilder {
  private client: AptosClient;
  private config: ContractConfig;

  constructor(config: ContractConfig) {
    this.config = config;
    this.client = new AptosClient(config.node_url);
  }

  private getFunctionName(module: string, functionName: string): string {
    return `${this.config.package_address}::${module}::${functionName}`;
  }

  // Generic transaction builder
  async buildTransaction(
    account: AptosAccount,
    module: string,
    functionName: string,
    typeArguments: string[] = [],
    args: any[] = [],
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const entryFunction = TxnBuilderTypes.TransactionPayloadEntryFunction.natural(
      this.getFunctionName(module, functionName),
      typeArguments,
      args
    );

    const txnRequest = await this.client.generateTransaction(
      account.address(),
      entryFunction,
      {
        max_gas_amount: options.maxGasAmount?.toString() || '10000',
        gas_unit_price: options.gasUnitPrice?.toString() || '100',
        expiration_timestamp_secs: options.expirationTimestampSecs?.toString() || 
          (Math.floor(Date.now() / 1000) + 600).toString() // 10 minutes from now
      }
    );

    return txnRequest;
  }

  // Execute transaction with error handling
  async executeTransaction(
    account: AptosAccount,
    transaction: TxnBuilderTypes.RawTransaction
  ): Promise<TransactionResult> {
    try {
      const signedTxn = await this.client.signTransaction(account, transaction);
      const transactionRes = await this.client.submitTransaction(signedTxn);
      
      // Wait for transaction confirmation
      const txnResult = await this.client.waitForTransactionWithResult(transactionRes.hash);
      
      return {
        hash: transactionRes.hash,
        success: txnResult.success,
        gasUsed: parseInt(txnResult.gas_used || '0')
      };
    } catch (error) {
      console.error('Transaction execution failed:', error);
      return {
        hash: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Domain Registry Transactions
  async buildCreateDomainTransaction(
    account: AptosAccount,
    domainName: string,
    verificationHash: string,
    valuation: any,
    fractionalConfig?: any,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainName),
      BCS.bcsSerializeStr(verificationHash),
      this.serializeValuationData(valuation),
      fractionalConfig ? this.serializeFractionalConfig(fractionalConfig) : BCS.bcsSerializeOption(null)
    ];

    return this.buildTransaction(
      account,
      'domain_registry',
      'create_domain_object',
      [],
      args,
      options
    );
  }

  async buildTransferDomainTransaction(
    account: AptosAccount,
    domainObject: string,
    newOwner: string,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainObject),
      BCS.bcsSerializeStr(newOwner)
    ];

    return this.buildTransaction(
      account,
      'domain_registry',
      'transfer_domain',
      [],
      args,
      options
    );
  }

  // Fractional Ownership Transactions
  async buildInitializeFractionalTransaction(
    account: AptosAccount,
    domainObject: string,
    totalSupply: number,
    ticker: string,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainObject),
      BCS.bcsSerializeU64(totalSupply),
      BCS.bcsSerializeStr(ticker)
    ];

    return this.buildTransaction(
      account,
      'fractional',
      'initialize_fractional_ownership',
      [],
      args,
      options
    );
  }

  async buildTransferSharesTransaction(
    account: AptosAccount,
    domainObject: string,
    to: string,
    amount: number,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainObject),
      BCS.bcsSerializeStr(to),
      BCS.bcsSerializeU64(amount)
    ];

    return this.buildTransaction(
      account,
      'fractional',
      'transfer_shares',
      [],
      args,
      options
    );
  }

  async buildApproveSharesTransaction(
    account: AptosAccount,
    domainObject: string,
    spender: string,
    amount: number,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainObject),
      BCS.bcsSerializeStr(spender),
      BCS.bcsSerializeU64(amount)
    ];

    return this.buildTransaction(
      account,
      'fractional',
      'approve_shares',
      [],
      args,
      options
    );
  }

  // Marketplace Transactions
  async buildCreateListingTransaction(
    account: AptosAccount,
    domainObject: string,
    pricePerShare: number,
    sharesToSell: number,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(domainObject),
      BCS.bcsSerializeU64(pricePerShare),
      BCS.bcsSerializeU64(sharesToSell)
    ];

    return this.buildTransaction(
      account,
      'marketplace',
      'create_listing',
      [],
      args,
      options
    );
  }

  async buildBuySharesTransaction(
    account: AptosAccount,
    listingObject: string,
    sharesToBuy: number,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(listingObject),
      BCS.bcsSerializeU64(sharesToBuy)
    ];

    return this.buildTransaction(
      account,
      'marketplace',
      'buy_shares',
      [],
      args,
      options
    );
  }

  async buildCancelListingTransaction(
    account: AptosAccount,
    listingObject: string,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [BCS.bcsSerializeStr(listingObject)];

    return this.buildTransaction(
      account,
      'marketplace',
      'cancel_listing',
      [],
      args,
      options
    );
  }

  async buildUpdateListingPriceTransaction(
    account: AptosAccount,
    listingObject: string,
    newPrice: number,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction> {
    const args = [
      BCS.bcsSerializeStr(listingObject),
      BCS.bcsSerializeU64(newPrice)
    ];

    return this.buildTransaction(
      account,
      'marketplace',
      'update_listing_price',
      [],
      args,
      options
    );
  }

  // Batch transaction support
  async buildBatchTransaction(
    account: AptosAccount,
    transactions: Array<{
      module: string;
      functionName: string;
      typeArguments?: string[];
      args: any[];
    }>,
    options: TransactionOptions = {}
  ): Promise<TxnBuilderTypes.RawTransaction[]> {
    const builtTransactions: TxnBuilderTypes.RawTransaction[] = [];

    for (const txn of transactions) {
      const built = await this.buildTransaction(
        account,
        txn.module,
        txn.functionName,
        txn.typeArguments || [],
        txn.args,
        options
      );
      builtTransactions.push(built);
    }

    return builtTransactions;
  }

  async executeBatchTransactions(
    account: AptosAccount,
    transactions: TxnBuilderTypes.RawTransaction[]
  ): Promise<TransactionResult[]> {
    const results: TransactionResult[] = [];

    for (const txn of transactions) {
      const result = await this.executeTransaction(account, txn);
      results.push(result);
      
      // If any transaction fails, stop execution
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  // Gas estimation
  async estimateGas(
    account: AptosAccount,
    module: string,
    functionName: string,
    typeArguments: string[] = [],
    args: any[] = []
  ): Promise<number> {
    try {
      const transaction = await this.buildTransaction(
        account,
        module,
        functionName,
        typeArguments,
        args,
        { maxGasAmount: 1000000 } // High limit for estimation
      );

      // Simulate the transaction to get gas estimate
      const simulation = await this.client.simulateTransaction(account, transaction);
      return parseInt(simulation[0].gas_used || '0');
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return 10000; // Default fallback
    }
  }

  // Transaction status checking
  async getTransactionStatus(hash: string): Promise<{
    success: boolean;
    gasUsed: number;
    error?: string;
  }> {
    try {
      const txnResult = await this.client.getTransactionByHash(hash);
      return {
        success: txnResult.success,
        gasUsed: parseInt(txnResult.gas_used || '0'),
        error: txnResult.success ? undefined : 'Transaction failed'
      };
    } catch (error) {
      return {
        success: false,
        gasUsed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility methods for serialization
  private serializeValuationData(valuation: any): Uint8Array {
    const serializer = new BCS.Serializer();
    serializer.serializeU64(valuation.score || 0);
    serializer.serializeU64(valuation.market_value || 0);
    serializer.serializeU64(valuation.seo_authority || 0);
    serializer.serializeU64(valuation.traffic_estimate || 0);
    serializer.serializeU64(valuation.brandability || 0);
    serializer.serializeU64(valuation.tld_rarity || 0);
    serializer.serializeU64(valuation.updated_at || Date.now());
    return serializer.getBytes();
  }

  private serializeFractionalConfig(config: any): Uint8Array {
    const serializer = new BCS.Serializer();
    serializer.serializeStr(config.ticker || '');
    serializer.serializeU64(config.total_supply || 0);
    serializer.serializeU64(config.circulating_supply || 0);
    serializer.serializeBool(config.trading_enabled || false);
    return serializer.getBytes();
  }

  // Transaction history
  async getAccountTransactions(
    address: string,
    start?: number,
    limit: number = 25
  ): Promise<any[]> {
    try {
      return await this.client.getAccountTransactions(address, { start, limit });
    } catch (error) {
      console.error('Error fetching account transactions:', error);
      return [];
    }
  }
}