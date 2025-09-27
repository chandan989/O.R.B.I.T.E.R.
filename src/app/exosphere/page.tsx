"use client";

import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import Link from 'next/link';

const mockTrajectories = [
    { id: 'protocol.apt', score: 92.4, epoch: 1727421600, status: 'stable' },
    { id: 'web3domains.io', score: 78.1, epoch: 1727421545, status: 'stabilizing' },
    { id: 'gemini.ai', score: 95.8, epoch: 1727421491, status: 'stable' },
    { id: 'orbiter.space', score: 61.5, epoch: 1727421380, status: 'decaying' },
    { id: 'aptos.dev', score: 88.9, epoch: 1727421250, status: 'stable' },
    { id: 'mission-control.xyz', score: 72.3, epoch: 1727421100, status: 'stabilizing' },
];

const ExospherePage = () => {
  return (
    <div className="bg-[#111111] min-h-screen text-[#E8E8E8] font-ibm-plex-sans">
      <header className="border-b border-[#3D2D1D] p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="O.R.B.I.T.E.R. logo" className="h-8" />
            <h1 className="font-space-grotesk text-2xl font-bold tracking-wider">
              THE EXOSPHERE
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="hidden md:inline-block bg-[#3D2D1D]/50 px-4 py-2 rounded-md hover:bg-[#3D2D1D] transition-colors text-sm font-space-grotesk">
                [ MISSION CONTROL ]
            </Link>
            <WalletSelector />
        </div>
      </header>

      <main className="container mx-auto p-6 md:p-10">
        <div className="glass-panel p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4 border-b border-[#3D2D1D] pb-2">
                <h2 className="font-space-grotesk text-2xl font-bold">
                    Incoming Trajectories
                </h2>
                <div className="text-xs font-ibm-plex-mono text-[#FFC700] flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE FEED
                </div>
            </div>

            <div className="font-ibm-plex-mono text-sm space-y-2">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-4 text-gray-400 px-2 py-1">
                    <span>ASSET_ID</span>
                    <span className="text-right">TELEMETRY_SCORE</span>
                    <span className="text-right">ORBIT_STATUS</span>
                    <span className="text-right">ORBIT_EPOCH</span>
                </div>

                {/* Table Body */}
                {mockTrajectories.map((asset) => (
                    <div key={asset.id} className="grid grid-cols-4 gap-4 items-center bg-white/5 hover:bg-white/10 p-2 rounded transition-colors cursor-pointer">
                        <span>{asset.id}</span>
                        <span className={`text-right font-bold ${asset.score > 90 ? 'text-[#FFC700]' : 'text-[#FF7A00]'}`}>
                            {asset.score.toFixed(1)}
                        </span>
                        <span className={`text-right text-xs uppercase ${
                            asset.status === 'stable' ? 'text-green-400' :
                            asset.status === 'stabilizing' ? 'text-yellow-400' :
                            'text-red-500'
                        }`}>
                            {asset.status}
                        </span>
                        <span className="text-right text-gray-500">{asset.epoch}</span>
                    </div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ExospherePage;