"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { LaunchSequence } from "@/components/LaunchSequence";

const MissionControlPage = () => {
  const { connected, account } = useWallet();

  return (
    <div className="bg-[#111111] min-h-screen text-[#E8E8E8] font-ibm-plex-sans">
      <header className="border-b border-[#3D2D1D] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="O.R.B.I.T.E.R. logo" className="h-8" />
          <h1 className="font-space-grotesk text-2xl font-bold tracking-wider">
            MISSION CONTROL
          </h1>
        </div>
        <WalletSelector />
      </header>

      <main className="container mx-auto p-6 md:p-10">
        {!connected ? (
          <div className="text-center glass-panel p-10 rounded-lg">
            <h2 className="font-space-grotesk text-3xl font-bold solar-yellow-text">
              Awaiting Connection
            </h2>
            <p className="mt-4 text-gray-400">
              Please connect your Aptos wallet to access Mission Control.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Launch Sequence Section */}
            <div className="glass-panel p-6 rounded-lg">
              <h2 className="font-space-grotesk text-2xl font-bold mb-4 border-b border-[#3D2D1D] pb-2">
                Launch Sequence
              </h2>
              <LaunchSequence />
            </div>

            {/* Satellite Constellation Section */}
            <div className="glass-panel p-6 rounded-lg">
              <h2 className="font-space-grotesk text-2xl font-bold mb-4 border-b border-[#3D2D1D] pb-2">
                Satellite Constellation
              </h2>
              <div className="text-center text-gray-500 py-8">
                <p>No orbital assets detected for this wallet.</p>
                <p className="text-xs mt-2">
                  Complete the Launch Sequence to see your assets here.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MissionControlPage;