import React from 'react';
import { useWallet } from '../components/Layout';
import { Button } from './ui/button';

export const WalletTest = () => {
  const wallet = useWallet();
  
  const testWallet = () => {
    console.log("Wallet object:", wallet);
    console.log("Wallet keys:", wallet ? Object.keys(wallet) : "No wallet");
    console.log("Connected:", wallet?.connected);
    console.log("Account:", wallet?.account);
    console.log("SignAndSubmitTransaction:", typeof wallet?.signAndSubmitTransaction);
  };

  return (
    <div className="glass-panel p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold mb-2">🔧 Wallet Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>Connected: {wallet?.connected ? "✅ Yes" : "❌ No"}</div>
        <div>Account: {wallet?.account ? "✅ Yes" : "❌ No"}</div>
        <div>Sign Function: {typeof wallet?.signAndSubmitTransaction === 'function' ? "✅ Yes" : "❌ No"}</div>
      </div>
      
      <Button onClick={testWallet} className="mt-2" size="sm">
        Debug Wallet
      </Button>
      
      {!wallet?.connected && (
        <div className="mt-2 text-xs text-yellow-400">
          ⚠️ Connect Petra or Martian wallet to enable real blockchain transactions
        </div>
      )}
    </div>
  );
};