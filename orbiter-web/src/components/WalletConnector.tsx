import React from 'react';
import { Button } from './ui/button';
import { useContract } from '../hooks/useContract';

export const WalletConnector = () => {
  const { connected, account, connectWallet, disconnectWallet } = useContract();

  if (connected && account) {
    return (
      <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-green-400 font-bold">✅ Wallet Connected</div>
            <div className="text-sm text-gray-300 font-mono">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
            </div>
          </div>
          <Button 
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
          >
            Disconnect
          </Button>
        </div>
        <div className="text-xs text-green-400 mt-2">
          🔗 Ready for REAL blockchain transactions
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-6">
      <div className="text-yellow-400 font-bold mb-3">⚠️ Connect Wallet for Real Transactions</div>
      <div className="text-sm text-gray-300 mb-4">
        Connect your Aptos wallet to execute real blockchain transactions instead of simulation
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => connectWallet('Petra')}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          🪨 Connect Petra
        </Button>
        <Button 
          onClick={() => connectWallet('Martian')}
          className="bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          👽 Connect Martian
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Without wallet: Demo mode with simulated transactions
      </div>
    </div>
  );
};