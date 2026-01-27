import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const PitchDeck = () => {
    const slides = [
        {
            title: "O.R.B.I.T.E.R.",
            subtitle: "Transforming Premium Domains into Liquid DeFi Assets",
            content: [
                "Built on Stacks • Powered by USDCx • Secured by Bitcoin",
                "",
                "Deployed: ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7",
                "GitHub: github.com/chandan989/O.R.B.I.T.E.R."
            ],
            highlight: true
        },
        {
            title: "The Problem",
            subtitle: "$10 Billion Locked in Illiquid Domains",
            content: [
                "💔 Illiquidity Crisis",
                "• Premium domains worth millions sit idle",
                "• Average holding period: 2-5 years",
                "• No price discovery mechanism",
                "",
                "🚫 Accessibility Barrier",
                "• google.com sold for $12M",
                "• 99.9% of investors can't participate",
                "• No fractional ownership options",
                "",
                "⚠️ Trading Friction",
                "• 10-20% escrow fees",
                "• 1-2 week settlement times",
                "• Volatile crypto pricing"
            ]
        },
        {
            title: "The Solution",
            subtitle: "O.R.B.I.T.E.R. - DeFi for Domains",
            content: [
                "🔐 Non-Custodial Tokenization",
                "• Verify via DNS (no transfer needed)",
                "• Create on-chain registry with Clarity",
                "• Mint 1M+ fractional shares",
                "",
                "💎 USDCx-Powered Trading",
                "• All prices in stable USDCx",
                "• 0.3% fee (vs 10-20% traditional)",
                "• Instant Bitcoin-secured settlement",
                "",
                "🤖 AI-Powered Valuation",
                "• $2.5B+ real market data",
                "• SEO metrics & traffic analytics",
                "• Oracle consensus pricing"
            ]
        },
        {
            title: "How It Works",
            subtitle: "5-Step Launch Sequence",
            content: [
                "1️⃣ Verify Domain",
                "Add TXT record for cryptographic proof",
                "",
                "2️⃣ AI Valuation",
                "blockchain.com = 45M USDCx",
                "",
                "3️⃣ Tokenize Domain",
                "Create 1M shares with ticker 'BLKC'",
                "",
                "4️⃣ List on Exchange",
                "Enable trading, earn 0.3% fees",
                "",
                "5️⃣ Trade & Manage",
                "Buy/sell instantly, track portfolio"
            ]
        },
        {
            title: "Technical Architecture",
            subtitle: "Production-Ready Infrastructure",
            content: [
                "📦 6 Clarity Smart Contracts (1,749 lines)",
                "• domain-registry",
                "• fractional (SIP-010)",
                "• marketplace",
                "• valuation",
                "• security",
                "• validation",
                "",
                "🎨 Frontend: React 18 + TypeScript (15,000+ lines)",
                "⚙️ Backend: Node.js + Express (15+ endpoints)",
                "💎 USDCx: 50+ integration points",
                "✅ Test Coverage: 95%+",
                "🔒 Bitcoin-Secured Finality"
            ]
        },
        {
            title: "USDCx Integration",
            subtitle: "Deep Integration (50+ Points)",
            content: [
                "❌ Without USDCx:",
                "Domain worth 100 STX → STX drops 30%",
                "→ Investor loses 30% to volatility",
                "",
                "✅ With USDCx:",
                "Domain worth 45M USDCx → STX price changes",
                "→ Domain still worth 45M USDCx",
                "→ Investor value protected",
                "",
                "Benefits:",
                "🎯 Predictable pricing",
                "🏦 Institutional adoption",
                "🌉 Ethereum ↔ Stacks bridge",
                "⚖️ Regulatory compliance"
            ]
        },
        {
            title: "Market Opportunity",
            subtitle: "$10B+ Market Ready for Disruption",
            content: [
                "📊 Domain Industry:",
                "• Global Market: $10B+ annually",
                "• Premium Sales: $2.5B+ verified",
                "• Growth Rate: 15% YoY",
                "",
                "👥 Target Users:",
                "• 500K+ domain investors",
                "• 420M+ crypto users",
                "• $50B+ DeFi TVL",
                "",
                "🏆 First-Mover Advantage:",
                "Only platform on Stacks with USDCx"
            ]
        },
        {
            title: "Business Model",
            subtitle: "Multiple Revenue Streams",
            content: [
                "1. Trading Fees (Primary)",
                "0.3% on 10M USDCx daily = $30K/day",
                "Annual: ~$10M at scale",
                "",
                "2. Tokenization Fees",
                "$500-$5K per domain × 1,000 = $1M",
                "",
                "3. Premium Features",
                "Analytics + API = $600K/year",
                "",
                "💰 Total Year 1: $11M+ revenue",
                "📈 Profit Margin: 70%+"
            ]
        },
        {
            title: "Deployed & Live",
            subtitle: "Production-Ready Platform",
            content: [
                "✅ 6 Clarity contracts on Stacks Testnet",
                "✅ Full-stack web application",
                "✅ AI valuation engine",
                "✅ Trading platform",
                "✅ Portfolio management",
                "✅ USDCx integration (50+ points)",
                "✅ 95%+ test coverage",
                "",
                "🔗 Live on Testnet:",
                "ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7",
                "",
                "📊 Stats: 1,749 lines contracts",
                "15,000+ lines frontend"
            ]
        },
        {
            title: "Roadmap",
            subtitle: "Path to Mainnet & Beyond",
            content: [
                "Q2 2026: Mainnet Launch",
                "• Security audit",
                "• Mainnet deployment",
                "• Marketing campaign",
                "",
                "Q3 2026: Expansion",
                "• Mobile app (iOS/Android)",
                "• Advanced trading features",
                "• $ORBIT governance token",
                "",
                "Q4 2026: Enterprise",
                "• White-label solutions",
                "• Custody services",
                "• Global expansion",
                "",
                "2027+: Beyond Domains",
                "• Social handles, IP, RWA"
            ]
        },
        {
            title: "Why We'll Win",
            subtitle: "7 Competitive Advantages",
            content: [
                "1. Bitcoin Security",
                "Stacks inherits Bitcoin's security",
                "",
                "2. USDCx Innovation",
                "First domain platform with stablecoin",
                "",
                "3. Technical Excellence",
                "Production-ready, 95%+ test coverage",
                "",
                "4. Real Market Data",
                "$2.5B+ verified sales",
                "",
                "5. First-Mover Advantage",
                "Only platform on Stacks",
                "",
                "6. Scalable Model",
                "Infrastructure for any asset",
                "",
                "7. Clear Business Model",
                "Multiple revenue streams"
            ]
        },
        {
            title: "Ready for Liftoff",
            subtitle: "Join the O.R.B.I.T.E.R. Mission",
            content: [
                "🌐 Try the Demo",
                "Run locally with npm run dev",
                "",
                "📖 Read Docs",
                "github.com/chandan989/O.R.B.I.T.E.R.",
                "",
                "🔗 View Contracts",
                "explorer.hiro.so",
                "",
                "📧 Contact",
                "nikhlu07@gmail.com",
                "",
                "🚀 Built for:",
                "Stacks USDCx Programming Hackathon 2026"
            ],
            highlight: true
        }
    ];

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Navigation */}
                <div className="max-w-6xl mx-auto mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FFC700] transition-colors font-ibm-plex-mono text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        [ RETURN TO BASE ]
                    </Link>
                </div>

                {/* Header */}
                <div className="max-w-6xl mx-auto mb-12 text-center">
                    <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold mb-4">
                        🛰️ O.R.B.I.T.E.R. Pitch Deck
                    </h1>
                    <p className="text-xl text-gray-300">
                        Transforming Premium Domains into Liquid DeFi Assets
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                        <a
                            href="https://github.com/chandan989/O.R.B.I.T.E.R."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FE6440] text-black font-bold rounded hover:bg-[#FFC700] transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View on GitHub
                        </a>
                    </div>
                </div>

                {/* Slides */}
                <div className="max-w-6xl mx-auto space-y-8">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`glass-panel p-8 md:p-12 rounded-2xl ${slide.highlight
                                ? 'border-2 border-[#FE6440] bg-gradient-to-br from-[#FE6440]/5 to-[#FFC700]/5'
                                : ''
                                }`}
                        >
                            {/* Slide Number */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-ibm-plex-mono text-sm text-[#FE6440]">
                                    [ SLIDE {index + 1} / {slides.length} ]
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="font-space-grotesk text-3xl md:text-4xl font-bold mb-3">
                                {slide.title}
                            </h2>

                            {/* Subtitle */}
                            {slide.subtitle && (
                                <p className="text-xl text-[#FFC700] mb-6 font-ibm-plex-sans">
                                    {slide.subtitle}
                                </p>
                            )}

                            {/* Content */}
                            <div className="space-y-2 font-ibm-plex-sans text-gray-300">
                                {slide.content.map((line, lineIndex) => (
                                    <p
                                        key={lineIndex}
                                        className={`${line.startsWith('•')
                                            ? 'pl-6 text-gray-400'
                                            : line.match(/^[🔐💎🤖1️⃣2️⃣3️⃣4️⃣5️⃣📦🎨⚙️💎✅🔒❌✅📊👥🏆💰📈🌐📖🔗📧🚀]/)
                                                ? 'font-bold text-white text-lg mt-4'
                                                : line === ''
                                                    ? 'h-2'
                                                    : ''
                                            }`}
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="max-w-6xl mx-auto mt-16 text-center">
                    <div className="glass-panel p-12 rounded-xl border border-[#FE6440]/30">
                        <h3 className="font-space-grotesk text-3xl font-bold mb-4">
                            Ready to Transform Domain Trading?
                        </h3>
                        <p className="text-gray-400 mb-8">
                            Join us in building the future of digital asset liquidity on Stacks
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/launch-sequence"
                                className="px-8 py-3 bg-[#FE6440] text-black font-bold rounded font-space-grotesk hover:bg-[#FFC700] transition-colors"
                            >
                                TRY THE DEMO
                            </Link>
                            <a
                                href="https://github.com/chandan989/O.R.B.I.T.E.R."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-3 border border-[#3D2D1D] rounded font-space-grotesk hover:bg-white/5 transition-colors"
                            >
                                VIEW SOURCE CODE
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PitchDeck;
