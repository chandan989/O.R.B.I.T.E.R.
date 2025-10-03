import React, { useState } from 'react';
import { Button } from './ui/button';
import { realDomainValuation } from '../services/domainValuationAPI';
import { useToast } from '../hooks/use-toast';

export const SimpleLaunchTest = () => {
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('google.com');
  const { toast } = useToast();

  const testLaunch = async () => {
    setLoading(true);
    try {
      console.log("Starting simple launch test for:", domain);
      
      // Step 1: Get valuation
      const valuation = await realDomainValuation.calculateRealValuation(domain);
      console.log("Got valuation:", valuation);
      
      // Step 2: Simulate tokenization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Success
      toast({
        title: "🚀 Launch Test Successful!",
        description: `${domain} tokenized with ${(valuation.market_value / 1000000).toFixed(1)}M APT valuation`,
      });
      
      console.log("Launch test completed successfully");
      
    } catch (error) {
      console.error("Launch test failed:", error);
      toast({
        title: "Launch Test Failed",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-lg mb-6 border-2 border-blue-500/50">
      <h3 className="text-xl font-bold mb-4">🚀 Simple Launch Test</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., google.com)"
          className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded text-white"
        />
        <Button onClick={testLaunch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Launching...' : 'Test Launch'}
        </Button>
      </div>

      <div className="text-xs text-gray-500">
        <div className="font-bold mb-1">Quick test domains:</div>
        <div className="flex flex-wrap gap-2">
          {['google.com', 'chat.com', 'ai.com', 'x.com', 'shop.com'].map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};