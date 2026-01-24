
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Satellite,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart,
  Sparkles,
  ShieldCheck,
  Globe
} from "lucide-react";
import { CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { domainStorage, DomainRecord } from "../services/domainStorage";
import { PerpsPortfolioSection } from "../components/PerpsPortfolioSection";
import { useWallet } from "../components/Layout";
import { WalletConnection } from "../components/WalletConnection";
import "../services/debug"; // Import debug utils

// Use DomainRecord as SatelliteAsset
type SatelliteAsset = DomainRecord;

// Keep the original mock data for hackathon demo + add real domains
const mockAssets: SatelliteAsset[] = [
  {
    id: "ORBIT-001",
    domain: "myawesomesite.com",
    mintDate: "2024-03-15T10:30:00Z",
    blockHeight: 157293847,
    txHash: "0xa1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: "active",
    owner: "0x1234...demo",
    metadata: {
      description: "Premium domain asset tokenized on Stacks",
      attributes: [
        { trait_type: "TLD", value: ".com" },
        { trait_type: "Length", value: "15" },
        { trait_type: "Category", value: "General" }
      ]
    },
    valuation: { score: 78, marketValue: 25, seoAuthority: 120, trafficEstimate: 80, brandability: 40, tldRarity: 10 },
    tokenization: { tokenTicker: "MYAWS", totalSupply: 25000 },
    marketData: {
      floorPrice: 20.50,
      dailyVolume: 25000,
      totalVolume: 1500000,
      offers: 12,
      priceHistory: [18, 19, 20, 19.5, 20.5, 21, 20.5]
    }
  },
  {
    id: "ORBIT-002",
    domain: "crypto-hub.io",
    mintDate: "2024-03-14T15:45:00Z",
    blockHeight: 157290123,
    txHash: "0xb2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    status: "active",
    owner: "0x5678...demo",
    metadata: {
      description: "Tech domain with established presence",
      attributes: [
        { trait_type: "TLD", value: ".io" },
        { trait_type: "Length", value: "10" },
        { trait_type: "Category", value: "Technology" }
      ]
    },
    valuation: { score: 85, marketValue: 78, seoAuthority: 300, trafficEstimate: 250, brandability: 150, tldRarity: 80 },
    tokenization: { tokenTicker: "CRHUB", totalSupply: 78000 },
    marketData: {
      floorPrice: 65.00,
      dailyVolume: 78000,
      totalVolume: 2300000,
      offers: 5,
      priceHistory: [60, 62, 65, 63, 66, 68, 65]
    }
  },
  {
    id: "ORBIT-003",
    domain: "web3future.xyz",
    mintDate: "2024-03-13T09:20:00Z",
    blockHeight: 157285456,
    txHash: "0xc3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    status: "active",
    owner: "0x9abc...demo",
    metadata: {
      description: "Next-gen domain for Web3 innovation",
      attributes: [
        { trait_type: "TLD", value: ".xyz" },
        { trait_type: "Length", value: "11" },
        { trait_type: "Category", value: "Crypto" }
      ]
    },
    valuation: { score: 62, marketValue: 12, seoAuthority: 50, trafficEstimate: 40, brandability: 20, tldRarity: 10 },
    tokenization: { tokenTicker: "W3FUT", totalSupply: 12000 },
    marketData: {
      floorPrice: 9.80,
      dailyVolume: 12000,
      totalVolume: 540000,
      offers: 23,
      priceHistory: [10, 9.8, 9.6, 9.5, 9.7, 9.5, 9.8]
    }
  }
];

const AssetStatusChart = ({ assets }: { assets: SatelliteAsset[] }) => {
  const active = assets.filter(a => a?.status === 'active').length;
  const total = assets.length;
  const totalShares = assets.reduce((sum, asset) => sum + (asset?.tokenization?.totalSupply || 0), 0);
  const totalMarketCap = assets.reduce((sum, asset) => sum + (asset?.valuation?.marketValue || 0), 0);

  const data = [
    { status: 'Active', count: active, color: 'bg-[#FFC700]' },
  ];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Total Assets</p>
          <p className="font-ibm-plex-mono text-xl font-bold text-foreground">{total}</p>
        </div>
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Total Shares</p>
          <p className="font-ibm-plex-mono text-xl font-bold text-foreground">{totalShares.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground uppercase">Total Market Cap</p>
          <p className="font-ibm-plex-mono text-xl font-bold text-foreground">${totalMarketCap.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex justify-between items-center font-ibm-plex-mono text-xs text-muted-foreground mb-2">
        <span>Asset Status Distribution</span>
        <span>Total: {total}</span>
      </div>
      <div className="w-full bg-secondary/20 rounded-full h-4 flex overflow-hidden border border-border">
        {data.map(item => (
          <div
            key={item.status}
            className={`${item.color} h-full transition-all duration-500`}
            style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
            title={`${item.status}: ${item.count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-start items-center gap-4 mt-3 text-xs font-ibm-plex-mono">
        {data.map(item => (
          <div key={item.status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-gray-300">{item.status} ({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PerformanceChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / (max - min)) * 100}`).join(' ');
  const isUp = data[data.length - 1] >= data[0];

  return (
    <div className="relative h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={isUp ? '#FFC700' : '#FE6440'}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
};

export const SatelliteConstellation = () => {
  const [selectedAsset, setSelectedAsset] = useState<SatelliteAsset | null>(null);
  const [assets, setAssets] = useState<SatelliteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();

  // Load real domain data + combine with mock data for demo
  useEffect(() => {
    const loadAssets = async () => {
      console.log('🛰️ Loading constellation data...');
      try {
        // Skip the enhance method call since it may not exist
        // domainStorage.enhanceDomainsWithMarketData();

        // Add a small delay to ensure domains are properly loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        const realAssets = domainStorage.getAllDomains();
        console.log('📡 Real domains from storage:', realAssets);
        console.log('📡 LocalStorage raw data:', localStorage.getItem('orbiter_domains'));
        console.log('📡 Number of real assets loaded:', realAssets.length);

        // Validate and enhance real assets to ensure they have required properties
        const validRealAssets = realAssets.filter(asset => {
          const isValid = asset &&
            asset.domain &&
            asset.id;

          if (!isValid) {
            console.warn('⚠️ Skipping invalid asset (missing basic props):', asset);
            return false;
          }

          // Add default values for missing properties
          if (!asset.valuation) {
            console.log('🔧 Adding default valuation for:', asset.domain);
            asset.valuation = {
              score: 75,
              marketValue: 50,
              seoAuthority: 60,
              trafficEstimate: 1000,
              brandability: 70,
              tldRarity: 80
            };
          }

          if (!asset.tokenization) {
            console.log('🔧 Adding default tokenization for:', asset.domain);
            asset.tokenization = {
              tokenTicker: asset.domain.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase(),
              totalSupply: 10000
            };
          }

          if (!asset.metadata) {
            console.log('🔧 Adding default metadata for:', asset.domain);
            asset.metadata = {
              description: `Tokenized domain asset: ${asset.domain}`,
              attributes: [
                { trait_type: 'TLD', value: asset.domain.split('.').pop() || 'com' },
                { trait_type: 'Length', value: asset.domain.split('.')[0].length.toString() },
                { trait_type: 'Category', value: 'User Created' },
                { trait_type: 'Source', value: 'Created' }
              ]
            };
          }

          if (!asset.marketData) {
            console.log('🔧 Adding default market data for:', asset.domain);
            asset.marketData = {
              floorPrice: asset.valuation.marketValue * 0.8,
              dailyVolume: Math.round(Math.random() * 50000) + 10000,
              totalVolume: Math.round(Math.random() * 500000) + 100000,
              offers: Math.floor(Math.random() * 25) + 5,
              priceHistory: [asset.valuation.marketValue]
            };
          }

          if (!asset.status) {
            asset.status = 'active';
          }

          return true;
        });

        console.log(`✅ Valid real assets: ${validRealAssets.length} out of ${realAssets.length}`);

        // For Satellite Constellation: Show BOTH real domains AND demo data
        console.log('🔍 Real assets before combining:', validRealAssets);
        console.log('🔍 Mock assets:', mockAssets);

        if (validRealAssets.length > 0) {
          console.log(`🎯 Found ${validRealAssets.length} REAL user domains - combining with demo data`);
          const combinedAssets = [...validRealAssets, ...mockAssets];
          console.log('🔍 Combined assets:', combinedAssets.map(a => ({ id: a.id, domain: a.domain, owner: a.owner })));
          console.log('🚀 Setting combined assets to state:', combinedAssets.length, 'total assets');
          setAssets(combinedAssets); // Show BOTH real + demo domains
        } else {
          console.log('📱 No real domains found, using mock data for demo');
          console.log('🔍 Mock assets being set:', mockAssets.length);
          setAssets(mockAssets); // Fallback to mock data only if no real domains
        }

        console.log('📊 Assets state after setting:', assets.length);

        // Force a re-render to ensure state is updated
        setTimeout(() => {
          console.log('� Double-checking assets after timeout:', assets.length);
        }, 200);

        console.log('�🔍 All real domain owners:', validRealAssets.map(d => ({ domain: d.domain, owner: d.owner, id: d.id })));
        setLoading(false);
        console.log(`✅ Constellation loaded - prioritizing real domains over mock data`);
      } catch (error) {
        console.error('❌ Error loading constellation assets:', error);
        // Fallback to just mock data if there's an error loading real domains
        setAssets(mockAssets);
        setLoading(false);
      }
    };

    // Load assets with proper async handling
    loadAssets();

    // Listen for new domains being added
    const handleDomainAdded = (event: CustomEvent) => {
      console.log('🆕 New domain added event received:', event.detail);
      console.log('🔄 Reloading constellation assets...');
      loadAssets(); // Reload all assets
    };

    window.addEventListener('domainAdded', handleDomainAdded as EventListener);
    console.log('👂 Event listener attached for domain updates');

    return () => {
      console.log('🔇 Removing domain event listener');
      window.removeEventListener('domainAdded', handleDomainAdded as EventListener);
    };
  }, []);

  // Additional useEffect to ensure real domains are loaded
  useEffect(() => {
    // Double-check after component mount that we have the correct assets
    const checkAndLoadAssets = () => {
      const currentRealAssets = domainStorage.getAllDomains();
      console.log('🔍 Checking assets after mount:', {
        realAssetsFound: currentRealAssets.length,
        currentlyDisplayed: assets.length,
        assetsInState: assets.map(a => a.domain)
      });

      if (currentRealAssets.length > 0 && assets.length <= 3) {
        console.log('🔄 Found real assets but only showing mock data, fixing...');
        const combinedAssets = [...currentRealAssets, ...mockAssets];
        setAssets(combinedAssets);
      }
    };

    // Check after a short delay to ensure everything is loaded
    setTimeout(checkAndLoadAssets, 500);
  }, [assets.length]); // Re-run when assets length changes

  useEffect(() => {
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
    return () => sections.forEach(section => observer.unobserve(section));
  }, []);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    return <CheckCircle className="h-4 w-4 text-[#FFC700]" />;
  };



  return (
    <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
          <Satellite className="h-9 w-9 text-primary orbit-animation" />
          Satellite Constellation
        </h1>
        <p className="font-ibm-plex-sans text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">
          Your personal fleet of tokenized domains. Monitor and manage your satellite assets.
        </p>
      </div>

      {!account ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="glass-panel p-10 rounded-lg text-center max-w-lg border border-[#FF7A00]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#FF7A00]/5 to-transparent pointer-events-none"></div>
            <Satellite className="h-20 w-20 text-primary mx-auto mb-6 opacity-80" />
            <h2 className="font-space-grotesk text-2xl font-bold text-foreground mb-4">Signal Lost</h2>
            <p className="font-ibm-plex-sans text-muted-foreground mb-8">
              Access to the Satellite Constellation requires an active uplink. Please connect your wallet to view your assets.
            </p>
            <div className="flex justify-center">
              <WalletConnection />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* Constellation Overview */}
          <section className="fade-in-section">
            <div className="glass-panel p-6 md:p-8 rounded-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <h2 className="font-space-grotesk text-xl font-bold text-foreground mb-2 md:mb-0">Constellation Overview</h2>
                <span className="font-ibm-plex-mono text-sm solar-yellow-text">[ STATUS: OPERATIONAL ]</span>
              </div>
              <AssetStatusChart assets={assets} />
            </div>
          </section>

          {/* Created Domains Section */}
          <section className="fade-in-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Created by Me</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-ibm-plex-mono text-sm text-muted-foreground">Domains I Minted</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.filter((asset, filterIndex) => {
                // Show only domains created by user (those with "Created" source or no source attribute)
                const sourceAttr = asset.metadata?.attributes?.find(attr => attr.trait_type === "Source");
                const isCreated = !sourceAttr || sourceAttr.value === "Created" || sourceAttr.value === "User Created";

                // Debug logging (reduced)
                if (filterIndex < 3) { // Only log first few for debugging
                  console.log(`🔍 Filtering asset ${asset.id} (${asset.domain}):`, {
                    owner: asset.owner,
                    sourceAttr: sourceAttr?.value,
                    isCreated
                  });
                }

                return isCreated;
              }).map((asset, index) => {
                if (!asset || !asset.domain) {
                  console.warn('⚠️ Skipping invalid asset at index:', index, asset);
                  return null;
                }

                return (
                  <motion.div
                    key={asset.id || `created-asset-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div
                      className="glass-panel h-full p-5 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(asset.status)}
                            <span className="font-ibm-plex-mono text-xs text-muted-foreground">Object ID: {asset.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Show different badges for real vs demo domains */}
                            {asset.id && asset.id.startsWith('ORBIT-') ? (
                              <Badge className="font-ibm-plex-mono text-xs bg-gray-600/20 text-muted-foreground border-border/50">
                                DEMO
                              </Badge>
                            ) : (
                              <Badge className="font-ibm-plex-mono text-xs bg-blue-600/20 text-blue-400 border-blue-500/50">
                                LIVE
                              </Badge>
                            )}
                            <Badge variant="secondary" className="font-ibm-plex-mono text-xs capitalize bg-black/5 text-gray-300 border-border">
                              {asset.status}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="font-space-grotesk text-2xl font-bold truncate text-foreground">
                          {asset.domain || 'Unknown Domain'}
                        </h3>
                        <p className="font-ibm-plex-mono text-sm text-muted-foreground">
                          Shares: {asset.tokenization?.totalSupply?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="font-ibm-plex-mono text-lg text-blue-400 mt-2">
                          ${asset.valuation?.marketValue?.toLocaleString() || 'N/A'}
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {(asset.metadata?.attributes || []).slice(0, 2).map((attr, i) => (
                            <div key={i} className="bg-secondary/20 p-2 rounded-md">
                              <span className="font-ibm-plex-mono text-muted-foreground block">{attr.trait_type}</span>
                              <span className="font-ibm-plex-mono text-gray-200 font-medium">{attr.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Domain Management Actions */}
                        <div className="space-y-2 pt-2">
                          {/* Status Toggle */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Status:</span>
                            <Button
                              size="sm"
                              className={`text-xs px-3 py-1 ${asset.status === 'active'
                                ? 'bg-green-600/20 hover:bg-red-600/40 text-green-400 border-green-500/50'
                                : 'bg-red-600/20 hover:bg-green-600/40 text-red-400 border-red-500/50'
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Simple status toggle without backend method
                                const newStatus = asset.status === 'active' ? 'inactive' : 'active';

                                // Update local state only
                                const updatedAssets = assets.map(a =>
                                  a.id === asset.id ? { ...a, status: newStatus as 'active' | 'inactive' | 'transferring' } : a
                                );
                                setAssets(updatedAssets);

                                console.log(`🔄 Domain ${asset.domain} status changed to: ${newStatus}`);
                              }}
                            >
                              {asset.status === 'active' ? '🟢 Deactivate' : '🔴 Activate'}
                            </Button>
                          </div>

                          {/* Main Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border-blue-500/50 text-xs"
                              disabled={asset.status === 'inactive'}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (asset.status === 'active') {
                                  // Navigate to Exchange with this domain selected for selling
                                  localStorage.setItem('orbiter_sell_domain', asset.id);
                                  window.location.href = '/exosphere-exchange';
                                }
                              }}
                            >
                              {asset.status === 'active' ? 'List Shares' : 'Inactive'}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gray-600/20 hover:bg-gray-600/40 text-muted-foreground border-border/50 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAsset(asset);
                              }}
                            >
                              Manage
                            </Button>
                          </div>
                        </div>

                        <div className="font-ibm-plex-mono text-xs text-muted-foreground text-center pt-2">
                          Created on {asset.mintDate ? formatDate(asset.mintDate) : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Purchased Domains Section */}
          <section className="fade-in-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-space-grotesk text-2xl font-bold text-foreground">Purchased by Me</h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-ibm-plex-mono text-sm text-muted-foreground">Domains I Bought</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.filter(asset => {
                // Show only domains purchased by user
                const sourceAttr = asset.metadata?.attributes?.find(attr => attr.trait_type === "Source");
                return sourceAttr && sourceAttr.value === "Purchased";
              }).map((asset, index) => {
                if (!asset || !asset.domain) {
                  console.warn('⚠️ Skipping invalid asset at index:', index, asset);
                  return null;
                }

                return (
                  <motion.div
                    key={asset.id || `purchased-asset-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <div
                      className="glass-panel h-full p-5 rounded-lg border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(asset.status)}
                            <span className="font-ibm-plex-mono text-xs text-muted-foreground">Object ID: {asset.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="font-ibm-plex-mono text-xs bg-yellow-600/20 text-yellow-400 border-yellow-500/50">
                              PURCHASED
                            </Badge>
                            <Badge variant="secondary" className="font-ibm-plex-mono text-xs capitalize bg-black/5 text-gray-300 border-border">
                              {asset.status}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="font-space-grotesk text-2xl font-bold truncate text-foreground">
                          {asset.domain || 'Unknown Domain'}
                        </h3>
                        <p className="font-ibm-plex-mono text-sm text-muted-foreground">
                          Shares: {asset.tokenization?.totalSupply?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="font-ibm-plex-mono text-lg text-yellow-400 mt-2">
                          ${asset.valuation?.marketValue?.toLocaleString() || 'N/A'}
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {(asset.metadata?.attributes || []).slice(0, 2).map((attr, i) => (
                            <div key={i} className="bg-secondary/20 p-2 rounded-md">
                              <span className="font-ibm-plex-mono text-muted-foreground block">{attr.trait_type}</span>
                              <span className="font-ibm-plex-mono text-gray-200 font-medium">{attr.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Share Management Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button
                            size="sm"
                            className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border-yellow-500/50 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to Exchange to sell these shares
                              localStorage.setItem('orbiter_sell_domain', asset.id);
                              window.location.href = '/exosphere-exchange';
                            }}
                          >
                            Sell Shares
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gray-600/20 hover:bg-gray-600/40 text-muted-foreground border-border/50 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Transfer shares functionality
                              alert(`Transfer functionality coming soon for ${asset.domain}!`);
                            }}
                          >
                            Transfer
                          </Button>
                        </div>

                        <div className="font-ibm-plex-mono text-xs text-muted-foreground text-center pt-2">
                          Acquired on {asset.mintDate ? formatDate(asset.mintDate) : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty state for purchased domains */}
            {assets.filter(asset => {
              const sourceAttr = asset.metadata?.attributes?.find(attr => attr.trait_type === "Source");
              return sourceAttr && sourceAttr.value === "Purchased";
            }).length === 0 && (
                <div className="glass-panel rounded-lg py-12 px-8 text-center border-yellow-500/20">
                  <div className="mb-4 opacity-30">
                    <Sparkles className="h-12 w-12 mx-auto text-yellow-400" />
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold mb-2 text-gray-300">
                    No Purchased Domains Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Visit the Exosphere Exchange to buy domain shares from other users.
                  </p>
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                    onClick={() => window.location.href = '/exosphere-exchange'}
                  >
                    Browse Exchange
                  </Button>
                </div>
              )}
          </section>

          {/* Loading State */}
          {loading && (
            <section className="fade-in-section">
              <div className="glass-panel rounded-lg py-16 px-8 text-center">
                <div className="mb-6 opacity-50">
                  <Satellite className="h-16 w-16 mx-auto animate-pulse" />
                </div>
                <h2 className="font-space-grotesk text-2xl font-bold mb-2">
                  Loading Constellation...
                </h2>
                <p className="text-muted-foreground">
                  Scanning orbital satellites for domain assets
                </p>
              </div>
            </section>
          )}

          {/* Empty State - Only show if no mock data either (shouldn't happen) */}
          {!loading && assets.length === 0 && (
            <section className="fade-in-section">
              <div className="glass-panel rounded-lg py-16 px-8 text-center">
                <div className="mb-6 opacity-30">
                  <Satellite className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="font-space-grotesk text-3xl font-bold mb-2">
                  No Satellites in Orbit
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Launch your first domain to see it appear in your constellation.
                </p>
                <Button className="cta-button mt-10 inline-block bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-lg">
                  [ INITIATE LAUNCH SEQUENCE ]
                </Button>
              </div>
            </section>
          )}

          {/* Enhanced Portfolio Analytics - Kana Perps Integration */}
          <section className="fade-in-section mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-space-grotesk text-2xl font-bold text-foreground flex items-center gap-2">
                  Advanced Portfolio Analytics
                  <span className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 px-2 py-1 rounded">
                    KANA PERPS
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Combined view of domain assets and perpetual positions
                </p>
              </div>
            </div>

            <PerpsPortfolioSection />
          </section>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <motion.div
          className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedAsset(null)}
        >
          <motion.div
            className="glass-panel border border-[#FF7A00]/50 rounded-lg max-w-4xl w-full overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-start justify-between p-6">
              <div>
                <h2 className="font-space-grotesk text-2xl font-bold">{selectedAsset.domain}</h2>
                <p className="font-ibm-plex-sans text-gray-300 max-w-md">{selectedAsset.metadata.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-6 p-6 pt-0 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-6">
                  <div>
                    <h3 className="font-space-grotesk text-lg font-bold mb-3">Tokenization</h3>
                    <div className="bg-secondary/20 p-3 rounded-md font-ibm-plex-mono text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Asset Type:</span>
                        <span className="font-bold text-foreground">Stacks Object</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ticker:</span>
                        <span className="font-bold text-foreground">${selectedAsset.tokenization.tokenTicker}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Supply:</span>
                        <span className="text-foreground">{selectedAsset.tokenization.totalSupply.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-space-grotesk text-lg font-bold mb-3">Chain Data</h3>
                    <div className="bg-secondary/20 p-3 rounded-md font-ibm-plex-mono text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Asset ID:</span>
                        <span className="text-foreground">{selectedAsset.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="capitalize text-foreground">{selectedAsset.status}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Mint Date:</span>
                        <span className="text-foreground">{formatDate(selectedAsset.mintDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Block:</span>
                        <span className="text-foreground">#{selectedAsset.blockHeight.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">TX Hash:</span>
                        <a
                          href={`https://explorer.stackslabs.com/txn/${selectedAsset.txHash}?network=testnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#FFC700] hover:underline"
                        >
                          <span className="truncate max-w-[120px]">{selectedAsset.txHash}</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Middle Column */}
                <div className="md:col-span-1">
                  <h3 className="font-space-grotesk text-lg font-bold mb-3">Valuation</h3>
                  <div className="bg-secondary/20 p-4 rounded-lg space-y-4">
                    <div className="text-center">
                      <p className="font-ibm-plex-mono text-sm text-muted-foreground">Score</p>
                      <p className="font-space-grotesk text-4xl font-bold text-solar-yellow-text">{selectedAsset.valuation.score}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-ibm-plex-mono text-sm text-muted-foreground">Estimated Market Value</p>
                      <p className="font-space-grotesk text-3xl font-bold text-foreground">${selectedAsset.valuation.marketValue.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                        <div className="flex items-center gap-2 text-gray-300"><BarChart className="h-4 w-4 text-solar-yellow-text/70" />SEO Authority</div>
                        <span className="font-bold text-foreground">${selectedAsset.valuation.seoAuthority.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                        <div className="flex items-center gap-2 text-gray-300"><Sparkles className="h-4 w-4 text-solar-yellow-text/70" />Traffic Estimate</div>
                        <span className="font-bold text-foreground">${selectedAsset.valuation.trafficEstimate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                        <div className="flex items-center gap-2 text-gray-300"><ShieldCheck className="h-4 w-4 text-solar-yellow-text/70" />Brandability</div>
                        <span className="font-bold text-foreground">${selectedAsset.valuation.brandability.toLocaleString()}</span>
                      </div>
                      <div className="flex items--center justify-between font-ibm-plex-mono text-xs">
                        <div className="flex items-center gap-2 text-gray-300"><Globe className="h-4 w-4 text-solar-yellow-text/70" />TLD Rarity</div>
                        <span className="font-bold text-foreground">${selectedAsset.valuation.tldRarity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right Column */}
                <div className="md:col-span-1">
                  <h3 className="font-space-grotesk text-lg font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-solar-yellow-text" /> Market Performance</h3>
                  {selectedAsset.marketData && (
                    <div className="space-y-3">
                      <PerformanceChart data={selectedAsset.marketData.priceHistory} />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/20 p-3 rounded-md">
                          <span className="font-ibm-plex-mono text-muted-foreground text-xs block">Floor Price</span>
                          <span className="font-ibm-plex-mono text-gray-200 text-lg font-medium flex items-center">{selectedAsset.marketData.floorPrice.toFixed(2)} <span className="text-xs ml-1">USDCx</span></span>
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-md">
                          <span className="font-ibm-plex-mono text-muted-foreground text-xs block">Offers</span>
                          <span className="font-ibm-plex-mono text-gray-200 text-lg font-medium">{selectedAsset.marketData.offers}</span>
                        </div>
                        <div className="bg-secondary/20 p-3 rounded-md col-span-2">
                          <span className="font-ibm-plex-mono text-muted-foreground text-xs block">24h Volume</span>
                          <span className="font-ibm-plex-mono text-gray-200 text-sm font-medium">{selectedAsset.marketData.dailyVolume.toLocaleString()} USDCx</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};