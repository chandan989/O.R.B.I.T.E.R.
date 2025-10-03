import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CONTRACT_CONFIG } from '../config/contracts';
import { contractService } from '../services/contractService';

export const ContractStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkContractStatus = async () => {
    setChecking(true);
    try {
      // Try to call a simple view function to check if contracts are accessible
      const balance = await contractService.getAccountBalance(CONTRACT_CONFIG.CONTRACT_ADDRESS);
      setIsOnline(true);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Contract check failed:', error);
      setIsOnline(false);
      setLastChecked(new Date());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkContractStatus();
    // Check every 30 seconds
    const interval = setInterval(checkContractStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isOnline === null || checking) return 'bg-yellow-500';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (checking) return 'Checking...';
    if (isOnline === null) return 'Unknown';
    return isOnline ? 'Online' : 'Offline';
  };

  const getStatusIcon = () => {
    if (checking) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isOnline === null) return <AlertCircle className="h-4 w-4" />;
    return isOnline ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-space-grotesk">Smart Contract Status</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Badge variant="outline" className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400 font-ibm-plex-mono">Network</p>
            <p className="text-white font-medium">Aptos Testnet</p>
          </div>
          <div>
            <p className="text-gray-400 font-ibm-plex-mono">Modules</p>
            <p className="text-white font-medium">6 Deployed</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-400 font-ibm-plex-mono text-xs">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white/5 px-2 py-1 rounded font-mono">
              {CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(-8)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(
                `https://explorer.aptoslabs.com/account/${CONTRACT_CONFIG.CONTRACT_ADDRESS}/modules?network=testnet`,
                '_blank'
              )}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {lastChecked && (
          <div className="text-xs text-gray-500 font-ibm-plex-mono">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          {getStatusIcon()}
          <span className="text-xs text-gray-400">
            {isOnline ? 'All systems operational' : 'Contract unavailable'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};