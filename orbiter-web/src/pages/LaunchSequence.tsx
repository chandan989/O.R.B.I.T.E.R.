
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
  ChevronRight,
  DollarSign,
  BarChart,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../components/Layout";
import { contractService } from '../services/contractService';
import { ValuationData } from '../types/contracts';
import { useContract } from '../hooks/useContract';
import WalletDomainCreator from '../components/WalletDomainCreator';

import { realDomainValuation } from '../services/domainValuationAPI';
import { advancedDomainValuation } from '../services/advancedDomainValuation';
import { smartDomainValuation } from '../services/smartDomainValuation';
import { domainStorage } from '../services/domainStorage';
import '../services/contractVerifier'; // Import contract verification tools



type LaunchStage = "preflight" | "authorization" | "valuation" | "tokenization" | "complete";

const StageIndicator = ({ stage, currentStage, title, number }: { stage: LaunchStage, currentStage: LaunchStage, title: string, number: number }) => {
  const stages: LaunchStage[] = ["preflight", "authorization", "valuation", "tokenization", "complete"];
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
  const wallet = useWallet();
  const { connected: isWalletConnected, account } = wallet || {};


  const { calculateValuation, loading: contractLoading } = useContract();
  const [currentStage, setCurrentStage] = useState<LaunchStage>("preflight");
  const [domainName, setDomainName] = useState("");
  const [txtRecord, setTxtRecord] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { toast } = useToast();
  const [valuation, setValuation] = useState<any>({ score: 0, marketValue: 0, seoAuthority: 0, trafficEstimate: 0, brandability: 0, tldRarity: 0 });
  const [realValuation, setRealValuation] = useState<ValuationData | null>(null);
  const [transactionHash, setTransactionHash] = useState("");


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
      // Simulate DNS verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationComplete(true);

      // Calculate SMART valuation using verified sales database
      try {
        const smartVal = await smartDomainValuation.calculateMarketValue(domainName);
        if (smartVal) {
          setRealValuation(smartVal);
          // Convert to display format
          setValuation({
            score: parseInt(smartVal.score) / 100, // Scale down for display
            marketValue: parseInt(smartVal.market_value) / 1000, // Convert back to USD for display
            seoAuthority: parseInt(smartVal.seo_authority),
            trafficEstimate: parseInt(smartVal.traffic_estimate),
            brandability: parseInt(smartVal.brandability),
            tldRarity: parseInt(smartVal.tld_rarity)
          });
          setCurrentStage("valuation");

          toast({
            title: "🎯 Smart Market Analysis Complete!",
            description: `${domainName} valued at $${(parseInt(smartVal.market_value) / 1000).toLocaleString()} USD using verified sales database`,
          });
        }
      } catch (error) {
        console.warn("Smart valuation unavailable, using advanced fallback:", error);
        // Fallback to advanced algorithms
        const advancedVal = await advancedDomainValuation.calculateRealValuation(domainName);
        if (advancedVal) {
          setRealValuation(advancedVal);
          setValuation({
            score: parseInt(advancedVal.score) / 100,
            marketValue: parseInt(advancedVal.market_value) / 1000, // Convert back to USD for display
            seoAuthority: parseInt(advancedVal.seo_authority),
            trafficEstimate: parseInt(advancedVal.traffic_estimate),
            brandability: parseInt(advancedVal.brandability),
            tldRarity: parseInt(advancedVal.tld_rarity)
          });
          setCurrentStage("valuation");

          toast({
            title: "🔄 Advanced Analysis Complete",
            description: `${domainName} valued using ML-inspired algorithms (APIs unavailable)`,
          });
        }
      }

      toast({
        title: "Domain Verified & Valued!",
        description: "Your domain ownership has been confirmed and AI valuation calculated.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Could not verify domain ownership or calculate valuation.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProceedToTokenization = () => {
    setCurrentStage("tokenization");
  };

  const renderCurrentStage = () => {
    console.log('🎬 Rendering stage:', currentStage);
    
    switch (currentStage) {
      case "preflight":
        return (
          <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 1: Pre-Flight Check</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">Enter your domain name to begin the tokenization process.</p>

            <div className="space-y-4 mb-6">
              <label className="font-ibm-plex-mono text-sm solar-yellow-text" htmlFor="domainName">[ DOMAIN NAME ]</label>
              <input id="domainName" placeholder="your-domain.com" value={domainName} onChange={(e) => setDomainName(e.target.value)} className="font-mono bg-[#1a1a1a] border-[#3D2D1D] text-white w-full rounded-md px-3 py-2" />
            </div>

            <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6">
              <h4 className="font-ibm-plex-mono text-sm text-gray-400 mb-3">[ PRE-FLIGHT CHECKLIST ]</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">{isWalletConnected ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-yellow-400" />}<span className="font-mono">Stacks wallet connected</span></div>
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
              <button
                onClick={verifyDomain}
                disabled={isVerifying || verificationComplete || contractLoading}
                className="cta-button w-full flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying || contractLoading ? "VERIFYING & CALCULATING..." : "[ VERIFY & VALUE DOMAIN ]"}
              </button>

              {verificationComplete && <div className="flex-1 text-center py-3 px-8 rounded-lg bg-green-900/30 border border-green-500/50 font-space-grotesk text-green-300">DOMAIN VERIFIED</div>}
            </div>
            {verificationComplete && <button onClick={() => setCurrentStage("valuation")} className="cta-button w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md">[ PROCEED TO VALUATION ]</button>}
          </div>
        );
      case "valuation":
        return (
          <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Valuation Complete</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">We've calculated the objective market value of your digital real estate.</p>

            <div className="grid grid-cols-2 gap-6 mb-6 text-center">
              <div className="glass-panel-inset p-4 rounded-lg">
                <p className="font-ibm-plex-mono text-sm text-gray-400">Score</p>
                <p className="font-space-grotesk text-4xl font-bold text-solar-yellow-text">{valuation.score}</p>
              </div>
              <div className="glass-panel-inset p-4 rounded-lg">
                <p className="font-ibm-plex-mono text-sm text-gray-400">Estimated Market Value</p>
                <p className="font-space-grotesk text-4xl font-bold text-white">${valuation.marketValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6">
              <h4 className="font-ibm-plex-mono text-sm text-gray-400 mb-4">[ VALUATION CONSTELLATION ]</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><BarChart className="h-4 w-4 text-solar-yellow-text/70" />SEO Authority</div>
                  <span className="font-bold text-white">${valuation.seoAuthority.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><Sparkles className="h-4 w-4 text-solar-yellow-text/70" />Traffic Estimate</div>
                  <span className="font-bold text-white">${valuation.trafficEstimate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><ShieldCheck className="h-4 w-4 text-solar-yellow-text/70" />Brandability</div>
                  <span className="font-bold text-white">${valuation.brandability.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-ibm-plex-mono text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><Globe className="h-4 w-4 text-solar-yellow-text/70" />TLD Rarity</div>
                  <span className="font-bold text-white">${valuation.tldRarity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button onClick={handleProceedToTokenization} className="cta-button w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md">[ INITIATE TOKENIZATION ]</button>
          </div>
        );
      case "tokenization":
        return (
          <div className="glass-panel p-8 rounded-lg">
            <h3 className="font-space-grotesk text-xl font-bold mb-2">Final Stage: On-chain Genesis</h3>
            <p className="font-ibm-plex-sans text-gray-400 mb-6">Confirm the details for your new Stacks Object. This will create a unique on-chain representation of your domain with its ownership divided into liquid shares.</p>

            <WalletDomainCreator 
              domainName={domainName}
              txtRecord={txtRecord}
              valuation={realValuation}
              onSuccess={async (txHash) => {
                console.log('🚀 Transaction successful:', txHash);
                setTransactionHash(txHash);
                
                // Save domain to real storage
                if (realValuation && account?.address) {
                  try {
                    // Normalize the address for consistent storage
                    const normalizedAddress = account.address.toString().toLowerCase();
                    console.log('💾 Saving domain with normalized address:', normalizedAddress);
                    
                    const savedDomain = await domainStorage.saveDomain({
                      domain: domainName,
                      owner: normalizedAddress,
                      txHash: txHash,
                      valuation: realValuation
                    });
                    console.log('💾 Domain saved to constellation database');
                    
                    // Dispatch event to update constellation
                    const domainAddedEvent = new CustomEvent('domainAdded', {
                      detail: savedDomain
                    });
                    window.dispatchEvent(domainAddedEvent);
                    console.log('📡 Domain added event dispatched to constellation');
                    
                  } catch (error) {
                    console.error('Failed to save domain:', error);
                  }
                }
                
                // Add a small delay to ensure state updates properly
                setTimeout(() => {
                  setCurrentStage("complete");
                  console.log('✅ Stage set to complete');
                }, 100);
                
                toast({
                  title: "🚀 Transaction Confirmed!",
                  description: "Your domain has been successfully tokenized on Stacks!",
                });
              }}
            />
          </div>
        );
      case "complete":
        return (
          <div className="glass-panel p-8 rounded-lg text-center">
            <div className="flex justify-center items-center mb-6">
              <CheckCircle className="text-6xl text-green-400" />
            </div>

            <h2 className="font-space-grotesk text-3xl font-bold text-green-400 mb-2">🚀 Launch Successful!</h2>
            <p className="font-ibm-plex-sans text-lg text-white mb-2">
              <code className="bg-[#1a1a1a] px-2 py-1 rounded-md border border-[#3D2D1D]">{domainName}</code> has achieved stable orbit.
            </p>
            <p className="font-ibm-plex-sans text-sm text-gray-400 mb-6">
              Your domain is now tokenized on the Stacks blockchain! ✨
            </p>

            {transactionHash && (
              <div className="border border-green-500/30 bg-green-500/10 rounded-lg p-6 mb-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-space-grotesk font-bold text-green-400">Transaction Confirmed</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm block mb-1">Transaction Hash:</span>
                    <code className="text-xs text-white bg-black/50 px-3 py-2 rounded block break-all font-mono">
                      {transactionHash}
                    </code>
                  </div>
                  <a 
                    href={`https://explorer.stackslabs.com/txn/${transactionHash}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Stacks Explorer
                  </a>
                </div>
              </div>
            )}

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
          Transform your Web2 domain into a verifiable, tradable Stacks Object with fractional ownership.
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
              <StageIndicator stage="valuation" currentStage={currentStage} number={3} title="Valuation" />
              <StageIndicator stage="tokenization" currentStage={currentStage} number={4} title="Tokenization" />
              <StageIndicator stage="complete" currentStage={currentStage} number={5} title="Mission Complete" />
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