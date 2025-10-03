
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

interface SatelliteAsset {
  id: string;
  domain: string;
  mintDate: string;
  blockHeight: number;
  txHash: string;
  status: "active" | "inactive" | "transferring";
  metadata: {
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
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
  marketData?: {
    floorPrice: number;
    dailyVolume: number;
    totalVolume: number;
    offers: number;
    priceHistory: number[];
  }
}

const mockAssets: SatelliteAsset[] = [
    {
        id: "ORBIT-001",
        domain: "myawesomesite.com",
        mintDate: "2024-03-15T10:30:00Z",
        blockHeight: 157293847,
        txHash: "0xa1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
        status: "active",
        metadata: {
          description: "Premium domain asset tokenized on Aptos",
          attributes: [
            { trait_type: "TLD", value: ".com" },
            { trait_type: "Length", value: "15" },
          ]
        },
        valuation: { score: 780, marketValue: 25000, seoAuthority: 12000, trafficEstimate: 8000, brandability: 4000, tldRarity: 1000 },
        tokenization: { tokenTicker: "MYAWS", totalSupply: 25000 },
        marketData: {
            floorPrice: 150.50,
            dailyVolume: 25000,
            totalVolume: 1500000,
            offers: 12,
            priceHistory: [140, 142, 145, 143, 148, 150, 150.5]
        }
      },
      {
        id: "ORBIT-002",
        domain: "crypto-hub.io",
        mintDate: "2024-03-14T15:45:00Z",
        blockHeight: 157290123,
        txHash: "0xb2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890ab",
        status: "active",
        metadata: {
          description: "Tech domain with established presence",
          attributes: [
            { trait_type: "TLD", value: ".io" },
            { trait_type: "Length", value: "10" },
          ]
        },
        valuation: { score: 850, marketValue: 78000, seoAuthority: 30000, trafficEstimate: 25000, brandability: 15000, tldRarity: 8000 },
        tokenization: { tokenTicker: "CRHUB", totalSupply: 78000 },
        marketData: {
            floorPrice: 320.00,
            dailyVolume: 78000,
            totalVolume: 2300000,
            offers: 5,
            priceHistory: [300, 305, 310, 315, 312, 318, 320]
        }
      },
      {
        id: "ORBIT-003",
        domain: "web3future.xyz",
        mintDate: "2024-03-13T09:20:00Z",
        blockHeight: 157285456,
        txHash: "0xc3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
        status: "transferring",
        metadata: {
          description: "Next-gen domain for Web3 innovation",
          attributes: [
            { trait_type: "TLD", value: ".xyz" },
            { trait_type: "Length", value: "11" },
          ]
        },
        valuation: { score: 620, marketValue: 12000, seoAuthority: 5000, trafficEstimate: 4000, brandability: 2000, tldRarity: 1000 },
        tokenization: { tokenTicker: "W3FUT", totalSupply: 12000 },
        marketData: {
            floorPrice: 95.80,
            dailyVolume: 12000,
            totalVolume: 540000,
            offers: 23,
            priceHistory: [100, 98, 96, 95, 97, 95, 95.8]
        }
      }
];

const AssetStatusChart = ({ assets }: { assets: SatelliteAsset[] }) => {
  const active = assets.filter(a => a.status === 'active').length;
  const transferring = assets.filter(a => a.status === 'transferring').length;
  const inactive = assets.filter(a => a.status === 'inactive').length;
  const total = assets.length;
  const totalShares = assets.reduce((sum, asset) => sum + asset.tokenization.totalSupply, 0);
  const totalMarketCap = assets.reduce((sum, asset) => sum + asset.valuation.marketValue, 0);

  const data = [
    { status: 'Active', count: active, color: 'bg-[#FFC700]' },
    { status: 'Transferring', count: transferring, color: 'bg-[#FF7A00]' },
    { status: 'Inactive', count: inactive, color: 'bg-gray-600' },
  ];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
          <div>
              <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Total Assets</p>
              <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">{total}</p>
          </div>
          <div>
              <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Total Shares</p>
              <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">{totalShares.toLocaleString()}</p>
          </div>
          <div>
              <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Total Market Cap</p>
              <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">${totalMarketCap.toLocaleString()}</p>
          </div>
      </div>
      <div className="flex justify-between items-center font-ibm-plex-mono text-xs text-gray-400 mb-2">
        <span>Asset Status Distribution</span>
        <span>Total: {total}</span>
      </div>
      <div className="w-full bg-black/20 rounded-full h-4 flex overflow-hidden border border-white/10">
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
                    stroke={isUp ? '#FFC700' : '#FF7A00'}
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        </div>
    );
};

