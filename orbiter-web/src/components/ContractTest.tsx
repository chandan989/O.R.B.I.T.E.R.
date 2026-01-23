import React, { useState } from 'react';
import { contractService } from '../services/contractService';
import { Button } from './ui/button';

export const ContractTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testValuation = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Testing valuation calculation...");
      const result = await contractService.calculateInitialValuation("google.com");
      console.log("Valuation result:", result);
      setResult(result);
    } catch (err: any) {
      console.error("Test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAccountBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Testing account balance...");
      const balance = await contractService.getAccountBalance("0x1");
      console.log("Balance result:", balance);
      setResult({ balance });
    } catch (err: any) {
      console.error("Balance test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Contract Test</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={testValuation} disabled={loading}>
          Test Valuation
        </Button>
        <Button onClick={testAccountBalance} disabled={loading}>
          Test Account Balance
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {result && (
        <div className="bg-gray-100 p-2 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};