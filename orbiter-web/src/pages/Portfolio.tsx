import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Shield,
  Award,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Plus,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useWallet } from "../components/Layout";
import { portfolioService, PortfolioSummary, PortfolioHolding } from "../services/portfolioService";

export const Portfolio = () => {
  const { connected: isWalletConnected, account } = useWallet();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'holdings' | 'performance'>('holdings');

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const portfolioData = await portfolioService.getUserPortfolio(account?.address?.toString());
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTrade = (domain: string) => {
    // Store the domain to trade in localStorage for Exosphere Exchange to pick up
    localStorage.setItem('selectedTradeDomain', domain);
    // Use window.location for reliable navigation
    window.location.href = '/exchange';
  };

  const navigateToManage = (domain: string) => {
    // Store the domain to view in localStorage for Satellite Constellation to pick up
    localStorage.setItem('selectedViewDomain', domain);
    // Use window.location for reliable navigation
    window.location.href = '/launch';
  };

  const refreshPortfolio = async () => {
    setRefreshing(true);
    try {
      const portfolioData = await portfolioService.getUserPortfolio(account?.address?.toString());
      setPortfolio(portfolioData);
      console.log('✅ Portfolio refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickList = (holding: PortfolioHolding) => {
    const message = `Quick list ${holding.sharesOwned} shares of ${holding.domain} for ${holding.currentPrice.toFixed(2)} USDCx each?\n\nThis would create a listing on the Exosphere Exchange.`;

    if (confirm(message)) {
      // Store listing data for Exosphere Exchange
      localStorage.setItem('quickListing', JSON.stringify({
        domain: holding.domain,
        shares: holding.sharesOwned,
        price: holding.currentPrice
      }));

      window.location.href = '/exchange';
    }
  };

  const exportPortfolioReport = () => {
    if (!portfolio || !metrics) return;

    const totalValue = portfolioService.formatCurrency(portfolio.totalValue);
    const changePercent = portfolio.totalChangePercent24h.toFixed(2);
    const trend = portfolio.totalChangePercent24h >= 0 ? '📈 UP' : '📉 DOWN';

    const report = `🚀 O.R.B.I.T.E.R. Portfolio Report
    
💰 Total Value: ${totalValue}
📊 24h Change: ${changePercent}% ${trend}
🏠 Holdings: ${portfolio.holdings.length} domains
⚖️ Risk Level: ${metrics.riskLevel}
🎯 Diversification: ${portfolio.diversificationScore.toFixed(0)}/100

📈 Best Performer: ${metrics.bestPerformer?.domain || 'N/A'} (${metrics.bestPerformer?.priceChangePercent24h.toFixed(2) || '0'}%)
📉 Needs Attention: ${metrics.worstPerformer?.domain || 'N/A'} (${metrics.worstPerformer?.priceChangePercent24h.toFixed(2) || '0'}%)

Generated on ${new Date().toLocaleString()}`;

    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
      alert('📋 Portfolio report copied to clipboard!');
    }).catch(() => {
      // Fallback: show in alert
      alert(report);
    });
  };

  useEffect(() => {
    if (isWalletConnected) {
      loadPortfolio();
    } else {
      setLoading(false);
    }
  }, [isWalletConnected, account?.address]);

  const metrics = portfolio ? portfolioService.getPortfolioMetrics(portfolio) : null;
  const allocation = portfolio ? portfolioService.getPortfolioAllocation(portfolio) : [];

  const HoldingCard = ({ holding }: { holding: PortfolioHolding }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 rounded-lg border border-border hover:border-border transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FE6440] to-[#FFC700] rounded-lg flex items-center justify-center">
            <span className="font-space-grotesk font-bold text-black text-sm">
              {holding.tokenTicker.slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-space-grotesk font-bold text-foreground">{holding.domain}</h3>
            <p className="font-ibm-plex-mono text-xs text-muted-foreground">{holding.tokenTicker}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-ibm-plex-mono text-lg font-bold text-foreground">
            {portfolioService.formatCurrency(holding.totalValue)}
          </p>
          <div className={`flex items-center gap-1 text-sm ${portfolioService.getPriceChangeColor(holding.priceChangePercent24h)}`}>
            {holding.priceChangePercent24h >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(holding.priceChangePercent24h).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground">Shares Owned</p>
          <p className="font-ibm-plex-mono font-bold text-foreground">{holding.sharesOwned.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground">Ownership</p>
          <p className="font-ibm-plex-mono font-bold text-foreground">{holding.ownershipPercentage.toFixed(2)}%</p>
        </div>
        <div>
          <p className="font-ibm-plex-mono text-xs text-muted-foreground">Price</p>
          <p className="font-ibm-plex-mono font-bold text-foreground">{holding.currentPrice.toFixed(2)} USDCx</p>
        </div>
      </div>

      {/* Progress bar for ownership percentage */}
      <div className="mb-4">
        <div className="w-full bg-secondary/20 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(holding.ownershipPercentage, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-gradient-to-r from-[#FE6440] to-[#FFC700] h-1.5 rounded-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => navigateToTrade(holding.domain)}
          className="flex-1 bg-blue-600/90 hover:bg-blue-600 text-white font-space-grotesk font-bold text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <TrendingUp className="h-3 w-3" />
          Trade
        </button>
        <button
          onClick={() => navigateToManage(holding.domain)}
          className="flex-1 bg-gray-600/90 hover:bg-gray-600 text-white font-space-grotesk font-bold text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <Settings className="h-3 w-3" />
          Manage
        </button>
        <button
          onClick={() => handleQuickList(holding)}
          className="flex-1 bg-green-600/90 hover:bg-green-600 text-white font-space-grotesk font-bold text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="h-3 w-3" />
          List
        </button>
      </div>
    </motion.div>
  );

  if (!isWalletConnected) {
    return (
      <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-lg"
          >
            <Wallet className="h-16 w-16 text-[#FE6440] mx-auto mb-4" />
            <h2 className="font-space-grotesk text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="font-ibm-plex-sans text-muted-foreground">
              Connect your wallet to view your domain portfolio and trading history.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <div className="w-full max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-black/10 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-black/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-lg"
          >
            <PieChart className="h-16 w-16 text-[#FE6440] mx-auto mb-4" />
            <h2 className="font-space-grotesk text-2xl font-bold mb-2">Start Your Domain Portfolio</h2>
            <p className="font-ibm-plex-sans text-muted-foreground mb-6">
              Transform your Web2 domains into tradeable blockchain assets. Create your first tokenized domain or buy shares of existing ones.
            </p>

            {/* Domain Creation Form */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter domain (e.g., example.com)"
                  className="flex-1 bg-secondary/30 border border-border rounded-lg px-4 py-3 font-ibm-plex-mono focus:ring-1 focus:ring-[#FE6440] outline-none"
                />
                <button
                  onClick={() => window.location.href = '/launch'}
                  className="bg-gradient-to-r from-[#FE6440] to-[#FFC700] text-black font-space-grotesk font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Tokenize
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Create an Stacks Object from your domain
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                onClick={() => window.location.href = '/launch'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FE6440] to-[#FFC700] text-black font-space-grotesk font-bold px-6 py-3 rounded-lg"
              >
                <Plus className="h-4 w-4" />
                Create First Domain
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/exchange'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-black/10 hover:bg-black/20 text-white font-space-grotesk font-bold px-6 py-3 rounded-lg border border-border"
              >
                <ExternalLink className="h-4 w-4" />
                Browse Marketplace
              </motion.button>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>💡 <strong>Quick Start:</strong> Own a domain? Tokenize it in seconds. Don't own one? Buy fractional shares on the exchange.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-gray-200 min-h-screen p-4 sm:p-6 md:p-8 pt-24 md:pt-32">
      <main className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold tracking-tighter flex items-center gap-3">
              <Wallet className="h-9 w-9 text-primary" />
              Portfolio
            </h1>
            <p className="font-ibm-plex-sans text-lg text-muted-foreground mt-2">
              Your tokenized domain holdings, performance metrics, and domain creation tools
            </p>
          </div>

          <div className="flex gap-2">
            {/* Quick Actions */}
            <button
              onClick={refreshPortfolio}
              disabled={refreshing}
              className="bg-black/10 hover:bg-black/20 text-gray-300 font-space-grotesk font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {refreshing ? (
                <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin"></div>
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>

            <button
              onClick={() => window.location.href = '/exchange'}
              className="bg-blue-600/90 hover:bg-blue-600 text-white font-space-grotesk font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Trade Now
            </button>

            <button
              onClick={() => window.location.href = '/launch'}
              className="bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-space-grotesk font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Domain
            </button>

            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-black/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('holdings')}
                className={`px-3 py-1 rounded-md font-space-grotesk font-bold text-sm transition-all ${viewMode === 'holdings'
                    ? 'bg-[#FF7A00] text-black'
                    : 'text-gray-300 hover:bg-black/10'
                  }`}
              >
                Holdings
              </button>
              <button
                onClick={() => setViewMode('performance')}
                className={`px-3 py-1 rounded-md font-space-grotesk font-bold text-sm transition-all ${viewMode === 'performance'
                    ? 'bg-[#FF7A00] text-black'
                    : 'text-gray-300 hover:bg-black/10'
                  }`}
              >
                Performance
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-8 w-8 text-[#FFC700]" />
              <h3 className="font-space-grotesk text-lg font-bold">Total Value</h3>
            </div>
            <p className="font-ibm-plex-mono text-3xl font-bold text-foreground mb-2">
              {portfolioService.formatCurrency(portfolio.totalValue)}
            </p>
            <div className={`flex items-center gap-2 ${portfolioService.getPriceChangeColor(portfolio.totalChangePercent24h)}`}>
              {portfolio.totalChangePercent24h >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-ibm-plex-mono text-sm">
                {Math.abs(portfolio.totalChangePercent24h).toFixed(2)}% (24h)
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-8 w-8 text-[#FFC700]" />
              <h3 className="font-space-grotesk text-lg font-bold">Holdings</h3>
            </div>
            <p className="font-ibm-plex-mono text-3xl font-bold text-foreground mb-2">
              {metrics?.totalHoldings || 0}
            </p>
            <p className="font-ibm-plex-mono text-sm text-muted-foreground">
              {metrics?.profitableHoldings || 0} profitable ({metrics?.profitablePercentage.toFixed(1)}%)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-[#FFC700]" />
              <h3 className="font-space-grotesk text-lg font-bold">Risk Level</h3>
            </div>
            <p className="font-ibm-plex-mono text-3xl font-bold text-foreground mb-2">
              {metrics?.riskLevel || 'N/A'}
            </p>
            <p className="font-ibm-plex-mono text-sm text-muted-foreground">
              Diversification: {portfolio.diversificationScore.toFixed(0)}/100
            </p>
          </motion.div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'holdings' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-space-grotesk text-2xl font-bold">Your Holdings</h2>

              {/* Quick Actions Bar */}
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => {
                    const bestPerformer = metrics?.bestPerformer;
                    if (bestPerformer) {
                      navigateToTrade(bestPerformer.domain);
                    }
                  }}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 font-ibm-plex-mono px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  disabled={!metrics?.bestPerformer}
                >
                  <TrendingUp className="h-3 w-3" />
                  Trade Best
                </button>

                <button
                  onClick={() => {
                    const worstPerformer = metrics?.worstPerformer;
                    if (worstPerformer) {
                      navigateToTrade(worstPerformer.domain);
                    }
                  }}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-ibm-plex-mono px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                  disabled={!metrics?.worstPerformer}
                >
                  <TrendingDown className="h-3 w-3" />
                  Review Worst
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {portfolio.holdings.map((holding, index) => (
                <HoldingCard key={`${holding.domain}-${index}`} holding={holding} />
              ))}
            </div>

            {/* Portfolio Summary Card */}
            <div className="glass-panel p-6 rounded-lg border border-border">
              <h3 className="font-space-grotesk text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#FFC700]" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = '/exchange'}
                  className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 p-4 rounded-lg font-space-grotesk transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-bold">Explore Exchange</div>
                    <div className="text-xs opacity-80">Find new opportunities</div>
                  </div>
                </button>

                <button
                  onClick={() => window.location.href = '/launch'}
                  className="flex items-center justify-center gap-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 p-4 rounded-lg font-space-grotesk transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-bold">Add Domain</div>
                    <div className="text-xs opacity-80">Tokenize new asset</div>
                  </div>
                </button>

                <button
                  onClick={exportPortfolioReport}
                  className="flex items-center justify-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 p-4 rounded-lg font-space-grotesk transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-bold">Export Report</div>
                    <div className="text-xs opacity-80">Get summary</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="font-space-grotesk text-2xl font-bold">Performance Analysis</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Best Performer */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6 rounded-lg border border-green-500/20 bg-green-900/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-8 w-8 text-green-400" />
                  <h3 className="font-space-grotesk text-lg font-bold text-green-400">Best Performer</h3>
                </div>
                <p className="font-ibm-plex-mono text-xl font-bold text-foreground mb-2">
                  {metrics?.bestPerformer?.domain || 'N/A'}
                </p>
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-ibm-plex-mono">
                    +{metrics?.bestPerformer?.priceChangePercent24h.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </motion.div>

              {/* Worst Performer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6 rounded-lg border border-red-500/20 bg-red-900/10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <h3 className="font-space-grotesk text-lg font-bold text-red-400">Needs Attention</h3>
                </div>
                <p className="font-ibm-plex-mono text-xl font-bold text-foreground mb-2">
                  {metrics?.worstPerformer?.domain || 'N/A'}
                </p>
                <div className="flex items-center gap-2 text-red-400">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-ibm-plex-mono">
                    {metrics?.worstPerformer?.priceChangePercent24h.toFixed(2) || '0.00'}%
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Portfolio Allocation */}
            <div className="glass-panel p-6 rounded-lg border border-border">
              <h3 className="font-space-grotesk text-xl font-bold mb-4">Portfolio Allocation</h3>
              <div className="space-y-4">
                {allocation.slice(0, 5).map((holding, index) => (
                  <div key={holding.domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF7A00] to-[#FFC700] rounded opacity-80 flex items-center justify-center">
                        <span className="font-space-grotesk font-bold text-black text-xs">
                          {holding.tokenTicker.slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-ibm-plex-mono text-foreground">{holding.domain}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-secondary/20 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${holding.allocationPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="bg-gradient-to-r from-[#FF7A00] to-[#FFC700] h-2 rounded-full"
                        />
                      </div>
                      <span className="font-ibm-plex-mono text-sm text-gray-300 w-12 text-right">
                        {holding.allocationPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};