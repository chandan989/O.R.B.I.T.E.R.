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
} from "lucide-react";
import { useWallet } from "../components/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

// --- Helper Components ---
const MainPerformanceChart = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return <div className="h-64 w-full bg-black/20 rounded-lg flex items-center justify-center"><p className="font-ibm-plex-mono text-gray-500">No price data available</p></div>;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / (max - min)) * 90 + 5}`).join(' ');
    const isUp = data[data.length - 1] >= data[0];

    return (
        <div className="h-64 w-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isUp ? '#FFC700' : '#FF7A00'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={isUp ? '#FFC700' : '#FF7A00'} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.polyline
                    fill="url(#chart-gradient)"
                    stroke={isUp ? '#FFC700' : '#FF7A00'}
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

// --- Mock Data ---
interface Asset {
  id: string;
  domain: string;
  description: string;
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
}

const mockAssets: Asset[] = [
  {
    id: "TRJ-001",
    domain: "blockchain-hub.com",
    description: "A premium domain for the decentralized world, representing a central hub for blockchain innovation and news.",
    attributes: [
        { trait_type: "TLD", value: ".com" },
        { trait_type: "Length", value: "14" },
        { trait_type: "Age", value: "8 years" },
        { trait_type: "Keywords", value: "blockchain, hub" },
    ],
    listingPrice: 12.50,
    priceChange24h: 1.20,
    priceChangePercent24h: 10.6,
    volume24h: 45200,
    marketCap: 125000,
    priceHistory: [11.3, 11.5, 11.4, 11.8, 12.0, 12.2, 12.5],
    orderBook: {
      bids: [{ price: 12.45, size: 10 }, { price: 12.40, size: 15 }, { price: 12.35, size: 20 }, { price: 12.30, size: 25 }],
      asks: [{ price: 12.55, size: 8 }, { price: 12.60, size: 12 }, { price: 12.65, size: 18 }, { price: 12.70, size: 22 }],
    },
    tradeHistory: [{ price: 12.50, size: 5, time: "14:30:15", side: 'buy' }, { price: 12.48, size: 3, time: "14:29:55", side: 'sell' }],
  },
  {
    id: "TRJ-002",
    domain: "nft-gallery.io",
    description: "A short and memorable domain perfect for an NFT marketplace or a digital art gallery project.",
    attributes: [
        { trait_type: "TLD", value: ".io" },
        { trait_type: "Length", value: "11" },
        { trait_type: "Age", value: "3 years" },
        { trait_type: "Keywords", value: "nft, gallery" },
    ],
    listingPrice: 6.80,
    priceChange24h: -0.40,
    priceChangePercent24h: -5.5,
    volume24h: 23100,
    marketCap: 68000,
    priceHistory: [7.2, 7.1, 7.0, 6.9, 6.85, 6.82, 6.80],
    orderBook: {
      bids: [{ price: 6.75, size: 25 }, { price: 6.70, size: 30 }, { price: 6.65, size: 40 }],
      asks: [{ price: 6.85, size: 20 }, { price: 6.90, size: 22 }, { price: 6.95, size: 28 }],
    },
    tradeHistory: [{ price: 6.80, size: 10, time: "14:31:02", side: 'buy' }, { price: 6.82, size: 8, time: "14:30:45", side: 'sell' }],
  },
  {
    id: "TRJ-004",
    domain: "crypto-news.org",
    description: "An authoritative domain for a cryptocurrency news outlet or a non-profit educational resource.",
    attributes: [
        { trait_type: "TLD", value: ".org" },
        { trait_type: "Length", value: "11" },
        { trait_type: "Age", value: "6 years" },
        { trait_type: "Keywords", value: "crypto, news" },
    ],
    listingPrice: 15.00,
    priceChange24h: 2.50,
    priceChangePercent24h: 20.0,
    volume24h: 67800,
    marketCap: 150000,
    priceHistory: [12.5, 13.0, 13.2, 13.8, 14.2, 14.7, 15.0],
    orderBook: {
      bids: [{ price: 14.95, size: 5 }, { price: 14.90, size: 10 }, { price: 14.85, size: 15 }],
      asks: [{ price: 15.05, size: 7 }, { price: 15.10, size: 11 }, { price: 15.15, size: 14 }],
    },
    tradeHistory: [{ price: 15.00, size: 2, time: "14:32:10", side: 'buy' }, { price: 14.98, size: 4, time: "14:31:50", side: 'sell' }],
  },
];

export const ExosphereExchange = () => {
  const { isWalletConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(mockAssets[0]);
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [activeTab, setActiveTab] = useState('trade');

  const filteredAssets = mockAssets.filter(asset => 
    asset.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PriceChange = ({ change }: { change: number }) => (
    <span className={`flex items-center text-sm ${change >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>
      {change >= 0 ? <ArrowUp className="h-3 w-3"/> : <ArrowDown className="h-3 w-3"/>}
      {Math.abs(change)}%
    </span>
  );

  const maxOrderSize = Math.max(
    ...selectedAsset.orderBook.bids.map(o => o.size),
    ...selectedAsset.orderBook.asks.map(o => o.size)
  );
  
  const totalMarketCap = mockAssets.reduce((sum, asset) => sum + asset.marketCap, 0);
  const totalVolume = mockAssets.reduce((sum, asset) => sum + asset.volume24h, 0);

  return (
    <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
      <main className="w-full max-w-[96rem] mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3 justify-center">
                <Globe className="h-9 w-9 text-[#FF7A00] orbit-animation" />
                Exosphere Exchange
            </h1>
            <p className="font-ibm-plex-sans text-lg text-gray-400 mt-2 max-w-3xl mx-auto">
                Trade tokenized Web2 assets on the Aptos blockchain. Discover, analyze, and exchange on-chain domain name tokens.
            </p>
        </div>

        {/* Market Overview */}
        <section>
            <div className="glass-panel p-4 md:p-6 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Market Cap</p>
                        <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">${(totalMarketCap/1_000_000).toFixed(2)}M</p>
                    </div>
                    <div>
                        <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">24h Volume</p>
                        <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">${(totalVolume/1_000_000).toFixed(2)}M</p>
                    </div>
                    <div>
                        <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Listed Assets</p>
                        <p className="font-ibm-plex-mono text-xl font-bold text-gray-50">{mockAssets.length}</p>
                    </div>
                    <div>
                        <p className="font-ibm-plex-mono text-xs text-gray-400 uppercase">Market Sentiment</p>
                        <p className={`font-ibm-plex-mono text-xl font-bold ${mockAssets.filter(a => a.priceChange24h >= 0).length > mockAssets.length / 2 ? 'text-orbital-success' : 'text-orbital-fail'}`}>
                            Bullish
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Panel: Market List */}
          <div className="lg:col-span-1 h-[calc(100vh-24rem)] flex flex-col glass-panel p-4 rounded-lg border border-white/10">
            <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Markets"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-9 pr-4 font-ibm-plex-mono focus:ring-1 focus:ring-[#FF7A00] outline-none transition"
                />
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 -mr-2 pr-2">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border border-transparent ${selectedAsset.id === asset.id ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-space-grotesk font-bold text-gray-50">{asset.domain}</p>
                    <p className={`font-ibm-plex-mono font-bold text-base ${asset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>{asset.listingPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <p className="text-gray-400 font-ibm-plex-mono">Vol: {(asset.volume24h/1000).toFixed(1)}k</p>
                    <PriceChange change={asset.priceChangePercent24h} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel: Chart and Trade */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Header */}
            <div className="glass-panel p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Globe className="h-10 w-10 text-[#FF7A00]"/>
                  <div>
                    <h2 className="font-space-grotesk text-2xl font-bold text-gray-50">{selectedAsset.domain}</h2>
                    <p className="text-gray-400 font-ibm-plex-sans text-sm">On-chain Domain Name Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-ibm-plex-mono text-2xl font-bold ${selectedAsset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>{selectedAsset.listingPrice.toFixed(2)} <span className="text-base text-gray-400">APT</span></p>
                  <div className="flex items-center justify-end gap-2 text-sm">
                    <p className={`font-ibm-plex-mono ${selectedAsset.priceChange24h >= 0 ? 'text-orbital-success' : 'text-orbital-fail'}`}>{selectedAsset.priceChange24h.toFixed(2)}</p>
                    <PriceChange change={selectedAsset.priceChangePercent24h} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="glass-panel p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-space-grotesk text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-solar-yellow-text"/> Price Chart</h3>
                {/* Timeframe selector can be added here */}
              </div>
              <MainPerformanceChart data={selectedAsset.priceHistory} />
            </div>

            {/* Tabs: Trade / Info */}
            <div className="glass-panel rounded-lg border border-white/10">
              <div className="flex border-b border-white/10">
                <button onClick={() => setActiveTab('trade')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all ${activeTab === 'trade' ? 'text-white border-b-2 border-[#FF7A00]' : 'text-gray-400 hover:bg-white/5'}`}>Trade</button>
                <button onClick={() => setActiveTab('info')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all ${activeTab === 'info' ? 'text-white border-b-2 border-[#FF7A00]' : 'text-gray-400 hover:bg-white/5'}`}>Info</button>
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
                            <div className="flex rounded-lg overflow-hidden border border-white/10 mb-4">
                                <button onClick={() => setTradeSide('buy')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all text-sm ${tradeSide === 'buy' ? 'bg-orbital-success/20 text-orbital-success' : 'text-gray-400 hover:bg-white/5'}`}>BUY</button>
                                <button onClick={() => setTradeSide('sell')} className={`flex-1 p-3 font-space-grotesk font-bold text-center transition-all text-sm ${tradeSide === 'sell' ? 'bg-orbital-fail/20 text-orbital-fail' : 'text-gray-400 hover:bg-white/5'}`}>SELL</button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="font-ibm-plex-mono text-xs text-gray-400">Price (APT)</label>
                                    <input type="number" defaultValue={selectedAsset.listingPrice.toFixed(2)} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-ibm-plex-mono focus:ring-1 focus:ring-[#FF7A00] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-ibm-plex-mono text-xs text-gray-400">Amount</label>
                                    <input type="number" placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-ibm-plex-mono focus:ring-1 focus:ring-[#FF7A00] outline-none" />
                                </div>
                                <div className="flex justify-between font-ibm-plex-mono text-xs">
                                    <span className="text-gray-400">Total</span>
                                    <span>0.00 APT</span>
                                </div>
                                <Button className={`w-full font-space-grotesk font-bold transition-colors ${tradeSide === 'buy' ? 'bg-orbital-success/90 hover:bg-orbital-success text-black' : 'bg-orbital-fail/90 hover:bg-orbital-fail text-black'}`}>
                                    {tradeSide.toUpperCase()} {selectedAsset.domain}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-space-grotesk font-bold text-lg mb-2">About {selectedAsset.domain}</h4>
                                <p className="font-ibm-plex-sans text-sm text-gray-300">{selectedAsset.description}</p>
                            </div>
                            <div>
                                <h4 className="font-space-grotesk font-bold text-lg mb-2">Attributes</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {selectedAsset.attributes.map(attr => (
                                        <div key={attr.trait_type} className="bg-black/20 p-3 rounded-lg">
                                            <p className="font-ibm-plex-mono text-xs text-gray-400">{attr.trait_type}</p>
                                            <p className="font-ibm-plex-mono font-bold text-gray-50">{attr.value}</p>
                                        </div>
                                    ))}
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
            <div className="glass-panel rounded-lg flex-1 flex flex-col border border-white/10">
              <h3 className="font-space-grotesk font-bold p-3 border-b border-white/10 flex items-center gap-2"><BookOpen className="h-4 w-4 text-gray-400"/>Order Book</h3>
              <div className="flex-grow overflow-y-auto text-xs font-ibm-plex-mono">
                <table className="w-full">
                    <thead>
                        <tr className="text-gray-400 sticky top-0 bg-black/50 backdrop-blur-sm">
                            <th className="text-left p-2 font-normal">Price (APT)</th>
                            <th className="text-right p-2 font-normal">Size</th>
                            <th className="text-right p-2 font-normal">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedAsset.orderBook.asks.slice(0, 8).reverse().map((ask, i) => (
                            <tr key={i} className="relative hover:bg-white/5">
                                <td className="p-1 pl-2 text-orbital-fail">{ask.price.toFixed(2)}</td>
                                <td className="p-1 text-right">{ask.size}</td>
                                <td className="p-1 pr-2 text-right">{(ask.price * ask.size).toFixed(2)}</td>
                                <motion.div className="absolute top-0 right-0 h-full bg-orbital-fail/10 pointer-events-none" initial={{width:0}} animate={{width: `${(ask.size / maxOrderSize) * 100}%`}}/>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="py-2 border-t border-b border-white/10 my-1 font-ibm-plex-mono text-lg text-center font-bold text-white">
                  {selectedAsset.listingPrice.toFixed(2)} APT
                </div>
                <table className="w-full">
                    <tbody>
                        {selectedAsset.orderBook.bids.slice(0, 8).map((bid, i) => (
                            <tr key={i} className="relative hover:bg-white/5">
                                <td className="p-1 pl-2 text-orbital-success">{bid.price.toFixed(2)}</td>
                                <td className="p-1 text-right">{bid.size}</td>
                                <td className="p-1 pr-2 text-right">{(bid.price * bid.size).toFixed(2)}</td>
                                <motion.div className="absolute top-0 right-0 h-full bg-orbital-success/10 pointer-events-none" initial={{width:0}} animate={{width: `${(bid.size / maxOrderSize) * 100}%`}}/>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>

            {/* Trade History */}
            <div className="glass-panel rounded-lg flex-1 flex flex-col border border-white/10">
              <h3 className="font-space-grotesk font-bold p-3 border-b border-white/10 flex items-center gap-2"><History className="h-4 w-4 text-gray-400"/>Trade History</h3>
              <div className="flex-grow overflow-y-auto text-xs font-ibm-plex-mono">
                <table className="w-full">
                    <thead>
                        <tr className="text-gray-400 sticky top-0 bg-black/50 backdrop-blur-sm">
                            <th className="text-left p-2 font-normal">Price (APT)</th>
                            <th className="text-right p-2 font-normal">Size</th>
                            <th className="text-right p-2 font-normal">Time</th>
                        </tr>
                    </thead>
                    <AnimatePresence>
                        <tbody>
                        {selectedAsset.tradeHistory.map((trade, i) => (
                            <motion.tr key={i} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="hover:bg-white/5">
                                <td className={`p-1 pl-2 ${trade.side === 'buy' ? 'text-orbital-success' : 'text-orbital-fail'}`}>{trade.price.toFixed(2)}</td>
                                <td className="p-1 text-right">{trade.size}</td>
                                <td className="p-1 pr-2 text-right text-gray-400">{trade.time}</td>
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
