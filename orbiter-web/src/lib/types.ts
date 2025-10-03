// TypeScript interfaces matching Move structs for ORBITER smart contracts

export interface ValuationData {
  score: number;
  market_value: number;
  seo_authority: number;
  traffic_estimate: number;
  brandability: number;
  tld_rarity: number;
  updated_at: number;
}

export interface FractionalConfig {
  ticker: string;
  total_supply: number;
  circulating_supply: number;
  trading_enabled: boolean;
}

export interface DomainAsset {
  domain_name: string;
  original_owner: string;
  verification_hash: string;
  created_at: number;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
}

export interface ShareOwnership {
  domain_object: string; // Object address
  balances: Record<string, number>;
  total_shares: number;
  transfer_events: ShareTransferEvent[];
}

export interface ShareTransferEvent {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export interface ShareListing {
  domain_object: string; // Object address
  seller: string;
  price_per_share: number;
  shares_available: number;
  created_at: number;
  active: boolean;
}

export interface Marketplace {
  active_listings: string[]; // Object addresses
  trading_fee_bps: number;
  fee_collector: string;
  total_volume: number;
  paused: boolean;
}

export interface TradeEvent {
  domain_object: string;
  buyer: string;
  seller: string;
  shares_traded: number;
  price_per_share: number;
  total_amount: number;
  fee_amount: number;
  timestamp: number;
}

export interface DomainRegistry {
  total_domains: number;
  domain_objects: Record<string, string>; // domain_name -> object_address
  admin: string;
  paused: boolean;
}

export interface ValuationOracle {
  authorized_oracles: string[];
  min_consensus: number;
  update_frequency: number;
}

export interface PendingValuation {
  domain_object: string;
  proposed_valuation: ValuationData;
  oracle_votes: Record<string, boolean>;
  votes_count: number;
  expires_at: number;
}

// Event types for contract events
export interface DomainTokenizedEvent {
  domain_object: string;
  domain_name: string;
  owner: string;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
  timestamp: number;
}

export interface OwnershipTransferredEvent {
  domain_object: string;
  from: string;
  to: string;
  timestamp: number;
}

export interface ListingCreatedEvent {
  listing_object: string;
  domain_object: string;
  seller: string;
  price_per_share: number;
  shares_available: number;
  timestamp: number;
}

export interface TradeExecutedEvent {
  listing_object: string;
  domain_object: string;
  buyer: string;
  seller: string;
  shares_traded: number;
  price_per_share: number;
  total_amount: number;
  fee_amount: number;
  timestamp: number;
}

// API response types
export interface DomainInfo {
  object_address: string;
  domain_asset: DomainAsset;
  share_ownership?: ShareOwnership;
  active_listings: ShareListing[];
}

export interface MarketplaceStats {
  total_volume: number;
  active_listings: number;
  total_trades: number;
  total_domains: number;
}

export interface UserPortfolio {
  owned_domains: DomainInfo[];
  share_holdings: Array<{
    domain_object: string;
    domain_name: string;
    shares: number;
    current_value: number;
  }>;
  active_listings: ShareListing[];
  trade_history: TradeEvent[];
}

// Transaction payload types
export interface CreateDomainPayload {
  domain_name: string;
  verification_hash: string;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
}

export interface TransferSharesPayload {
  domain_object: string;
  to: string;
  amount: number;
}

export interface CreateListingPayload {
  domain_object: string;
  price_per_share: number;
  shares_to_sell: number;
}

export interface BuySharesPayload {
  listing_object: string;
  shares_to_buy: number;
}

// Configuration types
export interface ContractConfig {
  package_address: string;
  network: 'testnet' | 'mainnet' | 'devnet';
  node_url: string;
  faucet_url?: string;
}

export interface DeploymentInfo {
  package_address: string;
  account_address: string;
  network: string;
  deployed_at: string;
  buyer_address?: string;
  seller_address?: string;
}