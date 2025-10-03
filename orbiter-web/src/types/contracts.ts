// TypeScript types generated from deployed smart contract ABI

export interface ValuationData {
  score: string;
  market_value: string;
  seo_authority: string;
  traffic_estimate: string;
  brandability: string;
  tld_rarity: string;
  updated_at: string;
}

export interface FractionalConfig {
  ticker: string;
  total_supply: string;
  circulating_supply: string;
  trading_enabled: boolean;
}

export interface DomainAsset {
  domain_name: string;
  original_owner: string;
  verification_hash: string;
  created_at: string;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
}

export interface DomainInfo {
  name: string;
  owner: string;
  valuation: ValuationData;
}

export interface ListingInfo {
  id: string;
  seller: string;
  domain_object: string;
  price_per_share: string;
  shares_available: string;
  total_shares: string;
  created_at: string;
  active: boolean;
}

export interface RegistryStats {
  total_domains: string;
  active_domains: string;
  total_value_locked: string;
  admin: string;
  paused: boolean;
}

export interface ShareBalance {
  holder: string;
  balance: string;
  domain_object: string;
}

// Event types
export interface DomainTokenizedEvent {
  domain_object: string;
  domain_name: string;
  owner: string;
  verification_hash: string;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
  timestamp: string;
}

export interface ShareTransferEvent {
  domain_object: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
}

export interface ListingCreatedEvent {
  listing_id: string;
  seller: string;
  domain_object: string;
  price_per_share: string;
  shares_to_sell: string;
  timestamp: string;
}

// Transaction payload types
export interface CreateDomainPayload {
  function: string;
  arguments: [string, string, ValuationData, FractionalConfig?];
  type_arguments: [];
}

export interface TransferSharesPayload {
  function: string;
  arguments: [string, string, string]; // domain_object, to, amount
  type_arguments: [];
}

export interface CreateListingPayload {
  function: string;
  arguments: [string, string, string]; // domain_object, price_per_share, shares_to_sell
  type_arguments: [];
}