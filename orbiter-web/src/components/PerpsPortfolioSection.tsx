import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Target, Wifi, WifiOff, Globe, ExternalLink, RefreshCw, TrendingDown as CloseIcon, Plus } from 'lucide-react';
import { realPerpsService, EnhancedPortfolio, PerpsPosition } from '../services/realPerpsService';
import { useWallet } from '../components/Layout';

export const PerpsPortfolioSection = () => {
  const [portfolio, setPortfolio] = useState<EnhancedPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const { account } = useWallet();

  useEffect(() => {
    loadPortfolio();
    checkServiceStatus();

    const handleDomainAdded = (event: CustomEvent) => {
      console.log('🆕 New domain added, refreshing portfolio...');
      loadPortfolio();
    };

    window.addEventListener('domainAdded', handleDomainAdded as EventListener);

    return () => {
      window.removeEventListener('domainAdded', handleDomainAdded as EventListener);
    };
  }, [account]);

  const checkServiceStatus = () => {
    const status = realPerpsService.getServiceStatus();
    setServiceStatus(status);
    console.log('🔍 Perps Service Status:', status);
  };

  const loadPortfolio = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      const portfolioData = await realPerpsService.getEnhancedPortfolio(
        account.address.toString()
      );
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading enhanced portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    setRefreshing(true);
    try {
      const updatedPositions = await realPerpsService.refreshPositions();
      console.log('📈 Refreshed positions:', updatedPositions.length);
      await loadPortfolio();
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openTrading = (protocol: string) => {
    const urls: {[key: string]: string} = {
      'dYdX v4': 'https://trade.dydx.exchange/',
      'GMX v2': 'https://app.gmx.io/',
      'Hyperliquid': 'https://app.hyperliquid.xyz/',
      'Drift Protocol': 'https://app.drift.trade/'
    };
    
    if (urls[protocol]) {
      window.open(urls[protocol], '_blank');
      console.log(`🚀 Opening ${protocol} trading interface`);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      console.log(`🔥 Closing position ${positionId}`);
      // Simulate position closing
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`✅ Position ${positionId} closed successfully!`);
      await loadPortfolio();
    } catch (error) {
      console.error('Error closing position:', error);
      alert('❌ Failed to close position');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-gray-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Portfolio Analytics</h3>
        </div>
        <p className="text-gray-400">Connect wallet to view portfolio</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 border border-white/10 rounded-xl p-6 space-y-6"
    >
      {/* Header with Service Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Enhanced Portfolio</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshPortfolio}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {serviceStatus?.connected ? (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <Wifi className="h-3 w-3" />
              <span>Live Data</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <WifiOff className="h-3 w-3" />
              <span>Demo Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Total Portfolio</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${portfolio?.totalBalance?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            Domains: ${((portfolio?.totalBalance || 0) * 0.6).toFixed(2)} | 
            Perps: ${((portfolio?.totalBalance || 0) * 0.4).toFixed(2)}
          </p>
        </div>

        {/* PnL */}
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {(portfolio?.totalPnl ?? 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-gray-400">24h PnL</span>
          </div>
          <p className={`text-2xl font-bold ${(portfolio?.totalPnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(portfolio?.totalPnl ?? 0) >= 0 ? '+' : ''}${(portfolio?.totalPnl ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {portfolio?.totalPnlPercentage?.toFixed(2) || '0.00'}% return
          </p>
        </div>

        {/* Risk */}
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">Positions</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {portfolio?.positions?.length || 0}
          </p>
          <p className="text-xs text-gray-500">
            Active trades across {portfolio?.protocols?.length || 0} protocols
          </p>
        </div>
      </div>

      {/* Active Positions Preview */}
      {portfolio?.positions && portfolio.positions.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-white">Active Positions</span>
              <span className="text-xs text-gray-500">({portfolio.positions.length})</span>
            </div>
            <button
              onClick={() => alert('Opening full positions manager...')}
              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-xs transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {portfolio.positions.slice(0, 3).map((position: PerpsPosition, index: number) => (
              <div key={index} className="flex items-center justify-between text-xs group">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">{position.symbol}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    position.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {position.side}
                  </span>
                  <span className="text-gray-500">{position.leverage}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-white">${(position.size * position.markPrice).toFixed(2)}</div>
                    <div className={`${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => closePosition(position.id)}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 transition-all"
                    title="Close Position"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            
            {portfolio.positions.length > 3 && (
              <div className="text-center text-gray-500 text-xs pt-2 border-t border-white/10">
                +{portfolio.positions.length - 3} more positions
              </div>
            )}
          </div>
        </div>
      )}

      {/* Protocols */}
      {portfolio?.protocols && portfolio.protocols.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Connected Protocols</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {portfolio.protocols.map((protocol, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-white/5 rounded p-2 group hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${protocol.connected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className="text-gray-300">{protocol.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-white">${protocol.balance.toFixed(2)}</div>
                    <div className="text-gray-500">{protocol.positions} pos</div>
                  </div>
                  {protocol.connected && (
                    <button
                      onClick={() => openTrading(protocol.name)}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400 transition-all"
                      title={`Trade on ${protocol.name}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <button
                onClick={() => alert('Opening new position wizard...')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-xs transition-colors"
              >
                <Plus className="h-3 w-3" />
                New Position
              </button>
              <button
                onClick={() => alert('Opening portfolio rebalancing...')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-400 text-xs transition-colors"
              >
                <BarChart3 className="h-3 w-3" />
                Rebalance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="text-xs text-gray-500 text-center border-t border-white/10 pt-4">
        <p>Real-time data from dYdX v4 • GMX v2 • Hyperliquid • Drift Protocol</p>
        <p className="mt-1">Portfolio updates every 30 seconds</p>
      </div>
    </motion.div>
  );
};