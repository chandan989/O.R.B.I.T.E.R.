import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Zap } from 'lucide-react';
import { ValuationData } from '../types/contracts';
import { domainStorage } from '../services/domainStorage';

interface WalletDomainCreatorProps {
  domainName?: string;
  txtRecord?: string;
  valuation?: ValuationData | null;
  onSuccess?: (txHash: string) => void;
}

export const WalletDomainCreator = ({
  domainName: propDomainName,
  txtRecord: propTxtRecord,
  valuation: propValuation,
  onSuccess
}: WalletDomainCreatorProps) => {
  const [domainName, setDomainName] = useState(propDomainName || '');
  const [isCreating, setIsCreating] = useState(false);
  const { createDomain, connected, loading } = useContract();
  const { account } = useWallet();

  // Update local state when props change
  useEffect(() => {
    if (propDomainName) setDomainName(propDomainName);
  }, [propDomainName]);

  const handleCreateDomain = async () => {
    if (!domainName.trim()) return;

    try {
      setIsCreating(true);

      // Use provided valuation or create mock data
      const valuation = propValuation || {
        score: "85",
        market_value: "1000000",
        seo_authority: "75",
        traffic_estimate: "60",
        brandability: "90",
        tld_rarity: "80",
        updated_at: String(Date.now())
      };

      const verificationHash = propTxtRecord || `verification_${Date.now()}`;

      console.log('🚀 Creating domain:', domainName.trim());

      // This will trigger wallet popup - pass onSuccess callback
      await createDomain(
        domainName.trim(),
        verificationHash,
        valuation,
        undefined, // no fractional config
        (txId) => {
          // Transaction successful - call parent onSuccess
          console.log('✅ Transaction confirmed with ID:', txId);
          if (onSuccess) {
            onSuccess(txId);
          }
        }
      );

      if (!propDomainName) {
        setDomainName('');
      }
    } catch (error) {
      console.error('❌ Domain creation failed:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!connected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Create Domain with Your Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to create domains on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Connect Leather or Hiro wallet to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <Zap className="h-6 w-6" />
          Create Domain with Your Wallet
        </CardTitle>
        <CardDescription>
          Real blockchain transaction - your wallet will show confirmation popup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain name (e.g., example.com)"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && domainName.trim() && handleCreateDomain()}
            disabled={!!propDomainName} // Disable if domain name is provided via props
          />
          <Button
            onClick={handleCreateDomain}
            disabled={isCreating || loading || !domainName.trim()}
            className="bg-green-600 hover:bg-green-500"
          >
            {(isCreating || loading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {(isCreating || loading) ? 'Creating...' : 'Create Domain'}
          </Button>
        </div>

        <div className="text-sm text-blue-400">
          ✨ Your wallet will show a popup to confirm the transaction
        </div>

        <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-400 text-sm mb-1">What happens next:</h4>
          <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
            <li>Wallet popup appears for you to confirm transaction</li>
            <li>Pay gas fees (usually ~0.001 USDCx)</li>
            <li>Domain gets tokenized on Stacks blockchain</li>
            <li>You receive transaction confirmation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletDomainCreator;