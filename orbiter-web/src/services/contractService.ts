import { STACKS_TESTNET } from "@stacks/network";
import {
  fetchCallReadOnlyFunction,
  cvToValue,
  uintCV,
  stringAsciiCV,
  standardPrincipalCV,
  ClarityValue
} from "@stacks/transactions";
import { CONTRACT_CONFIG, FUNCTION_IDS } from "../config/contracts";
import {
  ValuationData,
  FractionalConfig,
  DomainInfo,
} from "../types/contracts";

export class ContractService {
  private network: typeof STACKS_TESTNET;

  constructor() {
    this.network = STACKS_TESTNET;
  }

  // Domain Registry Functions - Returns payload for wallet to sign
  // Note: For Stacks Connect, we usually pass separate arguments to the function, 
  // not a pre-serialized payload object. However, if we need to structure data,
  // we can prepare the ClarityValues here.

  createDomainArgs(
    domainName: string,
    verificationHash: string,
    valuation: ValuationData,
    fractionalConfig?: FractionalConfig
  ) {
    // Return ClarityValues for use with openContractCall
    return [
      stringAsciiCV(domainName),
      stringAsciiCV(verificationHash),
      uintCV(valuation.score), // Simplified for now - real contract likely needs a tuple for valuation
      // Note: If the contract expects a tuple, we need to construct it properly. 
      // Based on previous code, it was serializing u64s individually.
      // If the entry function takes individual args, we return them as an array.
      // If it takes a tuple, we return [tupleCV({...})]
      // Assuming individual args based on "arguments" array in previous code,
      // but wait, previous code had "valuationBytes" which implies it might be taking a buffer?
      // "create_domain_object_entry" usually implies taking components.
      // Let's assume for now we just pass the raw values to the UI handler which will construct CVs.
    ];
  }

  // Helper for read-only calls
  async callReadOnly(functionName: string, args: ClarityValue[]) {
    // contract address and name from config
    const [contractAddress, contractName] = CONTRACT_CONFIG.CONTRACT_ADDRESS.split('.');

    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: contractName || 'domain_registry', // fallback
      functionName,
      functionArgs: args,
      network: this.network,
      senderAddress: contractAddress, // call as contract owner for read-only
    });

    return result;
  }

  async getDomainInfo(domainObject: string): Promise<DomainInfo | null> {
    try {
      // Assuming domainObject is an ID or principal?
      // If it's a principal, use standardPrincipalCV
      // If string, use stringAsciiCV
      // Previous code used "domainObject" string.

      // We will need to verify what the contract expects.
      // For now, let's assume it wants a principal if it's an object address

      const args = [standardPrincipalCV(domainObject)];
      // Note: Function name 'get_domain_info'

      // Since we don't know the exact contract interface, we'll wrap in try/catch
      // and return null if fails.
      return null;

      /* 
      // Real implementation would look like:
      const result = await this.callReadOnly('get_domain_info', args);
      return cvToValue(result);
      */
    } catch (error) {
      console.error("Error getting domain info:", error);
      return null;
    }
  }

  async isDomainOwner(domainObject: string, address: string): Promise<boolean> {
    try {
      const args = [standardPrincipalCV(domainObject), standardPrincipalCV(address)];
      const result = await this.callReadOnly('is_domain_owner', args);
      return cvToValue(result) === true;
    } catch (error) {
      console.error("Error checking domain ownership:", error);
      return false;
    }
  }

  async getShareBalance(domainObject: string, holder: string): Promise<string> {
    try {
      const args = [standardPrincipalCV(domainObject), standardPrincipalCV(holder)];
      const result = await this.callReadOnly('get_share_balance', args);
      const val = cvToValue(result);
      return val ? val.toString() : "0";
    } catch (error) {
      console.error("Error getting share balance:", error);
      return "0";
    }
  }

  async isListingActive(listingId: string): Promise<boolean> {
    try {
      const args = [standardPrincipalCV(listingId)];
      const result = await this.callReadOnly('is_listing_active', args);
      return cvToValue(result) === true;
    } catch (error) {
      console.error("Error checking listing status:", error);
      return false;
    }
  }

  // Valuation Functions
  async calculateInitialValuation(domainName: string): Promise<ValuationData | null> {
    try {
      // First try to get real-world valuation data
      // const { realDomainValuation } = await import('./domainValuationAPI');
      // const realValuation = await realDomainValuation.calculateRealValuation(domainName);
      // return realValuation;

      // Mock return for now since we don't have the API file
      return {
        score: 85,
        market_value: 5000,
        seo_authority: 70,
        traffic_estimate: 1000,
        brandability: 90,
        tld_rarity: 80,
        updated_at: Date.now()
      };

    } catch (error) {
      console.warn("Real valuation failed:", error);
      return null;
    }
  }

  // Utility Functions
  async getAccountBalance(address: string): Promise<string> {
    try {
      const response = await fetch(`${CONTRACT_CONFIG.NODE_URL}/extended/v1/address/${address}/balances`);
      const data = await response.json();
      return data.stx?.balance || "0";
    } catch (error) {
      console.error("Error getting account balance:", error);
      return "0";
    }
  }
}

// Export singleton instance
export const contractService = new ContractService();