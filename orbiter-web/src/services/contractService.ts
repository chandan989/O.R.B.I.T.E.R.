import {
  uintCV,
  stringAsciiCV,
  standardPrincipalCV,
  tupleCV,
  bufferCV
} from '@stacks/transactions';
import { ValuationData, FractionalConfig } from '../types/contracts';

/**
 * Service for interacting with O.R.B.I.T.E.R. smart contracts on Stacks.
 * Provides helper functions to prepare transaction arguments and parse responses.
 */
class ContractService {
  /**
   * Prepare arguments for creating a domain object entry
   * Matches the contract function signature:
   * (domain-name, verification-hash, valuation-score, market-value, seo-authority, traffic-estimate)
   */
  createDomainArgs(
    domainName: string,
    verificationHash: string,
    valuation: ValuationData,
    fractionalConfig?: FractionalConfig
  ) {
    // Return ClarityValues matching contract signature
    return [
      stringAsciiCV(domainName),
      stringAsciiCV(verificationHash),
      uintCV(Number(valuation.score) || 0),
      uintCV(Number(valuation.market_value) || 0),
      uintCV(Number(valuation.seo_authority) || 0),
      uintCV(Number(valuation.traffic_estimate) || 0)
    ];
  }

  /**
   * Prepare arguments for initializing fractional ownership
   */
  initializeFractionalArgs(
    domainObject: string,
    ticker: string,
    totalSupply: number
  ) {
    return [
      standardPrincipalCV(domainObject),
      stringAsciiCV(ticker),
      uintCV(totalSupply)
    ];
  }

  /**
   * Prepare arguments for transferring shares
   */
  transferSharesArgs(
    domainObject: string,
    recipient: string,
    amount: number
  ) {
    return [
      standardPrincipalCV(domainObject),
      standardPrincipalCV(recipient),
      uintCV(amount)
    ];
  }

  /**
   * Prepare arguments for creating a marketplace listing
   */
  createListingArgs(
    domainObject: string,
    pricePerShare: number,
    sharesToSell: number
  ) {
    return [
      standardPrincipalCV(domainObject),
      uintCV(pricePerShare),
      uintCV(sharesToSell)
    ];
  }

  /**
   * Prepare arguments for purchasing shares
   */
  purchaseSharesArgs(
    listingId: number,
    sharesToBuy: number
  ) {
    return [
      uintCV(listingId),
      uintCV(sharesToBuy)
    ];
  }

  /**
   * Parse valuation data from contract response
   */
  parseValuationData(data: any): ValuationData {
    return {
      score: data.score?.value || '0',
      market_value: data.market_value?.value || '0',
      seo_authority: data.seo_authority?.value || '0',
      traffic_estimate: data.traffic_estimate?.value || '0',
      brandability: data.brandability?.value || '0',
      tld_rarity: data.tld_rarity?.value || '0',
      updated_at: data.updated_at?.value || '0'
    };
  }

  /**
   * Parse fractional config from contract response
   */
  parseFractionalConfig(data: any): FractionalConfig {
    return {
      ticker: data.ticker?.value || '',
      total_supply: data.total_supply?.value || '0',
      circulating_supply: data.circulating_supply?.value || '0',
      trading_enabled: data.trading_enabled?.value || false
    };
  }

  /**
   * Generate a verification hash for domain ownership
   */
  generateVerificationHash(domainName: string, ownerAddress: string): string {
    // Simple hash generation - in production, use a more secure method
    const combined = `${domainName}-${ownerAddress}-${Date.now()}`;
    return Buffer.from(combined).toString('hex').substring(0, 64);
  }

  /**
   * Validate domain name format
   */
  isValidDomainName(domain: string): boolean {
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    return domainRegex.test(domain) && domain.length <= 256;
  }

  /**
   * Validate ticker symbol format
   */
  isValidTicker(ticker: string): boolean {
    const tickerRegex = /^[A-Z]{2,10}$/;
    return tickerRegex.test(ticker);
  }

  /**
   * Convert micro-units to regular units (for display)
   */
  fromMicroUnits(microUnits: number | string): number {
    return Number(microUnits) / 1_000_000;
  }

  /**
   * Convert regular units to micro-units (for contract calls)
   */
  toMicroUnits(units: number): number {
    return Math.floor(units * 1_000_000);
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;