import { useState, useCallback } from 'react';
import { contractService } from '../services/contractService';
import { ValuationData, FractionalConfig, DomainInfo } from '../types/contracts';
import { useToast } from './use-toast';
import { CONTRACT_CONFIG } from '../config/contracts';
import { useWallet } from '../components/Layout';
import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

import {
  uintCV,
  stringAsciiCV,
  standardPrincipalCV,
  PostConditionMode
} from '@stacks/transactions';

export const useContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use our custom context hook
  const {
    connected,
    account,
    connect: connectWallet,
    disconnect: disconnectWallet,
    wallet
  } = useWallet();

  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(error);
    const message = error?.message || defaultMessage;
    setError(message);
    toast({
      title: "Transaction Failed",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const createDomain = useCallback(async (
    domainName: string,
    verificationHash: string,
    valuation: ValuationData,
    fractionalConfig?: FractionalConfig
  ) => {
    setLoading(true);
    setError(null);

    try {
      if (!connected || !account) {
        toast({
          title: "⚠️ Wallet Not Connected",
          description: "Connect Leather or Hiro wallet to continue",
          variant: "destructive",
        });
        throw new Error("Wallet not connected");
      }

      // Prepare arguments
      // Note: we're calling a helper in contractService but using the result with openContractCall
      const functionArgs = contractService.createDomainArgs(
        domainName,
        verificationHash,
        valuation,
        fractionalConfig
      );

      const contractAddress = CONTRACT_CONFIG.CONTRACT_ADDRESS;
      const contractName = CONTRACT_CONFIG.MODULES.DOMAIN_REGISTRY;

      await openContractCall({
        contractAddress,
        contractName: contractName || 'domain_registry',
        functionName: 'create-domain-object-entry',
        functionArgs,
        postConditionMode: PostConditionMode.Allow, // Allow for now (testnet)
        network: STACKS_TESTNET,
        appDetails: {
          name: "O.R.B.I.T.E.R.",
          icon: window.location.origin + "/logo.svg",
        },
        onFinish: (data) => {
          console.log("Transaction ID:", data.txId);
          toast({
            title: "✅ Transaction Submitted!",
            description: `Tx ID: ${data.txId.substring(0, 8)}...`,
          });
        },
        onCancel: () => {
          console.log("Transaction Canceled");
          setLoading(false);
        },
      });

    } catch (error) {
      handleError(error, "Failed to create domain");
    } finally {
      // Note: openContractCall is async but returns before tx is mined
      // We set loading false here, though usually we'd want to track the pending tx
      setLoading(false);
    }
  }, [connected, account, handleError, toast]);

  const calculateValuation = useCallback(async (domainName: string): Promise<ValuationData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await contractService.calculateInitialValuation(domainName);
      return result;
    } catch (error) {
      console.error("Valuation calculation error:", error);
      handleError(error, "Failed to calculate domain valuation");
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Other functions
  const getDomainInfo = useCallback(async (domainObject: string): Promise<DomainInfo | null> => {
    try {
      const result = await contractService.getDomainInfo(domainObject);
      return result;
    } catch (error) {
      console.error("Failed to get domain info:", error);
      return null;
    }
  }, []);

  const getAccountBalance = useCallback(async (address: string): Promise<string> => {
    try {
      const balance = await contractService.getAccountBalance(address);
      return balance;
    } catch (error) {
      console.error("Failed to get account balance:", error);
      return "0";
    }
  }, []);

  const getShareBalance = useCallback(async (domainObject: string, holder: string): Promise<string> => {
    try {
      const balance = await contractService.getShareBalance(domainObject, holder);
      return balance;
    } catch (error) {
      console.error("Failed to get share balance:", error);
      return "0";
    }
  }, []);

  const transferShares = useCallback(async () => {
    throw new Error("Transfer shares not implemented yet");
  }, []);

  const createListing = useCallback(async (
    domainObjectAddr: string,
    pricePerShare: number,
    sharesToSell: number
  ) => {
    // Placeholder - implement using openContractCall similar to createDomain
    toast({
      title: "Coming Soon",
      description: "Marketplace features coming soon",
    });
  }, [toast]);

  const purchaseShares = useCallback(async (
    listingObjectAddr: string,
    sharesToBuy: number
  ) => {
    // Placeholder
    toast({
      title: "Coming Soon",
      description: "Marketplace features coming soon",
    });
  }, [toast]);

  return {
    // State
    loading,
    error,

    // Wallet state
    connected,
    account,

    // Wallet functions
    connectWallet: (name: string) => connectWallet(name),
    disconnectWallet,

    // Contract functions
    createDomain,
    calculateValuation,
    getDomainInfo,
    getAccountBalance,
    getShareBalance,
    transferShares,
    createListing,
    purchaseShares
  };
};