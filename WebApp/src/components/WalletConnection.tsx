import { useState } from "react";
import { Wallet, CheckCircle, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface WalletConnectionProps {
  onConnectionChange: (connected: boolean) => void;
  isConnected: boolean;
}

export const WalletConnection = ({ onConnectionChange, isConnected }: WalletConnectionProps) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // Simulate wallet connection
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = "0x1a2b...cdef";
      setWalletAddress(mockAddress);
      onConnectionChange(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    onConnectionChange(false);
  };

  if (isConnected && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-orbital-success" />
            <span className="font-mono text-sm">{walletAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connected</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={connectWallet} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
