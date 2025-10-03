import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useContract } from '../hooks/useContract';
import { useWallet } from './Layout';
import { CONTRACT_CONFIG } from '../config/contracts';
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react';

export const ContractDemo: React.FC = () => {
  const { account, connected } = useWallet();
  const { 
    loading, 
    error, 
    createDomain, 
    getDomainInfo, 
    calculateValuation,
    getAccountBalance 
  } = useContract();

  const [domainName, setDomainName] = useState('');
  const [domainObject, setDomainObject] = useState('');
  const [accountAddress, setAccountAddress] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleCalculateValuation = async () => {
    if (!domainName) return;
    
    const valuation = await calculateValuation(domainName);
    setResults({ type: 'valuation', data: valuation });
  };

  const handleGetDomainInfo = async () => {
    if (!domainObject) return;
    
    const info = await getDomainInfo(domainObject);
    setResults({ type: 'domainInfo', data: info });
  };

  const handleGetBalance = async () => {
    if (!accountAddress) return;
    
    const balance = await getAccountBalance(accountAddress);
    setResults({ type: 'balance', data: balance });
  };

  const handleCreateDomain = async () => {
    if (!connected || !account || !domainName) return;
    
    // First calculate valuation
    const valuation = await calculateValuation(domainName);
    if (!valuation) return;

    // Create fractional config
    const fractionalConfig = {
      ticker: domainName.split('.')[0].toUpperCase(),
      total_supply: "1000000",
      circulating_supply: "0",
      trading_enabled: true
    };

    try {
      const result = await createDomain(
        account,
        domainName,
        `verification_${Date.now()}`,
        valuation,
        fractionalConfig
      );
      setResults({ type: 'createDomain', data: result });
    } catch (error) {
      console.error('Failed to create domain:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            O.R.B.I.T.E.R. Smart Contract Demo
          </CardTitle>
          <CardDescription>
            Test your deployed smart contracts on Aptos Testnet
          </CardDescription>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Contract:</span>
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_CONFIG.CONTRACT_ADDRESS.slice(-8)}
            </code>
            <a 
              href={`https://explorer.aptoslabs.com/account/${CONTRACT_CONFIG.CONTRACT_ADDRESS}/modules?network=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span>Wallet Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            {connected && account && (
              <div className="mt-2 text-sm text-muted-foreground">
                Address: {account.address().toString().slice(0, 8)}...{account.address().toString().slice(-8)}
              </div>
            )}
          </div>

          {/* Domain Valuation Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">1. Calculate Domain Valuation</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain name (e.g., example.com)"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleCalculateValuation}
                disabled={loading || !domainName}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calculate'}
              </Button>
            </div>
          </div>

          {/* Domain Creation Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">2. Create Domain Object</h3>
            <Button 
              onClick={handleCreateDomain}
              disabled={loading || !connected || !domainName}
              className="w-full"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tokenize Domain'}
            </Button>
            <p className="text-sm text-muted-foreground">
              This will create a domain object on-chain with fractional ownership enabled
            </p>
          </div>

          {/* Domain Info Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">3. Get Domain Information</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter domain object address"
                value={domainObject}
                onChange={(e) => setDomainObject(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleGetDomainInfo}
                disabled={loading || !domainObject}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Info'}
              </Button>
            </div>
          </div>

          {/* Balance Check Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">4. Check Account Balance</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter account address"
                value={accountAddress}
                onChange={(e) => setAccountAddress(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleGetBalance}
                disabled={loading || !accountAddress}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Balance'}
              </Button>
            </div>
          </div>

          {/* Results Display */}
          {results && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Results:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};