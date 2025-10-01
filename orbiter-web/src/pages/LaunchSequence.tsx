
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../components/Layout";

type LaunchStage = "preflight" | "authorization" | "orbital" | "complete";

const StageIndicator = ({ stage, currentStage, title, number }: { stage: LaunchStage, currentStage: LaunchStage, title: string, number: number }) => {
    const stages: LaunchStage[] = ["preflight", "authorization", "orbital", "complete"];
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    const isComplete = stageIndex < currentIndex;
    const isActive = stageIndex === currentIndex;

    let statusIcon;
    if (isComplete) {
        statusIcon = <CheckCircle className="h-6 w-6 text-green-400" />;
    } else if (isActive) {
        statusIcon = (
            <div className="h-6 w-6 rounded-full bg-solar-yellow-text flex items-center justify-center ring-2 ring-solar-yellow-text/50">
                <div className="h-2 w-2 bg-black rounded-full" />
            </div>
        );
    } else {
        statusIcon = <div className="h-6 w-6 rounded-full border-2 border-gray-700" />;
    }

    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/5' : ''}`}>
            <div className="flex-shrink-0">{statusIcon}</div>
            <div>
                <p className={`font-ibm-plex-mono text-xs ${isActive ? 'text-solar-yellow-text' : 'text-gray-500'}`}>STAGE {number}</p>
                <h3 className={`font-space-grotesk font-bold transition-colors ${isComplete ? 'text-gray-500' : isActive ? 'text-white' : 'text-gray-600'}`}>{title}</h3>
            </div>
            {isActive && <ChevronRight className="h-5 w-5 ml-auto text-solar-yellow-text" />}
        </div>
    );
};


