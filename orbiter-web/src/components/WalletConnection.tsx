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

export const WalletConnection = () => {
  const { connected, account, wallet, disconnect, isLoading, connect } = useWallet();

  const handleConnect = (walletName: string) => {
    connect(walletName).catch((error) => {
      console.error("Failed to connect wallet:", error);
    });
  };

  if (connected && account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-orbital-success" />
            <span className="font-mono text-sm">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading} className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select a Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleConnect("Petra")}>
          Petra
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleConnect("Martian")}>
          Martian
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
