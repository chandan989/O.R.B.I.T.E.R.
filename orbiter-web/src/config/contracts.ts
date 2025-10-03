// O.R.B.I.T.E.R. Smart Contract Configuration
// Allow overriding contract address via Vite env (VITE_CONTRACT_ADDRESS)
const ENV_CONTRACT = (import.meta as any).env?.VITE_CONTRACT_ADDRESS as string | undefined;
const FALLBACK_CONTRACT = "0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c";
if (ENV_CONTRACT && ENV_CONTRACT.length < 10) {
  console.warn('[contracts] Ignoring too-short VITE_CONTRACT_ADDRESS env value');
}
export const CONTRACT_CONFIG = {
  // Deployed contract address on Aptos Testnet (override with VITE_CONTRACT_ADDRESS)
  CONTRACT_ADDRESS: (ENV_CONTRACT && ENV_CONTRACT.length >= 10 ? ENV_CONTRACT : FALLBACK_CONTRACT),
  
  // Network configuration
  NETWORK: "testnet",
  NODE_URL: "https://fullnode.testnet.aptoslabs.com/v1",
  
  // Module names
  MODULES: {
    DOMAIN_REGISTRY: "domain_registry",
    FRACTIONAL: "fractional", 
    MARKETPLACE: "marketplace",
    VALUATION: "valuation",
    SECURITY: "security",
    VALIDATION: "validation"
  },
  
  // Key function names for frontend integration
  FUNCTIONS: {
    // Domain Registry Functions
    CREATE_DOMAIN: "create_domain_object",
    GET_DOMAIN_INFO: "get_domain_info",
    IS_DOMAIN_OWNER: "is_domain_owner",
    GET_REGISTRY_STATS: "get_registry_stats",
    
    // Fractional Functions
    INITIALIZE_FRACTIONAL: "initialize_fractional_ownership",
    TRANSFER_SHARES: "transfer_shares",
    GET_SHARE_BALANCE: "get_share_balance",
    APPROVE_SHARES: "approve_shares",
    
    // Marketplace Functions
    CREATE_LISTING: "create_listing",
    PURCHASE_SHARES: "purchase_shares",
    IS_LISTING_ACTIVE: "is_listing_active",
    GET_LISTING_INFO: "get_listing_info",
    
    // Valuation Functions
    CALCULATE_INITIAL_VALUATION: "calculate_initial_valuation",
    GET_ORACLE_STATS: "get_oracle_stats"
  }
} as const;

// Helper function to build full function IDs
export const buildFunctionId = (module: string, functionName: string): string => {
  return `${CONTRACT_CONFIG.CONTRACT_ADDRESS}::${module}::${functionName}`;
};

// Common function IDs for easy access
export const FUNCTION_IDS = {
  CREATE_DOMAIN: buildFunctionId(CONTRACT_CONFIG.MODULES.DOMAIN_REGISTRY, CONTRACT_CONFIG.FUNCTIONS.CREATE_DOMAIN),
  GET_DOMAIN_INFO: buildFunctionId(CONTRACT_CONFIG.MODULES.DOMAIN_REGISTRY, CONTRACT_CONFIG.FUNCTIONS.GET_DOMAIN_INFO),
  TRANSFER_SHARES: buildFunctionId(CONTRACT_CONFIG.MODULES.FRACTIONAL, CONTRACT_CONFIG.FUNCTIONS.TRANSFER_SHARES),
  CREATE_LISTING: buildFunctionId(CONTRACT_CONFIG.MODULES.MARKETPLACE, CONTRACT_CONFIG.FUNCTIONS.CREATE_LISTING),
  PURCHASE_SHARES: buildFunctionId(CONTRACT_CONFIG.MODULES.MARKETPLACE, CONTRACT_CONFIG.FUNCTIONS.PURCHASE_SHARES)
} as const;