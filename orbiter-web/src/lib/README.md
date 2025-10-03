# ORBITER Frontend Integration Library

This library provides TypeScript utilities for integrating with ORBITER smart contracts on Aptos. It includes type definitions, contract interaction helpers, event handling, transaction building, and React hooks.

## Installation

The library is included in the ORBITER frontend project. For external projects, you would install the required dependencies:

```bash
npm install aptos
```

## Quick Start

### Basic Setup

```typescript
import { OrbiterSDK } from './lib';

// Initialize SDK (auto-loads from deployment or environment)
const sdk = await OrbiterSDK.create();

// Or initialize with specific configuration
const sdk = await OrbiterSDK.create('0x123...', 'testnet');
```

### React Hook Usage

```typescript
import { useOrbiter } from './hooks/useOrbiter';

function MyComponent() {
  const {
    sdk,
    isLoading,
    isConfigured,
    createDomain,
    getMarketplaceStats
  } = useOrbiter({
    packageAddress: '0x123...',
    network: 'testnet',
    autoLoad: true
  });

  // Use the hook methods...
}
```

## Core Components

### 1. OrbiterContract

Main contract interaction class with methods for all smart contract functions.

```typescript
import { OrbiterContract } from './lib';

const contract = new OrbiterContract(config);

// Create domain
const result = await contract.createDomainObject(account, {
  domain_name: 'example.com',
  verification_hash: 'hash123',
  valuation: { /* valuation data */ },
  fractional_config: { /* fractional config */ }
});

// Get domain info
const domainInfo = await contract.getDomainInfo(domainObject);

// Get marketplace stats
const stats = await contract.getMarketplaceStats();
```

### 2. EventHandler

Event parsing and subscription utilities.

```typescript
import { EventHandler } from './lib';

const events = new EventHandler(config);

// Get recent events
const domainEvents = await events.getDomainTokenizedEvents();
const tradeEvents = await events.getTradeExecutedEvents(domainObject);

// Subscribe to real-time events
const unsubscribe = events.subscribeToEvents(
  ['TradeExecutedEvent'],
  (event) => console.log('New trade:', event)
);
```

### 3. TransactionBuilder

Transaction building and execution utilities.

```typescript
import { TransactionBuilder } from './lib';

const txBuilder = new TransactionBuilder(config);

// Build transaction
const transaction = await txBuilder.buildCreateDomainTransaction(
  account,
  'example.com',
  'hash123',
  valuation,
  fractionalConfig
);

// Execute transaction
const result = await txBuilder.executeTransaction(account, transaction);

// Estimate gas
const gasEstimate = await txBuilder.estimateGas(
  account,
  'domain_registry',
  'create_domain_object',
  [],
  args
);
```

### 4. ConfigManager

Configuration management and utilities.

```typescript
import { configManager, utils } from './lib';

// Load configuration
const config = await configManager.loadFromDeployment();

// Format utilities
const formatted = utils.formatAPT(1000000000); // "10.00 APT"
const parsed = utils.parseAPT('10.5'); // 1050000000
const shortened = utils.shortenAddress('0x123...abc'); // "0x123...abc"
```

## API Reference

### Types

#### Core Data Types

```typescript
interface DomainAsset {
  domain_name: string;
  original_owner: string;
  verification_hash: string;
  created_at: number;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
}

interface ValuationData {
  score: number;
  market_value: number;
  seo_authority: number;
  traffic_estimate: number;
  brandability: number;
  tld_rarity: number;
  updated_at: number;
}

interface ShareListing {
  domain_object: string;
  seller: string;
  price_per_share: number;
  shares_available: number;
  created_at: number;
  active: boolean;
}
```

#### Event Types

```typescript
interface DomainTokenizedEvent {
  domain_object: string;
  domain_name: string;
  owner: string;
  valuation: ValuationData;
  fractional_config?: FractionalConfig;
  timestamp: number;
}

interface TradeExecutedEvent {
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
```

### Contract Methods

#### Domain Registry

```typescript
// Create domain object
createDomainObject(account: AptosAccount, payload: CreateDomainPayload): Promise<string>

// Transfer domain ownership
transferDomain(account: AptosAccount, domainObject: string, newOwner: string): Promise<string>

// Get domain information
getDomainInfo(domainObject: string): Promise<DomainInfo | null>

// Check if domain exists
domainExists(domainName: string): Promise<boolean>
```

#### Fractional Ownership

```typescript
// Initialize fractional ownership
initializeFractionalOwnership(account: AptosAccount, domainObject: string, totalSupply: number, ticker: string): Promise<string>

// Transfer shares
transferShares(account: AptosAccount, payload: TransferSharesPayload): Promise<string>

// Get share balance
getShareBalance(domainObject: string, owner: string): Promise<number>

// Get total supply
getTotalSupply(domainObject: string): Promise<number>
```

#### Marketplace

```typescript
// Create listing
createListing(account: AptosAccount, payload: CreateListingPayload): Promise<string>

// Buy shares
buyShares(account: AptosAccount, payload: BuySharesPayload): Promise<string>

// Cancel listing
cancelListing(account: AptosAccount, listingObject: string): Promise<string>

// Get marketplace statistics
getMarketplaceStats(): Promise<MarketplaceStats>
```

