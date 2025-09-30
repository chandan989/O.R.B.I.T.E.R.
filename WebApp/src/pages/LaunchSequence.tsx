
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Target,
  ExternalLink 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "../components/Layout";

type LaunchStage = "preflight" | "authorization" | "orbital" | "complete";

export const LaunchSequence = () => {
  const { isWalletConnected } = useWallet();
  const [currentStage, setCurrentStage] = useState<LaunchStage>("preflight");
  const [domainName, setDomainName] = useState("");
  const [txtRecord, setTxtRecord] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fade in sections on scroll
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    return () => {
        sections.forEach(section => {
            observer.unobserve(section);
        });
    };
  }, [currentStage]);


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
    
    // Simulate DNS verification
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
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
    
    // Simulate NFT minting process
    try {
      await new Promise(resolve => setTimeout(resolve, 4000));
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

  const getStageProgress = () => {
    switch (currentStage) {
      case "preflight": return 25;
      case "authorization": return 50;
      case "orbital": return 75;
      case "complete": return 100;
      default: return 0;
    }
  };

  return (
    <>
    <style>
        {`
          .font-space-grotesk { font-family: 'Space Grotesk', sans-serif; }
          .font-ibm-plex-sans { font-family: 'IBM Plex Sans', sans-serif; }
          .font-ibm-plex-mono { font-family: 'IBM Plex Mono', monospace; }

          .solar-flare-text { color: #FF7A00; } /* Ignition Orange */
          .solar-yellow-text { color: #FFC700; } /* Solar Yellow */

          .glass-panel {
              background: rgba(61, 45, 29, 0.4); /* Charred Steel with opacity */
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border: 1px solid #3D2D1D; /* Charred Steel */
          }

          .cta-button {
              transition: all 0.3s ease;
              box-shadow: 0 0 15px rgba(255, 122, 0, 0.3); /* Ignition Orange glow */
          }
          .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 25px rgba(255, 122, 0, 0.6); /* Ignition Orange glow */
          }
          
          .fade-in-section {
              opacity: 0;
              transform: translateY(20px);
              transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          .fade-in-section.is-visible {
              opacity: 1;
              transform: translateY(0);
          }

          /* Hero Animation */
          @keyframes orbit-1 {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          @keyframes orbit-2 {
              from { transform: rotate(90deg); }
              to { transform: rotate(450deg); }
          }
          @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}
      </style>
    <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">

      {/* Launch Progress Header */}
      <div className="glass-panel p-6 rounded-lg mb-8 fade-in-section is-visible">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-space-grotesk text-2xl font-bold flex items-center gap-3">
              <Rocket className="h-6 w-6 text-solar-flare-text" />
              Launch Sequence Protocol
            </h2>
            <Badge 
              variant="secondary" 
              className="font-ibm-plex-mono bg-[#3D2D1D] text-solar-yellow-text"
            >
              STAGE: {currentStage.toUpperCase()}
            </Badge>
          </div>
          <p className="font-ibm-plex-sans text-gray-400 mb-6">
            Transform your Web2 domain into a verifiable, tradable Digital Asset on the Aptos blockchain.
          </p>
        
          <div className="space-y-3">
            <Progress value={getStageProgress()} className="h-2 bg-[#3D2D1D] [&>div]:bg-gradient-to-r [&>div]:from-[#FF7A00] [&>div]:to-[#FFC700]" />
            <div className="grid grid-cols-4 gap-2 text-xs font-ibm-plex-mono text-gray-500">
              <div className={`flex items-center gap-1 ${currentStage === "preflight" ? "text-solar-yellow-text" : ""}`}>
                <Target className="h-3 w-3" />
                1. PRE-FLIGHT
              </div>
              <div className={`flex items-center gap-1 ${currentStage === "authorization" ? "text-solar-yellow-text" : ""}`}>
                <CheckCircle className="h-3 w-3" />
                2. AUTHORIZATION
              </div>
              <div className={`flex items-center gap-1 ${currentStage === "orbital" ? "text-solar-yellow-text" : ""}`}>
                <Zap className="h-3 w-3" />
                3. ORBITAL INSERTION
              </div>
              <div className={`flex items-center gap-1 ${currentStage === "complete" ? "text-solar-yellow-text" : ""}`}>
                <Globe className="h-3 w-3" />
                4. MISSION COMPLETE
              </div>
            </div>
          </div>
      </div>

      {/* Stage 1: Pre-Flight Check */}
      {currentStage === "preflight" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-lg fade-in-section is-visible"
        >
          <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 1: Pre-Flight Check</h3>
          <p className="font-ibm-plex-sans text-gray-400 mb-6">Enter your domain name to begin the tokenization process.</p>
          
          <div className="space-y-4 mb-6">
            <label className="font-ibm-plex-mono text-sm solar-yellow-text" htmlFor="domainName">
              [ DOMAIN NAME ]
            </label>
            <Input
              id="domainName"
              placeholder="your-domain.com"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              className="font-mono bg-[#1a1a1a] border-[#3D2D1D] text-white"
            />
          </div>
          
          <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6">
            <h4 className="font-ibm-plex-mono text-sm text-gray-400 mb-3">[ PRE-FLIGHT CHECKLIST ]</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {isWalletConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                )}
                <span className="font-mono">Aptos wallet connected</span>
              </div>
              <div className="flex items-center gap-2">
                {domainName ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-500" />
                )}
                <span className="font-mono">Domain name provided</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="font-mono">DNS access required for verification</span>
              </div>
            </div>
          </div>

          <button
            onClick={generateTxtRecord}
            disabled={!isWalletConnected || !domainName.trim()}
            className="cta-button w-full bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            [ BEGIN VERIFICATION ]
          </button>
        </motion.div>
      )}

      {/* Stage 2: Launch Authorization */}
      {currentStage === "authorization" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-lg fade-in-section is-visible"
        >
          <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 2: Launch Authorization</h3>
          <p className="font-ibm-plex-sans text-gray-400 mb-6">Add the following TXT record to your domain's DNS settings to prove ownership.</p>

          <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 font-ibm-plex-mono text-sm">
            <h4 className="text-gray-400 mb-3">[ DNS CONFIGURATION ]</h4>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 w-20">TYPE:</span>
                <code className="bg-[#1a1a1a] px-2 py-1 rounded">TXT</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-500 w-20">NAME:</span>
                <code className="bg-[#1a1a1a] px-2 py-1 rounded">@</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <span className="text-gray-500 w-20 mt-1">VALUE:</span>
                <div className="flex items-center gap-2 flex-1">
                  <code className="bg-[#1a1a1a] px-2 py-1 rounded break-all w-full">
                    {txtRecord}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(txtRecord)}
                    className="p-2 rounded-md hover:bg-[#3D2D1D] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex items-start gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-solar-yellow-text mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-bold text-solar-yellow-text">Awaiting DNS Propagation</h5>
                <p className="text-sm text-gray-400 mt-1">
                  DNS changes can take some time to propagate. You can proceed to verify once the record is live. This may take anywhere from a few minutes to several hours.
                </p>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={verifyDomain}
              disabled={isVerifying || verificationComplete}
              className="cta-button w-full flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  VERIFYING...
                </div>
              ) : (
                "[ VERIFY OWNERSHIP ]"
              )}
            </button>
            
            {verificationComplete && (
                <div className="flex-1 text-center py-3 px-8 rounded-lg bg-green-900/30 border border-green-500/50 font-space-grotesk text-green-300">
                    DOMAIN VERIFIED
                </div>
            )}
          </div>
            {verificationComplete && (
                <button
                  onClick={() => setCurrentStage("orbital")}
                  className="cta-button w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-400 text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md"
                >
                  [ PROCEED TO LAUNCH ]
                </button>
              )}
        </motion.div>
      )}

      {/* Stage 3: Orbital Insertion */}
      {currentStage === "orbital" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-lg fade-in-section is-visible"
        >
          <h3 className="font-space-grotesk text-xl font-bold mb-2">Stage 3: Orbital Insertion</h3>
          <p className="font-ibm-plex-sans text-gray-400 mb-6">You are cleared for launch. Sign the transaction to mint your asset and achieve stable orbit.</p>

          <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 font-ibm-plex-mono text-sm">
            <h4 className="text-gray-400 mb-3">[ MISSION PARAMETERS ]</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">DOMAIN:</span>
                <span className="text-white">{domainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NETWORK:</span>
                <span className="text-white">Aptos Testnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ASSET TYPE:</span>
                <span className="text-white">Domain Asset (NFT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">EST. GAS FEE:</span>
                <span className="text-white">~0.001 APT</span>
              </div>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={initiateLaunch}
              disabled={isLaunching}
              className="w-full cta-button bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-xl"
            >
              {isLaunching ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5"
                  >
                    <Rocket />
                  </motion.div>
                  LAUNCHING...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Rocket className="h-6 w-6" />
                  [ IGNITION ]
                </div>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Mission Complete */}
      {currentStage === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-lg text-center fade-in-section is-visible"
        >
            <div className="flex justify-center items-center relative h-64 md:h-80">
                  <svg
                    className="absolute w-full h-full"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="200" cy="200" r="190" stroke="#3D2D1D" strokeWidth="1" />
                    <circle cx="200" cy="200" r="140" stroke="#3D2D1D" strokeWidth="1" />
                    
                    <circle
                      cx="200"
                      cy="200"
                      r="20"
                      fill="#00FF7A"
                      style={{ animation: "pulse 4s ease-in-out infinite" }}
                    />
                    <circle
                      cx="200"
                      cy="200"
                      r="25"
                      stroke="#00FF7A"
                      strokeWidth="1"
                      strokeOpacity="0.5"
                    />

                    <g
                      style={{
                        animation: "orbit-1 10s linear infinite",
                        transformOrigin: "200px 200px",
                      }}
                    >
                      <rect x="198" y="5" width="4" height="8" fill="#E8E8E8" />
                    </g>
                  </svg>
                  <Globe className="text-6xl text-green-400" style={{ animation: "pulse 4s ease-in-out infinite" }}/>
                </div>

              <h2 className="font-space-grotesk text-3xl font-bold text-green-400 mb-2">
                Launch Successful!
              </h2>
              <p className="font-ibm-plex-sans text-lg text-white mb-6">
                <code className="bg-[#1a1a1a] px-2 py-1 rounded-md border border-[#3D2D1D]">{domainName}</code> has achieved stable orbit.
              </p>
              
              <div className="border border-[#3D2D1D] rounded-lg p-4 mb-6 text-left font-ibm-plex-mono text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NFT ID:</span>
                    <span className="text-white">
                      #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TRANSACTION:</span>
                    <a href="#" className="flex items-center gap-1 hover:text-solar-yellow-text">
                      <code className="text-xs">0x{Math.random().toString(16).substr(2, 8)}...</code>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">BLOCK:</span>
                    <span className="text-white">#{Math.floor(Math.random() * 1000000)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setCurrentStage("preflight");
                    setDomainName("");
                    setTxtRecord("");
                    setVerificationComplete(false);
                  }}
                  className="w-full flex-1 bg-transparent border border-[#3D2D1D] hover:bg-[#3D2D1D] transition-colors text-white font-bold font-space-grotesk px-8 py-3 rounded-lg text-md"
                >
                  [ LAUNCH ANOTHER ]
                </button>
                <Link
                  to="/satellite-constellation"
                  className="cta-button w-full flex-1 bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-3 rounded-lg text-md text-center"
                >
                  [ VIEW IN CONSTELLATION ]
                </Link>
              </div>
        </motion.div>
      )}
      </div>
    </div>
    </>
  );
};
