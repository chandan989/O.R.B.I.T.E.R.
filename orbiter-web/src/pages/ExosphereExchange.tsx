import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  ArrowUp,
  ArrowDown,
  Info,
  TrendingUp,
  BookOpen,
  History,
  BarChart,
  Sparkles,
  ShieldCheck,
  User,
  AlertTriangle,
} from "lucide-react";
import { useWallet } from "../components/Layout";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useContract } from "../hooks/useContract";
import { CONTRACT_CONFIG } from "../config/contracts";
import { domainStorage, DomainRecord } from "../services/domainStorage";
import { portfolioService } from "../services/portfolioService";

// --- Helper Components ---
const MainPerformanceChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return <div className="h-64 w-full bg-secondary/20 rounded-lg flex items-center justify-center"><p className="font-ibm-plex-mono text-muted-foreground">No price data available</p></div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / (max - min)) * 90 + 5}`).join(' ');
  const isUp = data[data.length - 1] >= data[0];

  return (
    <div className="h-64 w-full relative">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isUp ? '#FFC700' : '#FE6440'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isUp ? '#FFC700' : '#FE6440'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polyline
          fill="url(#chart-gradient)"
          stroke={isUp ? '#FFC700' : '#FE6440'}
          strokeWidth="2"
          points={`0,100 ${points} 100,100`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

// --- Real Asset Data Interface ---
interface Asset {
  id: string;
  domain: string;
  description: string;
  owner?: string; // Add owner field
  attributes: Array<{ trait_type: string; value: string }>;
  listingPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  priceHistory: number[];
  orderBook: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
  tradeHistory: Array<{ price: number; size: number; time: string, side: 'buy' | 'sell' }>;
  valuation: {
    score: number;
    marketValue: number;
    seoAuthority: number;
    trafficEstimate: number;
    brandability: number;
    tldRarity: number;
  };
  tokenization: {
    tokenTicker: string;
    totalSupply: number;
  };
  originalDomain?: DomainRecord; // Reference to original domain data
}

// Convert DomainRecord to tradeable Asset
const convertDomainToAsset = (domain: DomainRecord): Asset => {
  // Generate realistic order book
  const basePrice = domain.marketData.floorPrice;
  const spread = basePrice * 0.02; // 2% spread

  const orderBook = {
    bids: [
      { price: basePrice - spread * 0.5, size: Math.floor(Math.random() * 50) + 10 },
      { price: basePrice - spread * 1.0, size: Math.floor(Math.random() * 75) + 15 },
      { price: basePrice - spread * 1.5, size: Math.floor(Math.random() * 100) + 20 },
      { price: basePrice - spread * 2.0, size: Math.floor(Math.random() * 125) + 25 }
    ],
    asks: [
      { price: basePrice + spread * 0.5, size: Math.floor(Math.random() * 40) + 8 },
      { price: basePrice + spread * 1.0, size: Math.floor(Math.random() * 60) + 12 },
      { price: basePrice + spread * 1.5, size: Math.floor(Math.random() * 80) + 18 },
      { price: basePrice + spread * 2.0, size: Math.floor(Math.random() * 100) + 22 }
    ]
  };

  // Generate recent trade history
  const tradeHistory = Array.from({ length: 5 }, (_, i) => {
    const time = new Date(Date.now() - (i * 15 * 60 * 1000)); // 15 min intervals
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false }).slice(0, 8);
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = basePrice + (Math.random() - 0.5) * spread;

    return {
      price: Math.round(price * 100) / 100,
      size: Math.floor(Math.random() * 20) + 1,
      time: timeStr,
      side: side as 'buy' | 'sell'
    };
  });

  // Calculate price changes
  const priceChange24h = (Math.random() - 0.5) * 4; // -2 to +2 USDCx
  const priceChangePercent24h = (priceChange24h / basePrice) * 100;

  return {
    id: domain.id,
    domain: domain.domain,
    description: domain.metadata.description,
    attributes: domain.metadata.attributes,
    listingPrice: basePrice,
    priceChange24h,
    priceChangePercent24h,
    volume24h: domain.marketData.dailyVolume,
    marketCap: domain.valuation.marketValue * domain.tokenization.totalSupply,
    priceHistory: domain.marketData.priceHistory,
    orderBook,
    tradeHistory,
    valuation: domain.valuation,
    tokenization: domain.tokenization,
    originalDomain: domain,
    owner: domain.owner // Add owner to asset
  };
};

// Fallback mock assets if no real domains exist
const fallbackAssets: Asset[] = [
  {
    id: "ORBIT-DEMO1",
    domain: "blockchain-hub.com",
    description: "A premium domain for the decentralized world, representing a central hub for blockchain innovation and news.",
    attributes: [
      { trait_type: "TLD", value: ".com" },
      { trait_type: "Length", value: "14" },
    ],
    listingPrice: 0.125,
    priceChange24h: 0.012,
    priceChangePercent24h: 10.6,
    volume24h: 452,
    marketCap: 1250,
    priceHistory: [0.113, 0.115, 0.114, 0.118, 0.120, 0.122, 0.125],
    orderBook: {
      bids: [{ price: 0.1245, size: 10 }, { price: 0.124, size: 15 }, { price: 0.1235, size: 20 }, { price: 0.123, size: 25 }],
      asks: [{ price: 0.1255, size: 8 }, { price: 0.126, size: 12 }, { price: 0.1265, size: 18 }, { price: 0.127, size: 22 }],
    },
    tradeHistory: [{ price: 0.125, size: 5, time: "14:30:15", side: 'buy' }, { price: 0.1248, size: 3, time: "14:29:55", side: 'sell' }],
    valuation: { score: 820, marketValue: 125000, seoAuthority: 60000, trafficEstimate: 40000, brandability: 20000, tldRarity: 5000 },
    tokenization: { tokenTicker: "BLH", totalSupply: 125000 },
  },
  {
    id: "ORBIT-DEMO2",
    domain: "ai-future.org",
    description: "Premium domain for artificial intelligence and future technology ventures.",
    attributes: [
      { trait_type: "TLD", value: ".org" },
      { trait_type: "Length", value: "9" },
    ],
    listingPrice: 0.087,
    priceChange24h: -0.004,
    priceChangePercent24h: -4.9,
    volume24h: 289,
    marketCap: 875,
    priceHistory: [0.098, 0.096, 0.092, 0.089, 0.087, 0.088, 0.087],
    orderBook: {
      bids: [{ price: 0.087, size: 12 }, { price: 0.0865, size: 18 }, { price: 0.086, size: 25 }],
      asks: [{ price: 0.088, size: 10 }, { price: 0.0885, size: 15 }, { price: 0.089, size: 20 }],
    },
    tradeHistory: [{ price: 0.087, size: 8, time: "14:25:30", side: 'sell' }, { price: 0.0878, size: 4, time: "14:24:10", side: 'buy' }],
    valuation: { score: 720, marketValue: 87500, seoAuthority: 45000, trafficEstimate: 32500, brandability: 10000, tldRarity: 0 },
    tokenization: { tokenTicker: "AIFUT", totalSupply: 87500 },
  },
  {
    id: "ORBIT-DEMO3",
    domain: "crypto-exchange.io",
    description: "High-value domain perfect for cryptocurrency trading platforms and DeFi applications.",
    attributes: [
      { trait_type: "TLD", value: ".io" },
      { trait_type: "Length", value: "15" },
    ],
    listingPrice: 0.25,
    priceChange24h: 0.0375,
    priceChangePercent24h: 17.6,
    volume24h: 125000,
    marketCap: 2500,
    priceHistory: [0.195, 0.212, 0.228, 0.235, 0.241, 0.248, 0.25],
    orderBook: {
      bids: [{ price: 0.249, size: 5 }, { price: 0.248, size: 8 }, { price: 0.247, size: 12 }],
      asks: [{ price: 0.251, size: 6 }, { price: 0.252, size: 10 }, { price: 0.253, size: 15 }],
    },
    tradeHistory: [{ price: 0.25, size: 3, time: "14:35:45", side: 'buy' }, { price: 0.2495, size: 7, time: "14:33:20", side: 'buy' }],
    valuation: { score: 950, marketValue: 250000, seoAuthority: 80000, trafficEstimate: 95000, brandability: 60000, tldRarity: 15000 },
    tokenization: { tokenTicker: "CXIO", totalSupply: 250000 },
  },
  {
    id: "ORBIT-DEMO4",
    domain: "metaverse-land.xyz",
    description: "Revolutionary domain for virtual world and metaverse real estate platforms.",
    attributes: [
      { trait_type: "TLD", value: ".xyz" },
      { trait_type: "Length", value: "14" },
    ],
    listingPrice: 0.065,
    priceChange24h: 0.0085,
    priceChangePercent24h: 15.0,
    volume24h: 15600,
    marketCap: 650,
    priceHistory: [0.052, 0.058, 0.061, 0.059, 0.060, 0.063, 0.065],
    orderBook: {
      bids: [{ price: 0.0645, size: 20 }, { price: 0.064, size: 30 }, { price: 0.0635, size: 40 }],
      asks: [{ price: 0.0655, size: 15 }, { price: 0.066, size: 25 }, { price: 0.0665, size: 35 }],
    },
    tradeHistory: [{ price: 0.065, size: 12, time: "14:28:00", side: 'buy' }, { price: 0.0648, size: 8, time: "14:26:45", side: 'sell' }],
    valuation: { score: 650, marketValue: 65000, seoAuthority: 25000, trafficEstimate: 20000, brandability: 15000, tldRarity: 5000 },
    tokenization: { tokenTicker: "MVLAND", totalSupply: 65000 },
  },
  {
    id: "ORBIT-DEMO5",
    domain: "defi-protocol.com",
    description: "Premium domain for decentralized finance protocols and yield farming platforms.",
    attributes: [
      { trait_type: "TLD", value: ".com" },
      { trait_type: "Length", value: "13" },
    ],
    listingPrice: 0.1825,
    priceChange24h: 0.021,
    priceChangePercent24h: 13.0,
    volume24h: 89400,
    marketCap: 1825,
    priceHistory: [0.155, 0.162, 0.168, 0.171, 0.176, 0.180, 0.1825],
    orderBook: {
      bids: [{ price: 0.1815, size: 8 }, { price: 0.181, size: 12 }, { price: 0.1805, size: 16 }],
      asks: [{ price: 0.183, size: 6 }, { price: 0.1835, size: 10 }, { price: 0.184, size: 14 }],
    },
    tradeHistory: [{ price: 0.1825, size: 6, time: "14:32:10", side: 'buy' }, { price: 0.182, size: 4, time: "14:30:55", side: 'buy' }],
    valuation: { score: 880, marketValue: 182500, seoAuthority: 70000, trafficEstimate: 65000, brandability: 35000, tldRarity: 12500 },
    tokenization: { tokenTicker: "DEFI", totalSupply: 182500 },
  },
  {
    id: "ORBIT-DEMO6",
    domain: "nft-marketplace.net",
    description: "Established domain for non-fungible token trading and digital art marketplaces.",
    attributes: [
      { trait_type: "TLD", value: ".net" },
      { trait_type: "Length", value: "14" },
    ],
    listingPrice: 0.148,
    priceChange24h: -0.012,
    priceChangePercent24h: -7.5,
    volume24h: 52300,
    marketCap: 1480,
    priceHistory: [0.172, 0.168, 0.161, 0.155, 0.152, 0.150, 0.148],
    orderBook: {
      bids: [{ price: 0.1475, size: 15 }, { price: 0.147, size: 20 }, { price: 0.1465, size: 25 }],
      asks: [{ price: 0.1485, size: 12 }, { price: 0.149, size: 18 }, { price: 0.1495, size: 22 }],
    },
    tradeHistory: [{ price: 0.148, size: 9, time: "14:27:30", side: 'sell' }, { price: 0.1482, size: 5, time: "14:25:15", side: 'sell' }],
    valuation: { score: 740, marketValue: 148000, seoAuthority: 55000, trafficEstimate: 48000, brandability: 30000, tldRarity: 15000 },
    tokenization: { tokenTicker: "NFTMP", totalSupply: 148000 },
  }
];

export const ExosphereExchange = () => {
  const { connected: isWalletConnected, account } = useWallet();
  const { toast } = useToast();
  const {
    createListing,
    purchaseShares,
    loading: contractLoading,
    error: contractError
  } = useContract();

  // State for real assets and loading
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [activeTab, setActiveTab] = useState('trade');

  // Trading form state
  const [tradeAmount, setTradeAmount] = useState("");
  const [isTrading, setIsTrading] = useState(false);

  // Load real domain data on component mount
  useEffect(() => {
    loadAssets();

    // Set up price update simulation every 30 seconds
    const priceUpdateInterval = setInterval(() => {
      updatePrices();
    }, 30000);

    return () => clearInterval(priceUpdateInterval);
  }, []);

  // Listen for new domains being added
  useEffect(() => {
    const handleDomainAdded = () => {
      console.log('🔄 Domain added, refreshing exchange data...');
      loadAssets();
    };

    window.addEventListener('domainAdded', handleDomainAdded);
    return () => window.removeEventListener('domainAdded', handleDomainAdded);
  }, []);

  const updatePrices = () => {
    setAssets(currentAssets =>
      currentAssets.map(asset => {
        // Simulate small price movements (±3%)
        const priceChange = (Math.random() - 0.5) * 0.06; // -3% to +3%
        const newPrice = asset.listingPrice * (1 + priceChange);

        // Update price history
        const newPriceHistory = [...asset.priceHistory.slice(1), newPrice];

        // Calculate 24h change
        const oldPrice = asset.priceHistory[0];
        const priceChange24h = newPrice - oldPrice;
        const priceChangePercent24h = ((newPrice - oldPrice) / oldPrice) * 100;

        return {
          ...asset,
          listingPrice: Math.round(newPrice * 100) / 100,
          priceHistory: newPriceHistory,
          priceChange24h: Math.round(priceChange24h * 100) / 100,
          priceChangePercent24h: Math.round(priceChangePercent24h * 100) / 100,
          volume24h: asset.volume24h + Math.floor(Math.random() * 1000), // Simulate volume increase
        };
      })
    );

    console.log('📈 Updated asset prices');
  };

  const loadAssets = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading domain assets for exchange...');
      console.log('🔍 Current account:', account?.address?.toString() || 'No wallet connected');

      // Get user-specific domains if wallet is connected
      let userOwnedDomains: any[] = [];
      if (account?.address) {
        console.log('👤 Loading domains for wallet:', account.address.toString());

        // Get domains owned by current wallet
        const allDomains = domainStorage.getAllDomains();
        console.log('📚 Total domains in storage:', allDomains.length);
        console.log('📋 All domains:', allDomains.map(d => ({ domain: d.domain, owner: d.owner })));

        userOwnedDomains = allDomains.filter(domain =>
          domain.owner === account.address.toString() ||
          domain.owner === 'user' // Legacy domains
        );

        console.log('🏠 Found user-owned domains:', userOwnedDomains.length);
        userOwnedDomains.forEach(domain => {
          console.log('  ✅ ', domain.domain, 'owned by', domain.owner);
        });
      } else {
        console.log('⚠️ No wallet connected - showing all domains');
        const allDomains = domainStorage.getAllDomains();
        userOwnedDomains = allDomains; // Show all if no wallet
        console.log('📚 Showing all domains since no wallet:', userOwnedDomains.length);
      }

      // Also get some domains for trading variety

      // Get ALL domains from storage (includes domains from all users)
      const allRegistryDomains = domainStorage.getAllDomains();
      console.log('🌐 Found domains in global registry:', allRegistryDomains.length);

      // Also get current user's domains to ensure they're included
      const userDomains = domainStorage.getAllDomains();
      console.log('� Found user domains:', userDomains.length);

      // Combine and deduplicate domains (prioritize registry domains)
      const uniqueDomains = [...allRegistryDomains];
      userDomains.forEach(userDomain => {
        const exists = uniqueDomains.find(d => d.txHash === userDomain.txHash);
        if (!exists) {
          uniqueDomains.push(userDomain);
        }
      });

      console.log('📦 Total unique domains for trading:', uniqueDomains.length);

      // Convert domains to assets
      const realAssets = allRegistryDomains.map(convertDomainToAsset);
      console.log(`🔄 Converted ${realAssets.length} real domains to tradable assets`);

      // Combine real domains with fallback mock assets if needed
      const allAssets = realAssets.length > 0 ? [...realAssets, ...fallbackAssets] : fallbackAssets;

      setAssets(allAssets);

      // Set first asset as selected if none selected
      if (!selectedAsset && allAssets.length > 0) {
        setSelectedAsset(allAssets[0]);
      }

      console.log(`✅ Loaded ${realAssets.length} real domains + ${fallbackAssets.length} mock domains = ${allAssets.length} total assets`);

    } catch (error) {
      console.error('❌ Error loading assets:', error);
      // Fallback to just mock data if error loading real domains
      setAssets(fallbackAssets);
      if (!selectedAsset && fallbackAssets.length > 0) {
        setSelectedAsset(fallbackAssets[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update form when selected asset changes
  useEffect(() => {
    // Form automatically updates with market price display
  }, [selectedAsset]);

  const filteredAssets = assets.filter(asset =>
    asset.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrade = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to trade",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAsset) {
      toast({
        title: "Selection Required",
        description: "Please select an asset to trade",
        variant: "destructive",
      });
      return;
    }

    if (!tradeAmount || parseFloat(tradeAmount) < 0.1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter at least 0.1 shares",
        variant: "destructive",
      });
      return;
    }

    // Check ownership for selling
    if (tradeSide === 'sell') {
      if (!selectedAsset.originalDomain || selectedAsset.originalDomain.owner !== account?.address?.toString()) {
        toast({
          title: "Permission Denied",
          description: "You can only sell domains you own",
          variant: "destructive",
        });
        return;
      }
    }

    setIsTrading(true);

    try {
      const shares = parseFloat(tradeAmount);
      const marketPrice = selectedAsset.listingPrice; // Use market price, not user input

      // Validate share amount
      if (shares <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Share amount must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (shares > 1000) {
        toast({
          title: "Limit Exceeded",
          description: "Maximum 1000 shares per transaction",
          variant: "destructive",
        });
        return;
      }

      console.log(`🔄 ${tradeSide.toUpperCase()} Transaction:`, {
        domain: selectedAsset.domain,
        shares,
        marketPrice,
        total: shares * marketPrice,
        userAddress: account?.address,
        isOwner: selectedAsset.originalDomain?.owner === account?.address?.toString(),
        note: "Decimal shares will be converted to integers in contract (x100M)"
      });

      if (tradeSide === 'buy') {
        // Check if this is a mock domain or real domain
        const isMockDomain = selectedAsset.id.startsWith('ORBIT-DEMO');

        if (isMockDomain) {
          // Mock domain trading - CROSS-WALLET COMPATIBLE! Pure demo mode, no blockchain calls!
          console.log("🎭 Purchasing mock domain (cross-wallet demo mode):", { shares, marketPrice, asset: selectedAsset.domain });

          // Pure demo mode - no blockchain interaction, works with ANY wallet or no wallet
          console.log("🌍 Using cross-wallet demo mode - no blockchain calls needed!");

          // Simulate realistic transaction delay
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

          // Simulate transaction processing
          console.log("⚡ Simulating transaction processing...");
          await new Promise(resolve => setTimeout(resolve, 800));

          // Create mock purchased domain for user's collection
          const mockPurchasedDomain = {
            id: `purchased-mock-${Date.now()}`,
            domain: selectedAsset.domain,
            mintDate: new Date().toISOString(),
            blockHeight: Math.floor(Math.random() * 1000000) + 157000000,
            txHash: `0xmock${Date.now().toString(16).padStart(12, '0')}`,
            status: 'active' as const,
            owner: account?.address?.toString() || 'user',
            metadata: {
              description: `Mock purchased domain: ${selectedAsset.domain}`,
              attributes: [
                { trait_type: "TLD", value: selectedAsset.domain.split('.').pop() || 'com' },
                { trait_type: "Length", value: selectedAsset.domain.length.toString() },
                { trait_type: "Category", value: "Mock Purchase" },
                { trait_type: "Source", value: "Purchased" }
              ]
            },
            valuation: selectedAsset.valuation,
            tokenization: selectedAsset.tokenization,
            marketData: {
              floorPrice: selectedAsset.listingPrice,
              dailyVolume: selectedAsset.volume24h,
              totalVolume: selectedAsset.marketCap,
              offers: Math.floor(Math.random() * 20) + 5,
              priceHistory: selectedAsset.priceHistory
            }
          };

          // Save purchased domain to storage
          await domainStorage.saveDomain(mockPurchasedDomain);
          console.log("💾 Saved purchased mock domain to storage:", mockPurchasedDomain.domain);

          // Success message
          const walletInfo = account?.address ?
            `\n💳 Wallet: ${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}` :
            `\n🌍 Demo mode active`;

          toast({
            title: "Purchase Successful",
            description: `Successfully purchased ${shares} shares of ${selectedAsset.domain} for ${(shares * marketPrice).toFixed(3)} USDCx!`,
            className: "bg-orbital-success/20 border-orbital-success/50 text-white",
          });

          // Refresh assets to show updated data
          loadAssets();
          setSelectedAsset(null);
          setTradeAmount("");

        } else {
          // Real domain trading - use blockchain
          const timestamp = Date.now().toString(16).padStart(12, '0');
          const randomPart = Math.random().toString(16).slice(2).padEnd(52, '0').slice(0, 52);
          const mockListingAddr = selectedAsset.originalDomain?.txHash || `0x${timestamp}${randomPart}`;
          console.log("🛒 Purchasing real domain shares:", { shares, marketPrice, asset: selectedAsset.domain, listingAddr: mockListingAddr });

          await purchaseShares(mockListingAddr, shares);

          // Add purchased domain to user's collection
          if (selectedAsset.originalDomain) {
            await domainStorage.saveDomain({
              domain: selectedAsset.originalDomain.domain,
              owner: 'user',
              txHash: selectedAsset.originalDomain.txHash,
              valuation: {
                score: String(selectedAsset.originalDomain.valuation.score),
                market_value: String(selectedAsset.originalDomain.valuation.marketValue * 100000000),
                seo_authority: String(selectedAsset.originalDomain.valuation.seoAuthority),
                traffic_estimate: String(selectedAsset.originalDomain.valuation.trafficEstimate),
                brandability: String(selectedAsset.originalDomain.valuation.brandability),
                tld_rarity: String(selectedAsset.originalDomain.valuation.tldRarity),
                updated_at: String(Date.now())
              }
            });

            console.log('💾 Real domain added to user collection');
          }

          toast({
            title: "Purchase Successful",
            description: `Successfully purchased ${shares} shares of ${selectedAsset.domain} for ${(shares * marketPrice).toFixed(3)} USDCx!`,
            className: "bg-orbital-success/20 border-orbital-success/50 text-white",
          });
        }

        // Dispatch event so Satellite Constellation updates
        window.dispatchEvent(new CustomEvent('domainAdded', {
          detail: { domain: selectedAsset, purchased: true }
        }));

      } else {
        // Selling - check if mock or real domain
        const isMockDomain = selectedAsset.id.startsWith('ORBIT-DEMO');

        if (isMockDomain) {
          // Mock domain selling - CROSS-WALLET COMPATIBLE! Pure demo mode, no blockchain calls!
          console.log("🎭 Creating sell listing for mock domain (cross-wallet demo mode):", { shares, marketPrice, asset: selectedAsset.domain });

          // Pure demo mode - no blockchain interaction, works with ANY wallet or no wallet
          console.log("🌍 Using cross-wallet demo mode - no blockchain calls needed!");

          // Simulate realistic transaction delay
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

          // Simulate transaction processing
          console.log("⚡ Simulating listing creation...");
          await new Promise(resolve => setTimeout(resolve, 800));

          // Success message
          const walletInfo = account?.address ?
            `\n💳 Wallet: ${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}` :
            `\n🌍 Demo mode active`;

          toast({
            title: "Listing Successful",
            description: `Successfully listed ${shares} shares of ${selectedAsset.domain} for ${marketPrice.toFixed(3)} USDCx each!`,
            className: "bg-orbital-success/20 border-orbital-success/50 text-white",
          });

        } else {
          // Real domain selling - use blockchain
          const domainAddr = selectedAsset.originalDomain?.txHash || `0x${selectedAsset.id}_domain_object`;
          console.log("💰 Creating real sell listing:", {
            shares,
            marketPrice,
            asset: selectedAsset.domain,
            domainAddr,
            originalDomain: selectedAsset.originalDomain
          });

          await createListing(domainAddr, marketPrice, shares);

          toast({
            title: "Listing Successful",
            description: `Successfully listed ${shares} shares of ${selectedAsset.domain} for ${marketPrice.toFixed(3)} USDCx each!`,
            className: "bg-orbital-success/20 border-orbital-success/50 text-white",
          });
        }
      }

      // Clear form on success and refresh assets
      setTradeAmount("");
      await loadAssets(); // Refresh the exchange data

    } catch (error) {
      console.error("❌ Trade failed:", error);
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      toast({
        title: "Trade Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const calculateTotal = () => {
    const amount = parseFloat(tradeAmount) || 0;
    const marketPrice = selectedAsset?.listingPrice || 0;
    return (amount * marketPrice).toFixed(3);
  };

  const PriceChange = ({ change }: { change: number }) => (
    <span className={`flex items-center text-sm ${change >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>
      {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(change)}%
    </span>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <main className="w-full max-w-[96rem] mx-auto space-y-8">
          <div className="text-center">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
              <Globe className="h-9 w-9 text-primary orbit-animation" />
              Exosphere Exchange
            </h1>
            <p className="font-ibm-plex-sans text-lg text-muted-foreground mt-2">
              Loading tradeable domain assets...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-border border-t-[#FF7A00] rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if no assets
  if (assets.length === 0) {
    return (
      <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <main className="w-full max-w-[96rem] mx-auto space-y-8">
          <div className="text-center">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
              <Globe className="h-9 w-9 text-primary orbit-animation" />
              Exosphere Exchange
            </h1>
            <p className="font-ibm-plex-sans text-lg text-muted-foreground mt-2">
              No tokenized domains available for trading yet.
            </p>
            <p className="font-ibm-plex-sans text-sm text-muted-foreground mt-1">
              Create your first domain in the Satellite Constellation to start trading!
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedAsset) return null;

  const maxOrderSize = Math.max(
    ...selectedAsset.orderBook.bids.map(o => o.size),
    ...selectedAsset.orderBook.asks.map(o => o.size)
  );

  const totalMarketCap = assets.reduce((sum, asset) => sum + asset.marketCap, 0);
  const totalVolume = assets.reduce((sum, asset) => sum + asset.volume24h, 0);

  return (
    <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
      <main className="w-full max-w-[96rem] mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
            <Globe className="h-9 w-9 text-primary orbit-animation" />
            Exosphere Exchange
          </h1>
          <p className="font-ibm-plex-sans text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
            Trade fractional shares of tokenized domains with live order books, charts, and real-time market data.
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={loadAssets}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg transition-colors text-sm font-ibm-plex-mono disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin"></div>
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Refresh Markets
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <section>
          <div className="glass-panel p-4 md:p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Market Cap</p>
                <p className="font-ibm-plex-mono text-xl font-bold text-foreground">${(totalMarketCap / 1_000_000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">24h Volume</p>
                <p className="font-ibm-plex-mono text-xl font-bold text-foreground">${(totalVolume / 1_000_000).toFixed(2)}M</p>
              </div>
              <div>
                <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Orbital Assets</p>
                <p className="font-ibm-plex-mono text-xl font-bold text-foreground">{assets.length}</p>
              </div>
              <div>
                <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Market Trend</p>
                <p className={`font-ibm-plex-mono text-xl font-bold ${assets.filter(a => a.priceChange24h >= 0).length > assets.length / 2 ? 'text-orbital-success' : 'text-orbital-fail'}`}>
                  {assets.filter(a => a.priceChange24h >= 0).length > assets.length / 2 ? 'Bullish' : 'Bearish'}
                </p>
              </div>
              <div>
                <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Last Update</p>
                <p className="font-ibm-plex-mono text-sm font-bold text-foreground">{new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Panel: Market List */}
          <div className="lg:col-span-1 h-[calc(100vh-24rem)] flex flex-col glass-panel p-4 rounded-lg border border-border">
            <div className="relative mb-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Markets"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/30 border border-border rounded-lg py-2 pl-9 pr-4 font-ibm-plex-mono focus:ring-1 focus:ring-[#FF7A00] outline-none transition"
              />
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 p-1 -mr-1 pr-2 custom-scrollbar">
              {filteredAssets.map(asset => {
                const isOwned = asset.owner === account?.address?.toString() || asset.owner === 'user';
                const isSelected = selectedAsset.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent group ${isSelected
                      ? 'bg-gradient-to-r from-white/10 to-transparent border-border shadow-lg'
                      : 'hover:bg-black/5 hover:border-border'
                      } ${isOwned ? 'ring-1 ring-green-500/30 bg-green-500/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`font-space-grotesk font-bold text-base truncate ${isSelected ? 'text-foreground' : 'text-gray-200 group-hover:text-foreground'}`}>
                          {asset.domain}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-muted-foreground text-xs font-ibm-plex-mono bg-black/5 px-1.5 py-0.5 rounded">{asset.tokenization.tokenTicker}</p>
                          {isOwned && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20 font-medium whitespace-nowrap">
                              <User className="h-2.5 w-2.5" /> YOURS
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-ibm-plex-mono font-bold text-sm ${asset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>
                          {asset.listingPrice.toFixed(2)}
                        </p>
                        <PriceChange change={asset.priceChangePercent24h} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Panel: Chart and Trade */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Header */}
            <div className="glass-panel p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Globe className="h-10 w-10 text-primary" />
                  <div>
                    <h2 className="font-space-grotesk text-2xl font-bold text-foreground">{selectedAsset.tokenization.tokenTicker} / USDCx</h2>
                    <p className="text-muted-foreground font-ibm-plex-sans text-sm">{selectedAsset.domain}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-ibm-plex-mono text-2xl font-bold ${selectedAsset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>{selectedAsset.listingPrice.toFixed(2)} <span className="text-base text-muted-foreground">USDCx</span></p>
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <p className={`font-ibm-plex-mono ${selectedAsset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>{selectedAsset.priceChange24h.toFixed(2)}</p>
                    <PriceChange change={selectedAsset.priceChangePercent24h} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="glass-panel p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-space-grotesk text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-solar-yellow-text" /> Price Chart</h3>
                {/* Timeframe selector can be added here */}
              </div>
              <MainPerformanceChart data={selectedAsset.priceHistory} />
            </div>

            {/* Tabs: Trade / Info */}
            <div className="glass-panel rounded-lg border border-border">
              <div className="flex border-b border-border">
                <button onClick={() => setActiveTab('trade')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all ${activeTab === 'trade' ? 'text-white border-b-2 border-[#FF7A00]' : 'text-muted-foreground hover:bg-black/5'}`}>Trade</button>
                <button onClick={() => setActiveTab('info')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all ${activeTab === 'info' ? 'text-white border-b-2 border-[#FF7A00]' : 'text-muted-foreground hover:bg-black/5'}`}>Info</button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  {activeTab === 'trade' ? (
                    <div>
                      {/* Trading Side Selector */}
                      <div className="flex rounded-lg overflow-hidden border border-border mb-4">
                        <button onClick={() => setTradeSide('buy')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all text-sm ${tradeSide === 'buy' ? 'bg-orbital-success/20 text-orbital-success' : 'text-gray-200 hover:bg-black/10 hover:text-white'}`}>BUY</button>
                        <button onClick={() => setTradeSide('sell')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all text-sm ${tradeSide === 'sell' ? 'bg-orbital-fail/20 text-orbital-fail' : 'text-gray-200 hover:bg-black/10 hover:text-white'}`}>SELL</button>
                      </div>

                      {/* Ownership Info */}
                      {isWalletConnected && selectedAsset.originalDomain && (
                        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-300">Your Ownership:</span>
                            <span className="font-bold text-blue-200">
                              {selectedAsset.originalDomain.owner === account?.address?.toString() ? '100%' : '0%'}
                            </span>
                          </div>
                          {selectedAsset.originalDomain.owner === account?.address?.toString() && (
                            <p className="text-xs text-blue-400 mt-1">You own this domain</p>
                          )}
                        </div>
                      )}

                      {/* Trading Form */}
                      <div className="space-y-4">
                        {/* Market Price Display */}
                        <div className="space-y-2">
                          <label className="font-ibm-plex-mono text-xs text-muted-foreground">Market Price per Share</label>
                          <div className="w-full bg-secondary/20 border border-border rounded-lg p-2 font-ibm-plex-mono text-orbital-success font-bold">
                            {selectedAsset.listingPrice.toFixed(3)} USDCx
                          </div>
                          <p className="text-xs text-muted-foreground">Current market price (auto-filled)</p>
                        </div>

                        {/* Shares Input */}
                        <div className="space-y-2">
                          <label className="font-ibm-plex-mono text-xs text-muted-foreground">Number of Shares ({selectedAsset.tokenization.tokenTicker})</label>
                          <input
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            placeholder="0.1"
                            step="0.1"
                            min="0.1"
                            className="w-full bg-secondary/30 border border-border rounded-lg p-2 font-ibm-plex-mono focus:ring-1 focus:ring-[#FF7A00] outline-none"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Available: {selectedAsset.tokenization.totalSupply.toLocaleString()}</span>
                            <span>Min: 0.1 shares</span>
                          </div>
                        </div>

                        {/* Total Cost Display */}
                        <div className="bg-orbital-primary/10 border border-orbital-primary/30 rounded-lg p-3">
                          <div className="flex justify-between font-ibm-plex-mono text-sm">
                            <span className="text-muted-foreground">Total Cost:</span>
                            <span className="text-foreground font-bold">{calculateTotal()} USDCx</span>
                          </div>
                          <div className="flex justify-between font-ibm-plex-mono text-xs mt-1">
                            <span className="text-muted-foreground">{tradeAmount || 0} shares × {selectedAsset.listingPrice.toFixed(3)} USDCx</span>
                            <span className="text-muted-foreground">≈ ${(parseFloat(calculateTotal()) * 8.5).toFixed(2)} USD</span>
                          </div>
                        </div>

                        {/* Trading Restrictions */}
                        {tradeSide === 'sell' && isWalletConnected && selectedAsset.originalDomain?.owner !== account?.address?.toString() && (
                          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                              <p className="text-yellow-300 text-xs">You don't own this domain. You can only buy shares, not sell them.</p>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleTrade}
                          disabled={
                            !isWalletConnected ||
                            isTrading ||
                            contractLoading ||
                            (tradeSide === 'sell' && selectedAsset.originalDomain?.owner !== account?.address?.toString())
                          }
                          className={`w-full font-space-grotesk font-bold transition-colors ${tradeSide === 'buy' ? 'bg-orbital-success/90 hover:bg-orbital-success text-white' : 'bg-orbital-fail/90 hover:bg-orbital-fail text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isTrading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            `${tradeSide.toUpperCase()} ${selectedAsset.tokenization.tokenTicker}`
                          )}
                        </Button>
                        {contractError && (
                          <div className="text-red-400 text-xs font-ibm-plex-mono mt-2 p-2 bg-red-900/20 rounded">
                            Error: {contractError}
                          </div>
                        )}
                        {!isWalletConnected && (
                          <div className="text-orange-400 text-xs font-ibm-plex-mono mt-2 p-2 bg-orange-900/20 rounded">
                            Please connect your wallet to trade
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-space-grotesk font-bold text-lg mb-2">About {selectedAsset.domain}</h4>
                        <p className="font-ibm-plex-sans text-sm text-gray-300 mb-4">{selectedAsset.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {selectedAsset.attributes.map(attr => (
                            <div key={attr.trait_type} className="bg-secondary/20 p-3 rounded-lg">
                              <p className="font-ibm-plex-mono text-xs text-muted-foreground">{attr.trait_type}</p>
                              <p className="font-ibm-plex-mono font-bold text-foreground">{attr.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-space-grotesk font-bold text-lg mb-2">Tokenomics</h4>
                        <div className="bg-secondary/20 p-3 rounded-lg font-ibm-plex-mono text-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Ownership Model:</span>
                            <span className="font-bold text-foreground">Fractional (Stacks Object)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Token Ticker:</span>
                            <span className="font-bold text-foreground">${selectedAsset.tokenization.tokenTicker}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Supply:</span>
                            <span className="text-foreground">{selectedAsset.tokenization.totalSupply.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Market Cap:</span>
                            <span className="text-foreground">${selectedAsset.marketCap.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-space-grotesk font-bold text-lg mb-2">Valuation Breakdown</h4>
                        <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                            <div className="flex items-center gap-2 text-gray-300"><BarChart className="h-4 w-4 text-solar-yellow-text/70" />SEO Authority</div>
                            <span className="font-bold text-foreground">${selectedAsset.valuation.seoAuthority.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                            <div className="flex items-center gap-2 text-gray-300"><Sparkles className="h-4 w-4 text-solar-yellow-text/70" />Traffic Estimate</div>
                            <span className="font-bold text-foreground">${selectedAsset.valuation.trafficEstimate.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                            <div className="flex items-center gap-2 text-gray-300"><ShieldCheck className="h-4 w-4 text-solar-yellow-text/70" />Brandability</div>
                            <span className="font-bold text-foreground">${selectedAsset.valuation.brandability.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                            <div className="flex items-center gap-2 text-gray-300"><Globe className="h-4 w-4 text-solar-yellow-text/70" />TLD Rarity</div>
                            <span className="font-bold text-foreground">${selectedAsset.valuation.tldRarity.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-border mt-2 pt-2 flex items-center justify-between font-ibm-plex-mono text-base">
                            <span className="font-bold text-solar-yellow-text">Total Estimated Value</span>
                            <span className="font-bold text-solar-yellow-text">${selectedAsset.valuation.marketValue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Order Book & Trade History */}
          <div className="lg:col-span-1 h-[calc(100vh-24rem)] flex flex-col space-y-6">
            {/* Order Book */}
            <div className="glass-panel rounded-lg flex-1 flex flex-col border border-border">
              <h3 className="font-space-grotesk font-bold p-3 border-b border-border flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" />Share Order Book</h3>
              <div className="flex-grow overflow-y-auto text-xs font-ibm-plex-mono">
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-foreground sticky top-0 bg-secondary/50 backdrop-blur-sm">
                      <th className="text-left p-2 font-normal">Price (USDCx)</th>
                      <th className="text-right p-2 font-normal">Size</th>
                      <th className="text-right p-2 font-normal">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAsset.orderBook.asks.slice(0, 8).reverse().map((ask, i) => (
                      <tr key={i} className="relative hover:bg-black/5">
                        <td className="p-1 pl-2 text-orbital-fail">{ask.price.toFixed(2)}</td>
                        <td className="p-1 text-right">{ask.size}</td>
                        <td className="p-1 pr-2 text-right">{(ask.price * ask.size).toFixed(2)}</td>
                        <motion.div className="absolute top-0 right-0 h-full bg-orbital-fail/10 pointer-events-none" initial={{ width: 0 }} animate={{ width: `${(ask.size / maxOrderSize) * 100}%` }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="py-2 border-t border-b border-border my-1 font-ibm-plex-mono text-lg text-center font-bold text-foreground">
                  {selectedAsset.listingPrice.toFixed(2)} USDCx
                </div>
                <table className="w-full">
                  <tbody>
                    {selectedAsset.orderBook.bids.slice(0, 8).map((bid, i) => (
                      <tr key={i} className="relative hover:bg-black/5">
                        <td className="p-1 pl-2 text-orbital-success">{bid.price.toFixed(2)}</td>
                        <td className="p-1 text-right">{bid.size}</td>
                        <td className="p-1 pr-2 text-right">{(bid.price * bid.size).toFixed(2)}</td>
                        <motion.div className="absolute top-0 right-0 h-full bg-orbital-success/10 pointer-events-none" initial={{ width: 0 }} animate={{ width: `${(bid.size / maxOrderSize) * 100}%` }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade History */}
            <div className="glass-panel rounded-lg flex-1 flex flex-col border border-border">
              <h3 className="font-space-grotesk font-bold p-3 border-b border-border flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" />Share Trade History</h3>
              <div className="flex-grow overflow-y-auto text-xs font-ibm-plex-mono">
                <table className="w-full">
                  <thead>
                    <tr className="text-muted-foreground sticky top-0 bg-secondary/50 backdrop-blur-sm">
                      <th className="text-left p-2 font-normal">Price (USDCx)</th>
                      <th className="text-right p-2 font-normal">Size</th>
                      <th className="text-right p-2 font-normal">Time</th>
                    </tr>
                  </thead>
                  <AnimatePresence>
                    <tbody>
                      {selectedAsset.tradeHistory.map((trade, i) => (
                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-black/5">
                          <td className={`p-1 pl-2 ${trade.side === 'buy' ? 'text-orbital-success' : 'text-orbital-fail'}`}>{trade.price.toFixed(2)}</td>
                          <td className="p-1 text-right">{trade.size}</td>
                          <td className="p-1 pr-2 text-right text-muted-foreground">{trade.time}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </AnimatePresence>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};