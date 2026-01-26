import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Calendar, Clock, Tag, Globe, TrendingUp, Zap, Shield, DollarSign, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
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
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  const blogPost = {
    title: "The Stacks Primitive That Unlocks a $5B Market",
    subtitle: "How O.R.B.I.T.E.R. uses Stacks Objects to make domains instantly tradable, liquid, and composable",
    author: "Nikhhils",
    date: "October 4, 2025",
    readTime: "5 min read",
    tags: ["Stacks", "DeFi", "RWA", "Blockchain", "Fintech"],
    mediumLink: "https://medium.com/@nikhhils07/the-stacks-primitive-that-unlocks-a-5b-market-83f8c16eb354"
  };

  const sections = [
    {
      id: "problem",
      title: "The Problem in 30 Seconds",
      icon: <TrendingUp className="h-6 w-6 text-[#FE6440]" />,
      content: [
        "Domain trading is painful:",
        "• Requires trusted escrow (Escrow.com charges 10–15%)",
        "• Takes 1–2 weeks to settle",
        "• All-or-nothing (can't sell 30% of your domain)",
        "• Zero liquidity (wait weeks/months for buyers)",
        "",
        "Domains can't use DeFi:",
        "• Can't borrow against them",
        "• Can't use as collateral",
        "• Can't earn yield",
        "• Can't trade on DEXes",
        "",
        "Result: Billions in trapped value, illiquid assets, zero composability."
      ]
    },
    {
      id: "solution",
      title: "The Solution: Stacks Objects",
      icon: <Zap className="h-6 w-6 text-[#FFC700]" />,
      content: [
        "We use Stacks Objects — a unique primitive that doesn't exist on other chains.",
        "",
        "Think of it as a programmable container that combines:",
        "• Unique identity (like an NFT)",
        "• Fractional ownership (like fungible tokens)",
        "• Custom rules (programmable control)",
        "",
        "For Domains, This Means:",
        "Domain Object = {",
        "  Identity: \"crypto.com\" ✓",
        "  + 1,000,000 tradable shares ✓",
        "  + Automatic control (>50% holder gets DNS access) ✓",
        "  + Revenue distribution to all shareholders ✓",
        "  + DeFi composability ✓",
        "}",
        "",
        "No NFT-only or token-only approach can do this. Only Stacks Objects."
      ]
    },
    {
      id: "how-it-works",
      title: "How It Works (4 Steps)",
      icon: <BarChart3 className="h-6 w-6 text-[#FE6440]" />,
      content: [
        "1. Verify Domain (Non-Custodial)",
        "Add a TXT record to your DNS: orbiter-verify=0x7f3e9a2b...",
        "We verify cryptographically. You never transfer your domain to us.",
        "",
        "2. Create Domain Object",
        "Mint a Stacks Object representing your domain with fractional shares:",
        "• Set total shares (e.g., 1,000,000)",
        "• Choose: Full tokenization OR keep majority + tokenize minority",
        "• Shares become tradable on Stacks DeFi",
        "Transaction completes in <1 second on Stacks.",
        "",
        "3. Instant Trading on DEXes",
        "Your domain shares work with all Stacks DeFi:",
        "• Trade on ALEX, Velar, Stackswap",
        "• Provide liquidity → earn fees",
        "• Use as collateral in lending protocols",
        "• Stake for rewards",
        "",
        "4. DNS Control Follows Ownership",
        "The magic: Whoever holds >50% shares gets DNS management access.",
        "Smart contract tracks share balances automatically.",
        "Control transfers when shares trade."
      ]
    },
    {
      id: "use-cases",
      title: "Real Use Cases",
      icon: <DollarSign className="h-6 w-6 text-[#FFC700]" />,
      content: [
        "💎 Fractional Investment",
        "Buy $1,000 of \"crypto.com\" instead of buying the whole $10M domain",
        "",
        "💧 Instant Liquidity",
        "Create liquidity pool, earn trading fees, exit anytime",
        "",
        "💰 DeFi Collateral",
        "Borrow USDCx against your domain shares without selling",
        "",
        "🎁 Real Yield",
        "Domain earns $50K/month → distributed to all shareholders",
        "",
        "📊 Portfolio Management",
        "Diversify across 20 domains for $5K instead of buying one for $100K"
      ]
    },
    {
      id: "why-stacks",
      title: "Why Stacks? (The Technical Reasons)",
      icon: <Shield className="h-6 w-6 text-[#FE6440]" />,
      content: [
        "1. Stacks Objects = Game Changer",
        "No other chain has this primitive. Objects let us combine unique identity with fractional ownership seamlessly.",
        "",
        "2. Sub-Second Finality",
        "Domain trades settle in <400ms. Compare to Ethereum's 15+ minutes.",
        "",
        "3. Penny Transactions",
        "$0.001 gas costs enable $100 domain trades. Ethereum gas would kill small trades.",
        "",
        "4. Clarity Security",
        "Resource-oriented programming = mathematical proof of correctness. Critical for high-value assets.",
        "",
        "5. SIP-010 Fungible Token Standard",
        "Domain shares work with all Stacks DeFi protocols automatically. No custom integrations needed."
      ]
    },
    {
      id: "demo",
      title: "Live Demo",
      icon: <Globe className="h-6 w-6 text-[#FFC700]" />,
      content: [
        "Working MVP on Stacks Testnet:",
        "",
        "✅ DNS verification system",
        "✅ Domain object minting",
        "✅ Share transfers with control tracking",
        "✅ Mission Control dashboard",
        "✅ DEX integration (basic)",
        "",
        "Try it: https://o-r-b-i-t-e-r.vercel.app/",
        "GitHub: https://github.com/chandan989/O.R.B.I.T.E.R."
      ]
    }
  ];

  return (
    <div className="pt-24 pb-20 fade-in-section">
      {/* Background Elements similar to Index */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#FE6440]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FFC700]/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4">
        {/* Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FFC700] transition-colors font-ibm-plex-mono text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            [ RETURN TO BASE ]
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="glass-panel p-8 md:p-12 rounded-2xl mb-12 relative overflow-hidden">
            {/* Decorative orbit line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FE6440] to-[#FFC700] opacity-50" />

            <div className="flex flex-wrap items-center gap-6 text-sm font-ibm-plex-mono text-[#FE6440] mb-6">
              <span className="flex items-center gap-2 bg-[#FE6440]/10 px-3 py-1 rounded border border-[#FE6440]/20">
                <Calendar className="h-4 w-4" />
                {blogPost.date}
              </span>
              <span className="flex items-center gap-2 bg-[#FFC700]/10 px-3 py-1 rounded text-[#FFC700] border border-[#FFC700]/20">
                <Clock className="h-4 w-4" />
                {blogPost.readTime}
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                <span>TRANSMISSION BY:</span>
                <span className="text-white font-bold">{blogPost.author}</span>
              </span>
            </div>

            <h1 className="font-space-grotesk text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {blogPost.title}
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed font-ibm-plex-sans">
              {blogPost.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 mt-8">
              {blogPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 font-ibm-plex-mono"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={blogPost.mediumLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#FE6440] text-black font-bold rounded hover:bg-[#FFC700] transition-colors font-space-grotesk shadow-[0_0_15px_rgba(254,100,64,0.3)]"
            >
              <ExternalLink className="h-4 w-4" />
              READ ORIGINAL TRANSMISSION
            </a>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className="glass-panel p-8 rounded-xl hover:border-[#FE6440]/30 transition-colors fade-in-section"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-[#111111] rounded-lg border border-[#3D2D1D]">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="font-space-grotesk text-2xl font-bold text-white mb-2">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="font-ibm-plex-sans text-gray-300 space-y-4 leading-relaxed">
                  {section.content.map((paragraph, pIndex) => (
                    <div key={pIndex}>
                      <p
                        className={`${paragraph.startsWith('•') || paragraph.startsWith('✅') || paragraph.startsWith('💎') || paragraph.startsWith('💧') || paragraph.startsWith('💰') || paragraph.startsWith('🎁') || paragraph.startsWith('📊')
                            ? 'pl-6 relative before:content-[""] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-[#FE6440] before:rounded-full opacity-90'
                            : paragraph === ''
                              ? 'h-2'
                              : paragraph.includes('Domain Object = {') || paragraph.trim().startsWith('+') || paragraph.trim().startsWith('Identity:') || paragraph.trim().startsWith('}')
                                ? 'font-ibm-plex-mono text-[#FFC700] bg-black/40 p-3 mx-2 rounded border-l-2 border-[#FE6440]'
                                : paragraph.match(/^\d+\./)
                                  ? 'font-bold text-white text-lg pt-4'
                                  : ''
                          }`}
                      >
                        {paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="mt-16 text-center fade-in-section">
            <div className="glass-panel p-12 rounded-xl border border-[#FE6440]/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FE6440]/5 to-[#FFC700]/5 pointer-events-none" />

              <h3 className="font-space-grotesk text-3xl font-bold mb-4 relative z-10">
                Ready to Revolutionize Domain Trading?
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto relative z-10">
                Join the beta and be among the first to experience instant, liquid, and composable domain trading on Stacks.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link
                  to="/launch-sequence"
                  className="px-8 py-3 bg-[#FE6440] text-black font-bold rounded font-space-grotesk hover:bg-[#FFC700] transition-colors shadow-[0_0_20px_rgba(254,100,64,0.3)]"
                >
                  INITIATE LAUNCH
                </Link>
                <a
                  href="https://github.com/chandan989/O.R.B.I.T.E.R."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-[#3D2D1D] rounded font-space-grotesk hover:bg-white/5 transition-colors text-white"
                >
                  ACCESS SOURCE CODE
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;