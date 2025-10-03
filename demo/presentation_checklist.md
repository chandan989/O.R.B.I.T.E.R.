# 🎪 Hackathon Presentation Checklist

## Pre-Presentation Setup (30 minutes before)

### ✅ Environment Verification
- [ ] Aptos CLI installed and working (`aptos --version`)
- [ ] Node.js and npm installed (`node --version`, `npm --version`)
- [ ] Internet connection stable
- [ ] Projector/screen tested and working
- [ ] Audio system tested (if using sound)

### ✅ Contract Deployment
- [ ] Run `./scripts/deploy.sh` (or `.ps1` on Windows)
- [ ] Verify `.env.deployment` file exists
- [ ] Check contract deployment on Aptos Explorer
- [ ] Confirm all modules deployed successfully

### ✅ Demo Accounts Setup
- [ ] Run `./scripts/create_demo_accounts.sh`
- [ ] Verify `.env.demo_accounts` file exists
- [ ] Check all 5 accounts have sufficient APT balance (10+ APT each)
- [ ] Test wallet connections for each account

### ✅ Demo Data Population
- [ ] Run `./scripts/setup_demo.sh`
- [ ] Verify demo domains created (15 domains)
- [ ] Check initial trading listings exist
- [ ] Confirm market data is populated

### ✅ Demo Scenarios Execution
- [ ] Run `./scripts/run_demo_scenarios.sh`
- [ ] Verify all scenarios completed without errors
- [ ] Check trading activity is visible
- [ ] Confirm portfolio balances are distributed

### ✅ Frontend Application
- [ ] Navigate to `orbiter-web/` directory
- [ ] Run `npm install` (if not done already)
- [ ] Start development server: `npm run dev`
- [ ] Verify frontend loads at `http://localhost:5173`
- [ ] Test all navigation links work
- [ ] Confirm wallet connection works

### ✅ Browser Setup
- [ ] Open Chrome/Firefox with developer tools ready
- [ ] Install Petra wallet extension
- [ ] Import presenter account into Petra wallet
- [ ] Test wallet connection to frontend
- [ ] Bookmark key URLs:
  - Landing: `http://localhost:5173/`
  - Launch: `http://localhost:5173/launch-sequence`
  - Trading: `http://localhost:5173/exosphere-exchange`
  - Portfolio: `http://localhost:5173/satellite-constellation`

## During Presentation (15 minutes)

### 🎯 Timing Breakdown

#### 0:00-2:00 - Opening & Problem Statement
- [ ] Show landing page with orbital animation
- [ ] Highlight problem: "$100B+ in illiquid Web2 assets"
- [ ] Present solution: "Tokenize domains as Aptos Objects"
- [ ] Display key metrics: "$2.5B+ tokenized, 10,000+ traders"

#### 2:00-4:00 - Live Domain Tokenization
- [ ] Navigate to Launch Sequence page
- [ ] Enter domain: "hackathon-demo.com"
- [ ] Show DNS verification process
- [ ] Display AI valuation breakdown
- [ ] Configure: LIVE ticker, 100,000 supply
- [ ] Execute tokenization transaction
- [ ] Show success confirmation

#### 4:00-6:00 - Trading Interface Demo
- [ ] Navigate to Exosphere Exchange
- [ ] Show GOOGL/APT trading pair
- [ ] Display real-time order book
- [ ] Show price chart with 24h data
- [ ] Execute buy order for LIVE tokens
- [ ] Confirm trade execution

#### 6:00-8:00 - Market Dynamics
- [ ] Switch to whale investor view
- [ ] Show large GOOGL position (50,000 tokens)
- [ ] Display institutional trading activity
- [ ] Switch to retail trader view
- [ ] Show diversified portfolio
- [ ] Demonstrate small position trading

#### 8:00-10:00 - Technical Architecture
- [ ] Show transaction speed (<1 second)
- [ ] Display gas costs (minimal fees)
- [ ] Highlight Move language security
- [ ] Show modular contract architecture
- [ ] Demonstrate parallel execution

#### 10:00-12:00 - Business Model
- [ ] Show revenue model: 2.5% trading fees
- [ ] Display volume projections: $50M+ daily
- [ ] Present market opportunity: $100B+ TAM
- [ ] Highlight competitive advantages

#### 12:00-13:00 - Roadmap & Vision
- [ ] Show expansion plans: social handles, cross-chain
- [ ] Display DeFi integration roadmap
- [ ] Present partnership pipeline
- [ ] Highlight scalability features

