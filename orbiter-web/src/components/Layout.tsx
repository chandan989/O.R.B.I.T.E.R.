import { Link, Outlet } from "react-router-dom";
import { WalletConnection } from "./WalletConnection";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

// Create a valid context for wallet state
interface WalletContextValue {
  connected: boolean;
  account: { address: string } | null;
  wallet: { name: string } | null;
  connect: (walletName?: string) => void;
  disconnect: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextValue>({
  connected: false,
  account: null,
  wallet: null,
  connect: () => { },
  disconnect: () => { },
  isLoading: false,
});

export const useWallet = () => useContext(WalletContext);

const StacksProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<{ address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setConnected(true);
      // Use testnet address by default
      setAccount({ address: userData.profile.stxAddress.testnet });
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setConnected(true);
        setAccount({ address: userData.profile.stxAddress.testnet });
      });
    }
  }, []);

  const connect = (walletName?: string) => {
    // We ignore walletName largely as Stacks Connect handles the modal
    setIsLoading(true);
    showConnect({
      appDetails: {
        name: "O.R.B.I.T.E.R.",
        icon: window.location.origin + "/logo.svg",
      },
      redirectTo: "/",
      onFinish: () => {
        const userData = userSession.loadUserData();
        setConnected(true);
        setAccount({ address: userData.profile.stxAddress.testnet });
        setIsLoading(false);
      },
      onCancel: () => {
        setIsLoading(false);
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setConnected(false);
    setAccount(null);
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        account,
        wallet: connected ? { name: "Stacks Wallet" } : null,
        connect,
        disconnect,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const StacksLayout = () => {
  return (
    <StacksProvider>
      <Layout />
    </StacksProvider>
  );
};

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen text-stark-white antialiased relative">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#111111] to-transparent z-0"
        style={{ height: "300px" }}
      ></div>
      <header className="sticky top-0 left-0 right-0 z-20 py-4 bg-void-black/80 backdrop-blur-lg">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img src="/logo.svg" alt="O.R.B.I.T.E.R. logo" className="h-8" />
              <span className="font-space-grotesk text-2xl font-bold tracking-wider">
                O.R.B.I.T.E.R.
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-4 font-ibm-plex-sans text-sm">
              <div className="flex items-center space-x-8">
                <Link
                  to="/launch-sequence"
                  className="px-4 py-2 rounded-md hover:text-[#FF7A00] transition-colors"
                >
                  Launch Sequence
                </Link>
                <Link
                  to="/satellite-constellation"
                  className="px-4 py-2 rounded-md hover:text-[#FF7A00] transition-colors"
                >
                  Satellite Constellation
                </Link>
                <Link
                  to="/exosphere-exchange"
                  className="px-4 py-2 rounded-md hover:text-[#FF7A00] transition-colors"
                >
                  Exosphere Exchange
                </Link>
                <Link
                  to="/blog"
                  className="px-4 py-2 rounded-md hover:text-[#FF7A00] transition-colors"
                >
                  Blog
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <WalletConnection />
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <WalletConnection />
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none ml-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
            </div>
          </nav>
          <div className={`md:hidden mt-4 glass-panel rounded-lg p-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
            <div className="flex flex-col space-y-2 font-ibm-plex-sans text-sm text-center">
              <Link
                to="/launch-sequence"
                className="bg-[#3D2D1D]/50 px-4 py-3 rounded-md hover:bg-[#3D2D1D] transition-colors mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launch Sequence
              </Link>
              <Link
                to="/satellite-constellation"
                className="bg-[#3D2D1D]/50 px-4 py-3 rounded-md hover:bg-[#3D2D1D] transition-colors mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Satellite Constellation
              </Link>
              <Link
                to="/exosphere-exchange"
                className="bg-[#3D2D1D]/50 px-4 py-3 rounded-md hover:bg-[#3D2D1D] transition-colors mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Exosphere Exchange
              </Link>
              <Link
                to="/blog"
                className="bg-[#3D2D1D]/50 px-4 py-3 rounded-md hover:bg-[#3D2D1D] transition-colors mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow relative pb-8">
        <div className="container mx-auto px-6 relative z-10">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-gray-500 font-ibm-plex-sans text-sm">
          <p>&copy; 2025 O.R.B.I.T.E.R. All rights reserved. Licensed under MIT License.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StacksLayout;
