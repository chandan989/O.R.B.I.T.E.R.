// Usage examples for ORBITER frontend integration

import { AptosAccount } from 'aptos';
import { OrbiterSDK, utils } from './index';

// Example 1: Initialize SDK and create a domain
export async function exampleCreateDomain() {
  // Initialize SDK (will auto-load from deployment or environment)
  const sdk = await OrbiterSDK.create();
  if (!sdk) {
    console.error('Failed to initialize SDK');
    return;
  }

  // Create account (in real app, this would come from wallet)
  const account = new AptosAccount();

  // Create domain payload
  const domainPayload = {
    domain_name: 'example.com',
    verification_hash: 'dns_verification_hash_here',
    valuation: {
      score: 850,
      market_value: utils.parseAPT('500000'), // 500K APT
      seo_authority: 800,
      traffic_estimate: 900,
      brandability: 850,
      tld_rarity: 800,
      updated_at: Date.now()
    },
    fractional_config: {
      ticker: 'EXMPL',
      total_supply: 1000000,
      circulating_supply: 1000000,
      trading_enabled: true
    }
  };

  try {
    // Create domain
    const result = await sdk.contract.createDomainObject(account, domainPayload);
    console.log('Domain created:', result);

    // Get explorer URL for transaction
    const explorerUrl = sdk.getExplorerUrl('txn', result);
    console.log('View on explorer:', explorerUrl);
  } catch (error) {
    console.error('Error creating domain:', error);
  }
}

// Example 2: Create marketplace listing
export async function exampleCreateListing() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  const account = new AptosAccount();
  const domainObject = '0x123...'; // Domain object address

  const listingPayload = {
    domain_object: domainObject,
    price_per_share: utils.parseAPT('100'), // 100 APT per share
    shares_to_sell: 10000 // 1% of total supply
  };

  try {
    const result = await sdk.contract.createListing(account, listingPayload);
    console.log('Listing created:', result);
  } catch (error) {
    console.error('Error creating listing:', error);
  }
}

// Example 3: Buy shares from marketplace
export async function exampleBuyShares() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  const account = new AptosAccount();
  const listingObject = '0x456...'; // Listing object address

  const buyPayload = {
    listing_object: listingObject,
    shares_to_buy: 1000
  };

  try {
    const result = await sdk.contract.buyShares(account, buyPayload);
    console.log('Shares purchased:', result);
  } catch (error) {
    console.error('Error buying shares:', error);
  }
}

// Example 4: Get marketplace statistics
export async function exampleGetMarketplaceStats() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  try {
    const stats = await sdk.contract.getMarketplaceStats();
    console.log('Marketplace Stats:');
    console.log(`Total Volume: ${utils.formatAPT(stats.total_volume)} APT`);
    console.log(`Active Listings: ${stats.active_listings}`);
    console.log(`Total Trades: ${stats.total_trades}`);
    console.log(`Total Domains: ${stats.total_domains}`);
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Example 5: Listen to events
export async function exampleListenToEvents() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  // Listen to domain tokenization events
  const domainEvents = await sdk.events.getDomainTokenizedEvents();
  console.log('Recent domain tokenizations:', domainEvents);

  // Listen to trade events for a specific domain
  const domainObject = '0x123...';
  const tradeEvents = await sdk.events.getTradeExecutedEvents(domainObject);
  console.log('Trade history for domain:', tradeEvents);

  // Subscribe to real-time events
  const unsubscribe = sdk.events.subscribeToEvents(
    ['TradeExecutedEvent', 'DomainTokenizedEvent'],
    (event) => {
      console.log('New event:', event);
    },
    (event) => {
      // Filter for events we care about
      return event.data.domain_object === domainObject;
    }
  );

  // Unsubscribe after 1 minute
  setTimeout(() => {
    unsubscribe();
    console.log('Unsubscribed from events');
  }, 60000);
}

