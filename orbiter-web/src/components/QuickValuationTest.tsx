import React, { useState } from 'react';
import { Button } from './ui/button';
import { realDomainValuation } from '../services/domainValuationAPI';

export const QuickValuationTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState('google.com');

  const testValuation = async () => {
    setLoading(true);
    try {
      const valuation = await realDomainValuation.calculateRealValuation(domain);
      setResult(valuation);
    } catch (error) {
      console.error('Valuation error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-lg mb-6">
      <h3 className="text-xl font-bold mb-4">🔥 Quick Valuation Test</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter domain (e.g., google.com)"
          className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded text-white"
        />
        <Button onClick={testValuation} disabled={loading}>
          {loading ? 'Calculating...' : 'Get Real Valuation'}
        </Button>
      </div>

      {result && (
        <div className="bg-black/30 p-4 rounded">
          {result.error ? (
            <div className="text-red-400">Error: {result.error}</div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {result.market_value >= 1000000 
                  ? `${(result.market_value / 1000000).toFixed(1)}M APT`
                  : `${result.market_value.toLocaleString()} APT`
                }
              </div>
              <div className="text-sm text-gray-300">
                ≈ ${(result.market_value * 10).toLocaleString()} USD
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>SEO: {result.seo_authority}/100</div>
                <div>Traffic: {result.traffic_estimate}/100</div>
                <div>Brand: {result.brandability}/100</div>
                <div>TLD: {result.tld_rarity}/100</div>
              </div>
              <div className="text-xs text-green-400 mt-2">
                Overall Score: {result.score}/1000
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <div className="font-bold mb-1">Try these premium domains:</div>
        <div className="flex flex-wrap gap-2">
          {['google.com', 'chat.com', 'ai.com', 'x.com', 'shop.com'].map(d => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};