export const SatelliteConstellation = () => {
  const [selectedAsset, setSelectedAsset] = useState<SatelliteAsset | null>(null);

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
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-[#FFC700]" />;
      case "transferring": return <Clock className="h-4 w-4 text-[#FF7A00]" />;
      case "inactive": return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <div className="text-center mb-8 md:mb-12">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
                <Satellite className="h-9 w-9 text-[#FF7A00] orbit-animation" />
                Manage your Aptos Objects
            </h1>
            <p className="font-ibm-plex-sans text-lg text-gray-400 mt-2 max-w-3xl mx-auto">
                An overview of your Aptos Objects and their fractional shares. Monitor, manage, and analyze your digital universe.
            </p>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12">
            {/* Constellation Overview */}
            <section className="fade-in-section">
                <div className="glass-panel p-6 md:p-8 rounded-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <h2 className="font-space-grotesk text-xl font-bold text-white mb-2 md:mb-0">Constellation Overview</h2>
                        <span className="font-ibm-plex-mono text-sm solar-yellow-text">[ STATUS: OPERATIONAL ]</span>
                    </div>
                    <AssetStatusChart assets={mockAssets} />
                </div>
            </section>

            {/* Asset Grid */}
            <section className="fade-in-section">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAssets.map((asset, index) => (
                    <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                    >
                    <div
                        className="glass-panel h-full p-5 rounded-lg border border-transparent hover:border-[#FF7A00]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                        onClick={() => setSelectedAsset(asset)}
                    >
                        <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(asset.status)}
                                <span className="font-ibm-plex-mono text-xs text-gray-400">Object ID: {asset.id}</span>
                            </div>
                            <Badge variant="secondary" className="font-ibm-plex-mono text-xs capitalize bg-white/5 text-gray-300 border-white/10">
                                {asset.status}
                            </Badge>
                        </div>

                        <h3 className="font-space-grotesk text-2xl font-bold truncate text-gray-50">
                            {asset.domain}
                        </h3>
                        <p className="font-ibm-plex-mono text-sm text-gray-400">
                            Shares: {asset.tokenization.totalSupply.toLocaleString()}
                        </p>
                        <p className="font-ibm-plex-mono text-lg text-solar-yellow-text mt-2">
                            ${asset.valuation.marketValue.toLocaleString()}
                        </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                {asset.metadata.attributes.slice(0, 2).map((attr, i) => (
                                <div key={i} className="bg-black/20 p-2 rounded-md">
                                    <span className="font-ibm-plex-mono text-gray-400 block">{attr.trait_type}</span>
                                    <span className="font-ibm-plex-mono text-gray-200 font-medium">{attr.value}</span>
                                </div>
                                ))}
                            </div>
                            <div className="font-ibm-plex-mono text-xs text-gray-500 text-center pt-2">
                                Minted on {formatDate(asset.mintDate)}
                            </div>
                        </div>
                    </div>
                    </motion.div>
                ))}
                </div>
            </section>

            {/* Empty State */}
            {mockAssets.length === 0 && (
                <section className="fade-in-section">
                    <div className="glass-panel rounded-lg py-16 px-8 text-center">
                        <div className="mb-6 opacity-30">
                        <Satellite className="h-16 w-16 mx-auto" />
                        </div>
                        <h2 className="font-space-grotesk text-3xl font-bold mb-2">
                        No Satellites in Orbit
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Launch your first domain to see it appear in your constellation.
                        </p>
                        <Button className="cta-button mt-10 inline-block bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-lg">
                        [ INITIATE LAUNCH SEQUENCE ]
                        </Button>
                    </div>
                </section>
            )}
        </div>

        {/* Asset Detail Modal */}
        {selectedAsset && (
            <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
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
                                <div className="bg-black/20 p-3 rounded-md font-ibm-plex-mono text-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Asset Type:</span>
                                        <span className="font-bold text-gray-50">Aptos Object</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Ticker:</span>
                                        <span className="font-bold text-gray-50">${selectedAsset.tokenization.tokenTicker}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total Supply:</span>
                                        <span className="text-gray-50">{selectedAsset.tokenization.totalSupply.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-space-grotesk text-lg font-bold mb-3">Chain Data</h3>
                                <div className="bg-black/20 p-3 rounded-md font-ibm-plex-mono text-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Asset ID:</span>
                                        <span className="text-gray-50">{selectedAsset.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Status:</span>
                                        <span className="capitalize text-gray-50">{selectedAsset.status}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Mint Date:</span>
                                        <span className="text-gray-50">{formatDate(selectedAsset.mintDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Block:</span>
                                        <span className="text-gray-50">#{selectedAsset.blockHeight.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">TX Hash:</span>
                                        <a href="#" className="flex items-center gap-2 text-[#FFC700] hover:underline">
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
                            <div className="bg-black/20 p-4 rounded-lg space-y-4">
                                <div className="text-center">
                                    <p className="font-ibm-plex-mono text-sm text-gray-400">Score</p>
                                    <p className="font-space-grotesk text-4xl font-bold text-solar-yellow-text">{selectedAsset.valuation.score}</p>
                                </div>
                                <div className="text-center">
                                    <p className="font-ibm-plex-mono text-sm text-gray-400">Estimated Market Value</p>
                                    <p className="font-space-grotesk text-3xl font-bold text-white">${selectedAsset.valuation.marketValue.toLocaleString()}</p>
                                </div>
                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                                        <div className="flex items-center gap-2 text-gray-300"><BarChart className="h-4 w-4 text-solar-yellow-text/70"/>SEO Authority</div>
                                        <span className="font-bold text-white">${selectedAsset.valuation.seoAuthority.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                                        <div className="flex items-center gap-2 text-gray-300"><Sparkles className="h-4 w-4 text-solar-yellow-text/70"/>Traffic Estimate</div>
                                        <span className="font-bold text-white">${selectedAsset.valuation.trafficEstimate.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-ibm-plex-mono text-xs">
                                        <div className="flex items-center gap-2 text-gray-300"><ShieldCheck className="h-4 w-4 text-solar-yellow-text/70"/>Brandability</div>
                                        <span className="font-bold text-white">${selectedAsset.valuation.brandability.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items--center justify-between font-ibm-plex-mono text-xs">
                                        <div className="flex items-center gap-2 text-gray-300"><Globe className="h-4 w-4 text-solar-yellow-text/70"/>TLD Rarity</div>
                                        <span className="font-bold text-white">${selectedAsset.valuation.tldRarity.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="md:col-span-1">
                            <h3 className="font-space-grotesk text-lg font-bold mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-solar-yellow-text"/> Market Performance</h3>
                            {selectedAsset.marketData && (
                                <div className="space-y-3">
                                    <PerformanceChart data={selectedAsset.marketData.priceHistory} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/20 p-3 rounded-md">
                                            <span className="font-ibm-plex-mono text-gray-400 text-xs block">Floor Price</span>
                                            <span className="font-ibm-plex-mono text-gray-200 text-lg font-medium flex items-center">{selectedAsset.marketData.floorPrice.toFixed(2)} <span className="text-xs ml-1">APT</span></span>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-md">
                                            <span className="font-ibm-plex-mono text-gray-400 text-xs block">Offers</span>
                                            <span className="font-ibm-plex-mono text-gray-200 text-lg font-medium">{selectedAsset.marketData.offers}</span>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-md col-span-2">
                                            <span className="font-ibm-plex-mono text-gray-400 text-xs block">24h Volume</span>
                                            <span className="font-ibm-plex-mono text-gray-200 text-sm font-medium">{selectedAsset.marketData.dailyVolume.toLocaleString()} APT</span>
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