// Example 6: Using React hook
export function ExampleReactComponent() {
  // This would be in a React component file
  /*
  import { useOrbiter } from '../hooks/useOrbiter';
  import { AptosAccount } from 'aptos';

  function DomainCreator() {
    const {
      sdk,
      isLoading,
      isConfigured,
      error,
      createDomain,
      getMarketplaceStats
    } = useOrbiter({
      packageAddress: '0x123...',
      network: 'testnet',
      autoLoad: true
    });

    const [stats, setStats] = useState(null);

    useEffect(() => {
      if (isConfigured) {
        getMarketplaceStats().then(setStats);
      }
    }, [isConfigured, getMarketplaceStats]);

    const handleCreateDomain = async () => {
      const account = new AptosAccount(); // Get from wallet
      
      const payload = {
        domain_name: 'mydomain.com',
        verification_hash: 'hash123',
        valuation: {
          score: 800,
          market_value: 100000,
          seo_authority: 750,
          traffic_estimate: 850,
          brandability: 800,
          tld_rarity: 800,
          updated_at: Date.now()
        }
      };

      const result = await createDomain(account, payload);
      if (result.success) {
        console.log('Domain created successfully!');
      } else {
        console.error('Failed to create domain:', result.error);
      }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!isConfigured) return <div>Not configured</div>;

    return (
      <div>
        <h2>ORBITER Domain Creator</h2>
        {stats && (
          <div>
            <p>Total Volume: {stats.total_volume} APT</p>
            <p>Active Listings: {stats.active_listings}</p>
          </div>
        )}
        <button onClick={handleCreateDomain}>
          Create Domain
        </button>
      </div>
    );
  }
  */
}

// Example 7: Batch operations
export async function exampleBatchOperations() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  const account = new AptosAccount();

  // Build multiple transactions
  const transactions = await sdk.transactions.buildBatchTransaction(
    account,
    [
      {
        module: 'fractional',
        functionName: 'transfer_shares',
        args: ['0x123...', '0x456...', 1000]
      },
      {
        module: 'marketplace',
        functionName: 'create_listing',
        args: ['0x123...', 100, 5000]
      }
    ]
  );

  // Execute batch
  const results = await sdk.transactions.executeBatchTransactions(account, transactions);
  console.log('Batch results:', results);
}

// Example 8: Gas estimation
export async function exampleGasEstimation() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  const account = new AptosAccount();

  // Estimate gas for domain creation
  const gasEstimate = await sdk.transactions.estimateGas(
    account,
    'domain_registry',
    'create_domain_object',
    [],
    ['example.com', 'hash123', {}, null]
  );

  console.log(`Estimated gas: ${gasEstimate} units`);
  console.log(`Estimated cost: ${utils.formatAPT(gasEstimate * 100)} APT`);
}

// Example 9: Error handling
export async function exampleErrorHandling() {
  const sdk = await OrbiterSDK.create();
  if (!sdk) return;

  const account = new AptosAccount();

  try {
    // Attempt to create domain with invalid data
    const result = await sdk.contract.createDomainObject(account, {
      domain_name: '', // Invalid empty name
      verification_hash: 'hash123',
      valuation: {
        score: 0,
        market_value: 0,
        seo_authority: 0,
        traffic_estimate: 0,
        brandability: 0,
        tld_rarity: 0,
        updated_at: 0
      }
    });

    if (!result) {
      console.error('Transaction failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      
      // Handle specific error types
      if (error.message.includes('DOMAIN_ALREADY_EXISTS')) {
        console.log('Domain already exists, try a different name');
      } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
        console.log('Insufficient balance, please fund your account');
      }
    }
  }
}

// Example 10: Configuration management
export async function exampleConfigManagement() {
  // Load configuration from different sources
  const sdk1 = await OrbiterSDK.create('0x123...', 'testnet');
  
  // Update configuration
  const newConfig = {
    package_address: '0x456...',
    network: 'mainnet' as const,
    node_url: 'https://fullnode.mainnet.aptoslabs.com/v1'
  };

  if (sdk1) {
    const success = sdk1.updateConfig(newConfig);
    console.log('Config updated:', success);
  }

  // Get network info
  if (sdk1) {
    const networkInfo = sdk1.getNetworkInfo();
    console.log('Network info:', networkInfo);
  }
}