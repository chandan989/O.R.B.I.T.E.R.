import { AptosClient, BCS } from "aptos";
import { CONTRACT_CONFIG, FUNCTION_IDS } from "../config/contracts";
import { 
  ValuationData, 
  FractionalConfig, 
  DomainInfo, 
  ListingInfo, 
  RegistryStats,
  ShareBalance 
} from "../types/contracts";

export class ContractService {
  private client: AptosClient;

  constructor() {
    this.client = new AptosClient(CONTRACT_CONFIG.NODE_URL);
  }

  // Domain Registry Functions - Returns payload for wallet to sign
  createDomainPayload(
    domainName: string,
    verificationHash: string,
    valuation: ValuationData,
    fractionalConfig?: FractionalConfig
  ) {
    console.log("Creating domain payload with:", {
      domainName,
      verificationHash,
      valuation,
      fractionalConfig,
      functionId: FUNCTION_IDS.CREATE_DOMAIN
    });
    
    // Serialize complex structs to BCS bytes for entry function
    const valuationBytes = (() => {
      const s = new BCS.Serializer();
      s.serializeU64(BigInt(valuation.score));
      s.serializeU64(BigInt(valuation.market_value));
      s.serializeU64(BigInt(valuation.seo_authority));
      s.serializeU64(BigInt(valuation.traffic_estimate));
      s.serializeU64(BigInt(valuation.brandability));
      s.serializeU64(BigInt(valuation.tld_rarity));
      s.serializeU64(BigInt(valuation.updated_at));
      return s.getBytes();
    })();

    const fractionalBytes = fractionalConfig ? (() => {
      const s = new BCS.Serializer();
      s.serializeStr(fractionalConfig.ticker);
      s.serializeU64(BigInt(fractionalConfig.total_supply));
      s.serializeU64(BigInt(fractionalConfig.circulating_supply));
      s.serializeBool(!!fractionalConfig.trading_enabled);
      return s.getBytes();
    })() : null;

    const payload = {
      type: "entry_function_payload",
      function: FUNCTION_IDS.CREATE_DOMAIN,
      arguments: [
        domainName,
        verificationHash,
        valuationBytes,
        fractionalBytes
      ],
      type_arguments: []
    };
    
    console.log("Generated payload:", payload);
    return payload;
  }

  async getDomainInfo(domainObject: string): Promise<DomainInfo | null> {
    try {
      const result = await this.client.view({
        function: FUNCTION_IDS.GET_DOMAIN_INFO,
        arguments: [domainObject],
        type_arguments: []
      });
      
      if (result && result.length >= 3) {
        return {
          name: result[0] as string,
          owner: result[1] as string,
          valuation: result[2] as ValuationData
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting domain info:", error);
      return null;
    }
  }

  async isDomainOwner(domainObject: string, address: string): Promise<boolean> {
    try {
      const result = await this.client.view({
        function: `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${CONTRACT_CONFIG.MODULES.DOMAIN_REGISTRY}::is_domain_owner`,
        arguments: [domainObject, address],
        type_arguments: []
      });
      
      return result[0] as boolean;
    } catch (error) {
      console.error("Error checking domain ownership:", error);
      return false;
    }
  }

  // Fractional Ownership Functions
  async initializeFractionalOwnership(
    account: AptosAccount,
    domainObject: string,
    totalSupply: string,
    ticker: string
  ) {
    const payload = {
      function: `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${CONTRACT_CONFIG.MODULES.FRACTIONAL}::initialize_fractional_ownership`,
      arguments: [domainObject, totalSupply, ticker],
      type_arguments: []
    };

    const txnRequest = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);
    
    return transactionRes;
  }

  async transferShares(
    account: AptosAccount,
    domainObject: string,
    to: string,
    amount: string
  ) {
    const payload = {
      function: FUNCTION_IDS.TRANSFER_SHARES,
      arguments: [domainObject, to, amount],
      type_arguments: []
    };

    const txnRequest = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);
    
    return transactionRes;
  }

  async getShareBalance(domainObject: string, holder: string): Promise<string> {
    try {
      const result = await this.client.view({
        function: `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${CONTRACT_CONFIG.MODULES.FRACTIONAL}::get_share_balance`,
        arguments: [domainObject, holder],
        type_arguments: []
      });
      
      return result[0] as string;
    } catch (error) {
      console.error("Error getting share balance:", error);
      return "0";
    }
  }

  // Marketplace Functions
  async createListing(
    account: AptosAccount,
    domainObject: string,
    pricePerShare: string,
    sharesToSell: string
  ) {
    const payload = {
      function: FUNCTION_IDS.CREATE_LISTING,
      arguments: [domainObject, pricePerShare, sharesToSell],
      type_arguments: []
    };

    const txnRequest = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);
    
    return transactionRes;
  }

  async purchaseShares(
    account: AptosAccount,
    listingId: string,
    sharesToBuy: string
  ) {
    const payload = {
      function: FUNCTION_IDS.PURCHASE_SHARES,
      arguments: [listingId, sharesToBuy],
      type_arguments: []
    };

    const txnRequest = await this.client.generateTransaction(account.address(), payload);
    const signedTxn = await this.client.signTransaction(account, txnRequest);
    const transactionRes = await this.client.submitTransaction(signedTxn);
    await this.client.waitForTransaction(transactionRes.hash);
    
    return transactionRes;
  }

  async isListingActive(listingId: string): Promise<boolean> {
    try {
      const result = await this.client.view({
        function: `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${CONTRACT_CONFIG.MODULES.MARKETPLACE}::is_listing_active`,
        arguments: [listingId],
        type_arguments: []
      });
      
      return result[0] as boolean;
    } catch (error) {
      console.error("Error checking listing status:", error);
      return false;
    }
  }

  // Valuation Functions
  async calculateInitialValuation(domainName: string): Promise<ValuationData | null> {
    try {
      // First try to get real-world valuation data
      const { realDomainValuation } = await import('./domainValuationAPI');
      const realValuation = await realDomainValuation.calculateRealValuation(domainName);
      
      console.log(`Real valuation for ${domainName}:`, realValuation);
      return realValuation;
      
    } catch (error) {
      console.warn("Real valuation failed, falling back to smart contract:", error);
      
      // Fallback to smart contract calculation
      try {
        const result = await this.client.view({
          function: `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${CONTRACT_CONFIG.MODULES.VALUATION}::calculate_initial_valuation`,
          arguments: [domainName, "0x"], // Empty verification data for demo
          type_arguments: []
        });
        
        return result[0] as ValuationData;
      } catch (contractError) {
        console.error("Error calculating valuation:", contractError);
        return null;
      }
    }
  }

  // Utility Functions
  async getAccountBalance(address: string): Promise<string> {
    try {
      const resources = await this.client.getAccountResources(address);
      const coinResource = resources.find(r => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
      
      if (coinResource && coinResource.data) {
        const data = coinResource.data as any;
        return data.coin.value;
      }
      return "0";
    } catch (error) {
      console.error("Error getting account balance:", error);
      return "0";
    }
  }

  async getTransactionHistory(address: string, limit: number = 10) {
    try {
      const transactions = await this.client.getAccountTransactions(address, { limit });
      return transactions;
    } catch (error) {
      console.error("Error getting transaction history:", error);
      return [];
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();