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
import { useWallet } from "./Layout";

// Type declaration for Leather wallet
declare global {
  interface Window {
    stacks?: any;
  }
}

export const WalletConnection = () => {
  const { connected, account, wallet, disconnect, isLoading, connect } = useWallet();

  const handleConnect = () => {
    connect();
  };

  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-orbital-success" />
            <span className="font-mono text-sm">
              {String(account.address).slice(0, 6)}...{String(account.address).slice(-4)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{wallet?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      disabled={isLoading}
      className="flex items-center gap-2"
      onClick={handleConnect}
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};