#### 13:00-15:00 - Q&A & Closing
- [ ] Answer technical questions
- [ ] Address business model queries
- [ ] Discuss investment opportunity
- [ ] Provide contact information

## Emergency Backup Plans

### 🚨 If Live Demo Fails

#### Plan A: Pre-recorded Demo
- [ ] Have screen recording of full demo ready
- [ ] Narrate over recording as if live
- [ ] Explain what would happen in each step

#### Plan B: Static Screenshots
- [ ] Prepare high-quality screenshots of each step
- [ ] Create slide deck with key screens
- [ ] Walk through functionality with images

#### Plan C: Code Walkthrough
- [ ] Show Move smart contract code
- [ ] Explain key functions and logic
- [ ] Demonstrate testing results
- [ ] Show deployment verification

### 🔧 Common Issues & Solutions

#### Frontend Won't Load
```bash
# Quick fix
cd orbiter-web
npm run build
npm run preview
```

#### Wallet Connection Issues
- [ ] Refresh browser page
- [ ] Disconnect and reconnect wallet
- [ ] Switch to different browser
- [ ] Use backup account

#### Contract Interaction Fails
- [ ] Check account has sufficient APT
- [ ] Verify contract addresses in frontend
- [ ] Switch to backup account
- [ ] Show transaction on Aptos Explorer

#### Network Connectivity Issues
- [ ] Use mobile hotspot as backup
- [ ] Switch to offline demo mode
- [ ] Use pre-recorded content

## Post-Presentation

### ✅ Immediate Follow-up
- [ ] Collect judge contact information
- [ ] Share demo repository link
- [ ] Provide technical documentation
- [ ] Schedule follow-up meetings

### ✅ Data Collection
- [ ] Note questions asked by judges
- [ ] Record feedback received
- [ ] Document technical issues encountered
- [ ] Gather improvement suggestions

### ✅ Thank You Actions
- [ ] Send thank you emails to judges
- [ ] Share additional resources
- [ ] Provide investment deck if requested
- [ ] Connect on LinkedIn/social media

## Key Talking Points to Remember

### 🎯 Value Propositions
1. **"$100B+ in Web2 assets now have liquidity"**
2. **"Sub-second finality enables real-time trading"**
3. **"Fractional ownership democratizes premium assets"**
4. **"Move language provides formal verification security"**
5. **"2.5% fees generate sustainable revenue"**

### 🔥 Demo Highlights
1. **Live tokenization in under 30 seconds**
2. **Professional trading interface**
3. **Multiple user personas interacting**
4. **Real-time price discovery**
5. **Institutional-grade execution**

### 💡 Technical Differentiators
1. **Aptos Objects for native composability**
2. **DNS verification for legitimacy**
3. **AI-powered multi-factor valuation**
4. **Modular smart contract architecture**
5. **Gas-optimized operations**

### 🚀 Future Vision
1. **Cross-chain expansion (Ethereum, Solana)**
2. **Social media handle tokenization**
3. **DeFi integration (lending, derivatives)**
4. **Enterprise API for domain management**
5. **Institutional custody solutions**

## Success Metrics

### ✅ Technical Success
- [ ] All demo steps execute without errors
- [ ] Transactions confirm in <2 seconds
- [ ] Frontend responsive and professional
- [ ] No visible bugs or glitches

### ✅ Presentation Success
- [ ] Clear narrative flow maintained
- [ ] All key points covered
- [ ] Audience engaged and asking questions
- [ ] Time management on target

### ✅ Business Success
- [ ] Value proposition clearly communicated
- [ ] Revenue model understood
- [ ] Market opportunity sized
- [ ] Competitive advantages highlighted

### ✅ Judge Engagement
- [ ] Technical questions indicate understanding
- [ ] Business questions show interest
- [ ] Follow-up requests received
- [ ] Positive feedback given

## Final Reminders

### 🎪 Presentation Tips
- **Speak clearly and confidently**
- **Make eye contact with judges**
- **Use gestures to emphasize points**
- **Stay calm if technical issues occur**
- **Have backup plans ready**

### 🎯 Key Messages
- **"We're tokenizing the $100B domain market"**
- **"Built for institutional-grade trading"**
- **"Powered by Aptos for speed and security"**
- **"Ready for mainnet launch today"**

### 🏆 Winning Attitude
- **Be passionate about the vision**
- **Show deep technical knowledge**
- **Demonstrate business acumen**
- **Express confidence in execution**
- **Invite judges to be part of the journey**

---

**Good luck! You've got this! 🚀**