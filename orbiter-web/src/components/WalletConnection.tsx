import { Wallet, CheckCircle, LogOut, Download, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useWallet } from "./Layout";
import { useState } from "react";

const walletOptions = [
  {
    name: "Petra",
    description: "The most popular Aptos wallet",
    installUrl: "https://petra.app/",
    chromeUrl: "https://chrome.google.com/webstore/detail/petra-aptos-wallet/ejjladinnckdgjemekebdpeokbikhfci",
    icon: "🪨"
  },
  {
    name: "Martian",
    description: "Multi-chain wallet with Aptos support",
    installUrl: "https://martianwallet.xyz/",
    chromeUrl: "https://chrome.google.com/webstore/detail/martian-aptos-wallet/efbglgofoippbgcjepnhiblaibcnclgk",
    icon: "👽"
  }
];

export const WalletConnection = () => {
  const { connected, account, wallet, disconnect, isLoading, connect } = useWallet();
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const handleConnect = (walletName: string) => {
    connect(walletName).catch((error) => {
      console.error("Failed to connect wallet:", error);
      // If wallet is not installed, show install dialog
      if (error.message?.includes("not installed") || error.message?.includes("not found")) {
        setShowInstallDialog(true);
      }
    });
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
    <>
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
            🪨 Petra
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleConnect("Martian")}>
            👽 Martian
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowInstallDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Install Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Installation Dialog */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-space-grotesk">Install Aptos Wallet</DialogTitle>
            <DialogDescription className="font-ibm-plex-sans">
              You need an Aptos wallet to use O.R.B.I.T.E.R. Choose one of the options below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {walletOptions.map((walletOption) => (
              <div key={walletOption.name} className="glass-panel p-4 rounded-lg border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{walletOption.icon}</span>
                    <div>
                      <h3 className="font-space-grotesk font-bold text-white">{walletOption.name}</h3>
                      <p className="font-ibm-plex-sans text-sm text-gray-400">{walletOption.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(walletOption.chromeUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Chrome Extension
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(walletOption.installUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                </div>
              </div>
            ))}
            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400">⚠️</span>
                <div>
                  <h4 className="font-space-grotesk font-bold text-yellow-400 text-sm">Installation Steps</h4>
                  <ol className="font-ibm-plex-sans text-sm text-gray-300 mt-2 space-y-1 list-decimal list-inside">
                    <li>Install the wallet extension</li>
                    <li>Create a new wallet or import existing</li>
                    <li>Switch to Aptos Testnet</li>
                    <li>Return to O.R.B.I.T.E.R. and connect</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
