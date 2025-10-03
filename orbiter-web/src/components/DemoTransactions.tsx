import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, CheckCircle, ExternalLink, Zap } from 'lucide-react';

export const DemoTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [result, setResult] = useState<any>(null);

  const CONTRACT_ADDRESS = '0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c';

  const showDemo = async (action: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const endpoint = action === 'init' ? '/api/initialize-registry' : '/api/create-domain';
      const body = action === 'create' ? JSON.stringify({ domainName: domainName.trim() }) : null;
      
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      
      const data = await response.json();
      setResult(data);
      
      if (action === 'create' && data.success) {
        setDomainName('');
      }
    } catch (error: any) {
      setResult({ 
        error: `Failed to connect to backend: ${error.message}. Make sure backend server is running on port 3001.`,
        success: false 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Zap className="h-6 w-6" />
            🚀 ORBITER Domain Registry Demo
          </CardTitle>
          <CardDescription>
            REAL blockchain transactions via backend API - actual Move contract calls on Aptos Testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Contract Address</h3>
            <p className="text-sm text-gray-300 font-mono break-all">{CONTRACT_ADDRESS}</p>
            <a 
              href={`https://explorer.aptoslabs.com/account/${CONTRACT_ADDRESS}?network=testnet`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              View on Aptos Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => showDemo('init')}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Initialize Domain Registry
            </Button>

            <div className="flex gap-2">
              <Input
                placeholder="Enter domain name (e.g., example.com)"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && domainName.trim() && showDemo('create')}
              />
              <Button 
                onClick={() => showDemo('create')}
                disabled={loading || !domainName.trim()}
                className="bg-green-600 hover:bg-green-500"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tokenize Domain'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-400">
              🔥 REAL Aptos transactions • Live contract • Backend API powered
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-300 font-semibold">Real Transaction Successful!</span>
                  </div>
                  <p className="text-green-100">{result.message}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-green-200">Transaction Hash: <span className="font-mono">{result.hash}</span></p>
                    <p className="text-sm text-green-200">Contract: <span className="font-mono text-xs">{CONTRACT_ADDRESS}</span></p>
                  </div>
                  {result.explorerUrl && (
                    <a 
                      href={result.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View Real Transaction on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-300 font-semibold">Transaction Failed</p>
                  <p className="text-red-200 text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-400 text-sm mb-2">How It Works</h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Registry creates global domain storage on Aptos</li>
              <li>Domain gets tokenized as an Aptos Object with valuation data</li>
              <li>Owner receives fractional shares for trading</li>
              <li>All data stored immutably on blockchain</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoTransactions;