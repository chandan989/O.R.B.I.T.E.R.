import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, Clock, Tag, Globe, TrendingUp, Zap, Shield, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

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
      icon: <TrendingUp className="h-5 w-5" />,
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
      icon: <Zap className="h-5 w-5" />,
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
      icon: <BarChart3 className="h-5 w-5" />,
      content: [
        "1. Verify Domain (Non-Custodial)",
        "Add a TXT record to your DNS: orbiter-verify=0x7f3e9a2b...",
        "We verify cryptographically. You never transfer your domain to us.",
        "",
        "2. Create Domain Object",
        "Mint an Stacks Object representing your domain with fractional shares:",
        "• Set total shares (e.g., 1,000,000)",
        "• Choose: Full tokenization OR keep majority + tokenize minority",
        "• Shares become tradable Fungible Assets",
        "Transaction completes in <1 second on Stacks.",
        "",
        "3. Instant Trading on DEXes",
        "Your domain shares work with all Stacks DeFi:",
        "• Trade on Liquidswap, PancakeSwap, Thala",
        "• Provide liquidity → earn fees",
        "• Use as collateral in lending",
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
      icon: <DollarSign className="h-5 w-5" />,
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
      icon: <Shield className="h-5 w-5" />,
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
        "5. Fungible Assets Framework",
        "Domain shares work with all DeFi protocols automatically. No custom integrations needed."
      ]
    },
    {
      id: "demo",
      title: "Live Demo",
      icon: <Globe className="h-5 w-5" />,
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1B3A] to-[#2D1810] text-white">
      {/* Header Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#FF7A00] hover:text-[#FF9533] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>

      {/* Blog Header */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {blogPost.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {blogPost.readTime}
            </div>
            <div className="flex items-center gap-2">
              <span>by</span>
              <span className="text-[#FF7A00] font-medium">{blogPost.author}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-space-grotesk text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {blogPost.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            {blogPost.subtitle}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {blogPost.tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-full text-sm text-[#FF7A00]"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Medium Link */}
          <a
            href={blogPost.mediumLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF9533] rounded-lg font-medium hover:shadow-lg hover:shadow-[#FF7A00]/25 transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            Read on Medium
          </a>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className="glass-panel p-8 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#FF7A00]/10 rounded-lg text-[#FF7A00]">
                    {section.icon}
                  </div>
                  <h2 className="font-space-grotesk text-2xl font-bold">
                    {section.title}
                  </h2>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className={`mb-4 ${
                        paragraph.startsWith('•') || paragraph.startsWith('✅') || paragraph.startsWith('💎') || paragraph.startsWith('💧') || paragraph.startsWith('💰') || paragraph.startsWith('🎁') || paragraph.startsWith('📊')
                          ? 'text-gray-300 pl-4'
                          : paragraph === ''
                          ? 'mb-2'
                          : paragraph.includes('Domain Object = {')
                          ? 'font-mono bg-gray-900/50 p-4 rounded-lg text-[#FF7A00] border border-[#FF7A00]/20'
                          : paragraph.match(/^\d+\./)
                          ? 'font-semibold text-[#FF7A00] text-lg mb-2'
                          : 'text-gray-200 leading-relaxed'
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="glass-panel p-8 rounded-xl border border-white/10 bg-gradient-to-r from-[#FF7A00]/5 to-[#FF9533]/5">
              <h3 className="font-space-grotesk text-2xl font-bold mb-4">
                Ready to Revolutionize Domain Trading?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join the beta and be among the first to experience instant, liquid, and composable domain trading on Stacks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/launch-sequence')}
                  className="px-8 py-3 bg-gradient-to-r from-[#FF7A00] to-[#FF9533] rounded-lg font-medium hover:shadow-lg hover:shadow-[#FF7A00]/25 transition-all duration-300"
                >
                  Try the Demo
                </button>
                <a
                  href="https://github.com/chandan989/O.R.B.I.T.E.R."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-white/20 rounded-lg font-medium hover:bg-white/5 transition-all duration-300"
                >
                  View on GitHub
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