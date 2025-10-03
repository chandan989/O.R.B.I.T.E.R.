
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ContractStatus } from "../components/ContractStatus";

const Index = () => {
  useEffect(() => {
    // Page Loader
    const loader = document.getElementById('loader');
    if (loader) {
        // No initial wait, just start fading out.
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // This should match the CSS transition duration
    }

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
        // Cleanup
        sections.forEach(section => {
            observer.unobserve(section);
        });
    };
  }, []);
  return (
    <>
      <div className="antialiased">
        <div id="loader" className="loader-container">
          <div className="cosmic-loader">
            <div className="central-star"></div>
            <div className="orbit">
              <div className="planet"></div>
            </div>
            <div className="orbit">
              <div className="planet"></div>
            </div>
            <div className="shooting-star"></div>
            <div className="shooting-star"></div>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <main className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center items-center relative h-64 md:h-96 lg:h-[28rem] md:order-last">
                  <svg
                    className="absolute w-full h-full"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="200" cy="200" r="190" stroke="#3D2D1D" strokeWidth="1" />
                    <circle cx="200" cy="200" r="140" stroke="#3D2D1D" strokeWidth="1" />
                    <circle cx="200" cy="200" r="90" stroke="#3D2D1D" strokeWidth="1" />

                    <circle
                      cx="200"
                      cy="200"
                      r="20"
                      fill="#FF7A00"
                      style={{ animation: "pulse 4s ease-in-out infinite" }}
                    />
                    <circle
                      cx="200"
                      cy="200"
                      r="25"
                      stroke="#FF7A00"
                      strokeWidth="1"
                      strokeOpacity="0.5"
                    />

                    <g
                      style={{
                        animation: "orbit-1 10s linear infinite",
                        transformOrigin: "200px 200px",
                      }}
                    >
                      <circle cx="200" cy="10" r="5" fill="#FFC700" />
                    </g>
                    <g
                      style={{
                        animation: "orbit-2 15s linear infinite",
                        transformOrigin: "200px 200px",
                      }}
                    >
                      <rect x="60" y="198" width="8" height="4" fill="#E8E8E8" />
                    </g>
                  </svg>
                </div>

                <div className="text-center md:text-left">
                  <p className="font-ibm-plex-mono text-sm solar-yellow-text">
                    [ STATUS: OPERATIONAL ]
                  </p>
                  <h1 className="font-space-grotesk text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mt-2">
                    O.R.B.I.T.E.R.
                  </h1>
                  <p className="font-ibm-plex-sans text-lg md:text-xl mt-4 text-gray-300">
                    On-chain Registry & Brokerage Infrastructure for Tokenized External Resources
                  </p>
                  <p className="mt-6 max-w-lg mx-auto md:mx-0 text-gray-400">
                    Unlock the value of your digital universe. Achieve orbit for your Web2 assets and trade them as fractionalized Aptos Objects in the permissionless ecosystem of Web3.
                  </p>
                  <Link
                    to="/launch-sequence"
                    className="cta-button mt-10 inline-block bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-lg"
                  >
                    [ INITIATE LAUNCH SEQUENCE ]
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>

        <section id="mission" className="py-20 fade-in-section">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-[#FFC700] to-[#FF7A00] opacity-20 blur-xl"></div>
                <div className="relative p-8 rounded-lg glass-panel">
                  <h2 className="font-space-grotesk text-3xl font-bold mb-4">
                    Mission Overview
                  </h2>
                  <p className="font-ibm-plex-sans text-gray-300 leading-relaxed">
                    Billions in value are locked in Web2 assets like domains and social handles.
                    O.R.B.I.T.E.R. provides the enterprise-grade infrastructure to bridge these
                    universes, bringing Web2 assets into the Web3 economy as liquid, tradable
                    Aptos Objects on the Aptos blockchain.
                  </p>
                  <p className="font-ibm-plex-sans text-gray-300 leading-relaxed mt-4">
                    Our mission is to unlock this dormant value and create a professional trading
                    environment for the next generation of orbital assets.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-space-grotesk text-2xl font-bold solar-yellow-text mb-4">
                  Why Aptos?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="pt-1 text-[#FFC700]">&#10142;</div>
                    <p>
                      <strong className="font-semibold">Sub-second finality</strong> for zero-latency
                      trading.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="pt-1 text-[#FFC700]">&#10142;</div>
                    <p>
                      <strong className="font-semibold">Minimal transaction costs</strong> enabling
                      microtransactions.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="pt-1 text-[#FFC700]">&#10142;</div>
                    <p>
                      <strong className="font-semibold">Move language security</strong> with formal
                      verification capabilities.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="pt-1 text-[#FFC700]">&#10142;</div>
                    <p>
                      <strong className="font-semibold">Parallel execution</strong> supporting
                      high-throughput operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </section>

        <section id="sequence" className="py-20 fade-in-section">
          <div className="text-center">
            <h2 className="font-space-grotesk text-3xl md:text-4xl font-bold">
              The Launch Sequence
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Follow the five-stage protocol to achieve a stable orbit for your digital assets.
            </p>
            <div className="relative mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

              <div className="relative glass-panel p-6 rounded-lg text-left z-10 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-lg flex items-center justify-center border border-[#FF7A00]/50 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 solar-flare-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold">1. Pre-Flight</h3>
                </div>
                <p className="text-gray-300 flex-grow">
                  Connect your wallet and provide the domain name. Our system performs initial checks for compatibility.
                </p>
              </div>

              <div className="relative glass-panel p-6 rounded-lg text-left z-10 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-lg flex items-center justify-center border border-[#FF7A00]/50 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 solar-flare-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold">2. Authorization</h3>
                </div>
                <p className="text-gray-300 flex-grow">
                  Prove ownership by adding a unique TXT record to your domain's DNS settings for security verification.
                </p>
              </div>

              <div className="relative glass-panel p-6 rounded-lg text-left z-10 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-lg flex items-center justify-center border border-[#FF7A00]/50 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 solar-flare-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20V10M18 20V4M6 20V16" /></svg>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold">3. Valuation</h3>
                </div>
                <p className="text-gray-300 flex-grow">
                  Our protocol calculates the objective market value of your asset based on SEO authority, traffic, and brandability.
                </p>
              </div>

              <div className="relative glass-panel p-6 rounded-lg text-left z-10 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-lg flex items-center justify-center border border-[#FF7A00]/50 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 solar-flare-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M4 17v4M2 19h4M17 3v4M16 5h4M19 17v4M18 19h4M12 9v6M9 12h6" /></svg>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold">4. Tokenization</h3>
                </div>
                <p className="text-gray-300 flex-grow">
                  Customize your asset’s on-chain parameters, including the symbol for its liquid shares, before creating the Aptos Object.
                </p>
              </div>

              <div className="relative glass-panel p-6 rounded-lg text-left z-10 flex flex-col">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-lg flex items-center justify-center border border-[#FF7A00]/50 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 solar-flare-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.04-3.1-.66-.8-2.16-.84-3.04-.04-1.26 1.5-2.04 2-2.04 2z"/><path d="m10.02 14.02 2.12-2.12c.2-.2.38-.42.5-.66l.38-1.12.38-1.14c.1-.3.18-.6.22-.9.04-.3.04-.62.02-.94l-.04-1.1c-.02-.32-.06-.6-.12-.88l-.2-1.14-.2-1.12a2.5 2.5 0 0 0-4.18-2.18l-1.12.2-1.14.2c-.28.06-.56.12-.88.2l-1.1.04c-.32.02-.64.02-.94-.02l-1.14-.38-1.12-.38c-.24-.08-.46-.2-.66-.4l-2.12-2.12"/></svg>
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold">5. Mission Complete</h3>
                </div>
                <p className="text-gray-300 flex-grow">
                  Your asset achieves stable orbit as a tradable token on Aptos, visible in your Constellation and the Exosphere.
                </p>
              </div>

            </div>
          </div>
        </section>

        <section id="exosphere" className="py-20 fade-in-section">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-2">
                <h2 className="font-space-grotesk text-3xl font-bold">The Exosphere</h2>
                <p className="font-ibm-plex-sans text-lg solar-yellow-text mt-2">
                  The Orbital Exchange
                </p>
                <p className="mt-4 text-gray-300 leading-relaxed">
                  Welcome to the future of digital asset trading. The Exosphere is a professional
                  terminal to monitor incoming trajectories, analyze deep telemetry data, and trade
                  with confidence in a secure and liquid marketplace.
                </p>
              </div>
              <div className="md:col-span-3">
                <div className="glass-panel rounded-lg p-6 border-[#3D2D1D] border">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-space-grotesk text-lg">INCOMING TRAJECTORIES</h4>
                    <div className="text-xs font-ibm-plex-mono text-[#FFC700]">● LIVE FEED</div>
                  </div>
                  <div className="font-ibm-plex-mono text-sm space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-gray-400">
                      <span>ASSET_ID</span>
                      <span className="text-right">TELEMETRY_SCORE</span>
                      <span className="text-right">ORBIT_EPOCH</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center bg-white/5 p-2 rounded">
                      <span>protocol.apt</span>
                      <span className="text-right text-[#FFC700]">92.4</span>
                      <span className="text-right">1727421600</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-2 rounded">
                      <span>web3domains.io</span>
                      <span className="text-right text-[#FF7A00]">78.1</span>
                      <span className="text-right">1727421545</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center bg-white/5 p-2 rounded">
                      <span>gemini.ai</span>
                      <span className="text-right text-[#FFC700]">95.8</span>
                      <span className="text-right">1727421491</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center p-2 rounded">
                      <span>orbiter.space</span>
                      <span className="text-right text-[#FF7A00] opacity-70">61.5</span>
                      <span className="text-right">1727421380</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        <section id="contract-status" className="py-12 fade-in-section">
          <div className="max-w-md mx-auto">
            <ContractStatus />
          </div>
        </section>

        <section id="mission-control-cta" className="py-20 fade-in-section">
          <div className="text-center">
            <div className="glass-panel rounded-lg py-12 px-8 max-w-4xl mx-auto">
              <h2 className="font-space-grotesk text-3xl md:text-4xl font-bold">
                Ready for Liftoff?
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Begin the process of bringing your Web2 assets into the Web3 economy. The launch sequence is your first step.
              </p>
              <Link
                to="/launch-sequence"
                className="cta-button mt-10 inline-block bg-gradient-to-r from-[#FF7A00] to-[#FFC700] text-black font-bold font-space-grotesk px-8 py-4 rounded-lg text-lg"
              >
                [ INITIATE LAUNCH SEQUENCE ]
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;