### React Hook

```typescript
const {
  // State
  sdk,
  isLoading,
  isConfigured,
  error,
  config,
  
  // Actions
  initialize,
  updateConfig,
  
  // Domain operations
  createDomain,
  transferDomain,
  getDomainInfo,
  checkDomainExists,
  
  // Fractional operations
  initializeFractional,
  transferShares,
  getShareBalance,
  getTotalSupply,
  
  // Marketplace operations
  createListing,
  buyShares,
  cancelListing,
  getMarketplaceStats,
  
  // Utilities
  getExplorerUrl,
  getFaucetUrl
} = useOrbiter(options);
```

## Configuration

### Environment Variables

```bash
VITE_PACKAGE_ADDRESS=0x123...
VITE_NETWORK=testnet
VITE_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
VITE_FAUCET_URL=https://faucet.testnet.aptoslabs.com
```

### Deployment File

The library can auto-load configuration from `.env.deployment`:

```
PACKAGE_ADDRESS=0x123...
ACCOUNT_ADDRESS=0x456...
NETWORK=testnet
DEPLOYED_AT=2024-01-01T00:00:00Z
```

### Manual Configuration

```typescript
const config: ContractConfig = {
  package_address: '0x123...',
  network: 'testnet',
  node_url: 'https://fullnode.testnet.aptoslabs.com/v1',
  faucet_url: 'https://faucet.testnet.aptoslabs.com'
};

const sdk = new OrbiterSDK(config);
```

## Examples

### Creating a Domain

```typescript
import { useOrbiter, utils } from './lib';

function CreateDomainForm() {
  const { createDomain, isConfigured } = useOrbiter({ autoLoad: true });
  
  const handleSubmit = async (formData) => {
    const account = getWalletAccount(); // Get from wallet
    
    const payload = {
      domain_name: formData.domain,
      verification_hash: formData.verificationHash,
      valuation: {
        score: 850,
        market_value: utils.parseAPT(formData.value),
        seo_authority: 800,
        traffic_estimate: 900,
        brandability: 850,
        tld_rarity: 800,
        updated_at: Date.now()
      },
      fractional_config: {
        ticker: formData.ticker,
        total_supply: formData.totalSupply,
        circulating_supply: formData.totalSupply,
        trading_enabled: true
      }
    };
    
    const result = await createDomain(account, payload);
    if (result.success) {
      console.log('Domain created!', result.hash);
    }
  };
  
  // Render form...
}
```

### Marketplace Trading

```typescript
function TradingInterface() {
  const { buyShares, getMarketplaceStats } = useOrbiter({ autoLoad: true });
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    getMarketplaceStats().then(setStats);
  }, []);
  
  const handleBuy = async (listingObject, shares) => {
    const account = getWalletAccount();
    const result = await buyShares(account, {
      listing_object: listingObject,
      shares_to_buy: shares
    });
    
    if (result.success) {
      console.log('Shares purchased!');
      // Refresh stats
      getMarketplaceStats().then(setStats);
    }
  };
  
  // Render trading interface...
}
```

### Event Monitoring

```typescript
function EventMonitor() {
  const { sdk } = useOrbiter({ autoLoad: true });
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    if (!sdk) return;
    
    const unsubscribe = sdk.events.subscribeToEvents(
      ['TradeExecutedEvent', 'DomainTokenizedEvent'],
      (event) => {
        setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50
      }
    );
    
    return unsubscribe;
  }, [sdk]);
  
  // Render events...
}
```

## Error Handling

The library provides comprehensive error handling:

```typescript
try {
  const result = await createDomain(account, payload);
  if (!result.success) {
    console.error('Transaction failed:', result.error);
    
    // Handle specific errors
    if (result.error?.includes('DOMAIN_ALREADY_EXISTS')) {
      showError('Domain already exists');
    } else if (result.error?.includes('INSUFFICIENT_BALANCE')) {
      showError('Insufficient balance');
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Utilities

### Formatting

```typescript
import { utils } from './lib';

// Format APT amounts
utils.formatAPT(1000000000); // "10.00 APT"
utils.formatAPT(1500000000); // "15.00 APT"

// Parse APT amounts
utils.parseAPT('10.5'); // 1050000000

// Address utilities
utils.shortenAddress('0x123...abc'); // "0x123...abc"
utils.isValidAddress('0x123...'); // boolean

// Time formatting
utils.formatTimestamp(1640995200); // "Jan 1, 2022, 12:00:00 AM"

// Percentage calculations
utils.calculatePercentage(25, 100); // 25
utils.formatPercentage(25.5); // "25.50%"
```

## Testing

The library includes comprehensive examples and can be tested with:

```typescript
import { exampleCreateDomain, exampleGetMarketplaceStats } from './lib/examples';

// Run examples
await exampleCreateDomain();
await exampleGetMarketplaceStats();
```

## Support

For issues or questions:
- Check the examples in `examples.ts`
- Review the type definitions in `types.ts`
- Consult the Aptos documentation: https://aptos.dev