export const LaunchSequence = () => {
  const { connected: isWalletConnected } = useWallet();
  const [currentStage, setCurrentStage] = useState<LaunchStage>("preflight");
  const [domainName, setDomainName] = useState("");
  const [txtRecord, setTxtRecord] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { toast } = useToast();

  const generateTxtRecord = () => {
    if (!domainName.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain name to begin verification.",
        variant: "destructive",
      });
      return;
    }

    const record = `orbiter-verify=${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setTxtRecord(record);
    setCurrentStage("authorization");
    
    toast({
      title: "Verification Record Generated",
      description: "Add the TXT record to your domain's DNS settings.",
    });
  };

  const verifyDomain = async () => {
    setIsVerifying(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Shorter delay
      setVerificationComplete(true);

      toast({
        title: "Domain Verified!",
        description: "Your domain ownership has been confirmed.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify domain ownership. Please check your DNS settings.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const initiateLaunch = async () => {
    setIsLaunching(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Shorter delay
      setCurrentStage("complete");

      toast({
        title: "Launch Successful!",
        description: `${domainName} has achieved stable orbit!`,
      });
    } catch (error) {
      toast({
        title: "Launch Failed",
        description: "There was an error during the minting process.",
        variant: "destructive",
      });
    } finally {
      setIsLaunching(false);
    }
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case "preflight":
        return (
            <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 1: Pre-Flight Check</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">Enter your domain name to begin the tokenization process.</p>

            <div className="space-y-4 mb-6">
                <label className="font-ibm-plex-mono text-sm solar-yellow-text" htmlFor="domainName">[ DOMAIN NAME ]</label>
                <input id="domainName" placeholder="your-domain.com" value={domainName} onChange={(e) => setDomainName(e.target.value)} className="font-mono bg-[#1a1a1a] border-[#3D2D1D] text-white w-full rounded-md px-3 py-2"/>
            </div>

            <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6">
                <h4 className="font-ibm-plex-mono text-sm text-gray-400 mb-3">[ PRE-FLIGHT CHECKLIST ]</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">{isWalletConnected ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-yellow-400" />}<span className="font-mono">Aptos wallet connected</span></div>
                    <div className="flex items-center gap-2">{domainName ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-gray-500" />}<span className="font-mono">Domain name provided</span></div>
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-gray-500" /><span className="font-mono">DNS access required for verification</span></div>
                </div>
            </div>

            <button onClick={generateTxtRecord} disabled={!isWalletConnected || !domainName.trim()} className="cta-button w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md disabled:opacity-50 disabled:cursor-not-allowed">[ BEGIN VERIFICATION ]</button>
            </div>
        );
      case "authorization":
        return (
            <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 2: Launch Authorization</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">Add the following TXT record to your domain's DNS settings to prove ownership.</p>

            <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 font-ibm-plex-mono text-sm">
                <h4 className="text-gray-400 mb-3">[ DNS CONFIGURATION ]</h4>
                <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"><span className="text-gray-500 w-20">TYPE:</span><code className="bg-[#1a1a1a] px-2 py-1 rounded">TXT</code></div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"><span className="text-gray-500 w-20">NAME:</span><code className="bg-[#1a1a1a] px-2 py-1 rounded">@</code></div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-gray-500 w-20 mt-1">VALUE:</span>
                    <div className="flex items-center gap-2 flex-1">
                    <code className="bg-[#1a1a1a] px-2 py-1 rounded break-all w-full">{txtRecord}</code>
                    <button onClick={() => navigator.clipboard.writeText(txtRecord)} className="p-2 rounded-md hover:bg-[#3D2D1D] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    </div>
                </div>
                </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex items-start gap-3 mb-6">
                <AlertCircle className="h-5 w-5 text-solar-yellow-text mt-0.5 flex-shrink-0" />
                <div>
                    <h5 className="font-bold text-solar-yellow-text">Awaiting DNS Propagation</h5>
                    <p className="text-sm text-gray-400 mt-1">DNS changes can take time to propagate. You can proceed to verify once the record is live.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={verifyDomain} disabled={isVerifying || verificationComplete} className="cta-button w-full flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md disabled:opacity-50 disabled:cursor-not-allowed">
                {isVerifying ? "VERIFYING..." : "[ VERIFY OWNERSHIP ]"}
                </button>

                {verificationComplete && <div className="flex-1 text-center py-3 px-8 rounded-lg bg-green-900/30 border border-green-500/50 font-space-grotesk text-green-300">DOMAIN VERIFIED</div>}
            </div>
            {verificationComplete && <button onClick={() => setCurrentStage("orbital")} className="cta-button w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md">[ PROCEED TO LAUNCH ]</button>}
            </div>
        );
      case "orbital":
        return (
            <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 3: Orbital Insertion</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">You are cleared for launch. Sign the transaction to mint your asset.</p>

            <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 font-ibm-plex-mono text-sm">
                <h4 className="text-gray-400 mb-3">[ MISSION PARAMETERS ]</h4>
                <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">DOMAIN:</span><span className="text-white">{domainName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">NETWORK:</span><span className="text-white">Aptos Testnet</span></div>
                <div className="flex justify-between"><span className="text-gray-500">ASSET TYPE:</span><span className="text-white">Domain Asset (NFT)</span></div>
                <div className="flex justify-between"><span className="text-gray-500">EST. GAS FEE:</span><span className="text-white">~0.001 APT</span></div>
                </div>
            </div>

            <button onClick={initiateLaunch} disabled={isLaunching} className="w-full cta-button bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-xl">
              {isLaunching ? <div className="flex items-center justify-center gap-2"><Rocket className="animate-pulse" />LAUNCHING...</div> : <div className="flex items-center justify-center gap-2"><Rocket className="h-6 w-6" />[ IGNITION ]</div>}
            </button>
            </div>
        );
      case "complete":
        return (
            <div className="glass-panel p-8 rounded-lg text-center">
                <div className="flex justify-center items-center mb-6">
                    <CheckCircle className="text-6xl text-green-400" />
                </div>

                <h2 className="font-space-grotesk text-3xl font-bold text-green-400 mb-2">Launch Successful!</h2>
                <p className="font-ibm-plex-sans text-lg text-white mb-6"><code className="bg-[#1a1a1a] px-2 py-1 rounded-md border border-[#3D2D1D]">{domainName}</code> has achieved stable orbit.</p>

                <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 text-left font-ibm-plex-mono text-sm">
                    <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-400">NFT ID:</span><span className="text-white">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">TRANSACTION:</span><a href="#" className="flex items-center gap-1 hover:text-solar-yellow-text"><code className="text-xs">0x{Math.random().toString(16).substr(2, 8)}...</code><ExternalLink className="h-3 w-3" /></a></div>
                    <div className="flex justify-between"><span className="text-gray-400">BLOCK:</span><span className="text-white">#{Math.floor(Math.random() * 1000000)}</span></div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => { setCurrentStage("preflight"); setDomainName(""); setTxtRecord(""); setVerificationComplete(false); }} className="w-full flex-1 bg-transparent border border-[#3D2D1D] hover:bg-[#3D2D1D] transition-colors text-white font-bold font-space-grotesk px-8 py-3 rounded-lg text-md">[ LAUNCH ANOTHER ]</button>
                    <Link to="/satellite-constellation" className="cta-button w-full flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md text-center">[ VIEW IN CONSTELLATION ]</Link>
                </div>
            </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="antialiased min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
        <div className="text-center mb-12">
            <h1 className="font-space-grotesk text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white flex items-center justify-center gap-3">
                <Rocket className="h-9 w-9 text-solar-flare-text" />
                Launch Sequence
            </h1>
            <p className="font-ibm-plex-sans text-lg md:text-xl mt-2 text-gray-400 max-w-3xl mx-auto">
                Tokenize your Web2 domain into a verifiable, tradable Digital Asset on the Aptos blockchain.
            </p>
        </div>
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Mission Control */}
            <div className="md:col-span-1">
                <div className="glass-panel p-6 rounded-lg h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-space-grotesk text-2xl font-bold flex items-center gap-3">
                        <Target className="h-6 w-6 text-solar-flare-text" />
                        Mission Control
                        </h2>
                    </div>
                    <p className="font-ibm-plex-sans text-gray-400 mb-6">
                        Follow the protocol to achieve a stable orbit for your digital asset.
                    </p>

                    <div className="space-y-2">
                        <StageIndicator stage="preflight" currentStage={currentStage} number={1} title="Pre-Flight Check" />
                        <StageIndicator stage="authorization" currentStage={currentStage} number={2} title="Launch Authorization" />
                        <StageIndicator stage="orbital" currentStage={currentStage} number={3} title="Orbital Insertion" />
                        <StageIndicator stage="complete" currentStage={currentStage} number={4} title="Mission Complete" />
                    </div>
                </div>
            </div>

            {/* Right Column: Stage Content */}
            <div className="md:col-span-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {renderCurrentStage()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};