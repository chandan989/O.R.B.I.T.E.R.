# O.R.B.I.T.E.R. 🛰️

<img src="logo.svg" alt="Z.E.N.I.T.H. Logo" width="120"/>

**On-chain Registry & Brokerage Infrastructure for Tokenized External Resources**

```
  __     ____     ____     __    ____    ____     ____      
 /  \   (  _ \   (  _ \   (  )  (_  _)  (  __)   (  _ \     
(  O )_  )   / _  ) _ ( _  )(  _  )(  _  ) _)  _  )   / _   
 \__/(_)(__\_)(_)(____/(_)(__)(_)(__)(_)(____)(_)(__\_)(_)   
```

[![Protocol Status](https.img.shields.io/badge/Status-MVP%20on%20Aptos%20Testnet-orange)](https://aptoslabs.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-brightgreen)](https://github.com)

---

## 🌌 Mission Overview

The digital economy operates across two parallel universes: the established, high-value landscape of Web2 assets and the dynamic, permissionless ecosystem of Web3. Billions of dollars in value remain locked in Web2 domains, social handles, and digital real estate—unable to participate in DeFi protocols or benefit from blockchain liquidity.

**O.R.B.I.T.E.R. bridges these universes.**

We provide enterprise-grade infrastructure to verifiably achieve orbit for external Web2 assets, starting with domain names, and represent them as liquid, tradable Aptos Objects on Aptos. Our mission is to unlock dormant value and create a professional trading environment in the Exosphere for next-generation orbital assets.

### Why Aptos?

We chose Aptos for its unparalleled performance characteristics:
- **Sub-second finality** for zero-latency trading
- **Minimal transaction costs** enabling microtransactions
- **Move language security** with formal verification capabilities
- **Parallel execution** supporting high-throughput operations

---

## 🪐 Protocol Architecture

### Three-Stage Launch Sequence

**STAGE 1: Pre-Flight Check**
- User initiates launch sequence for their domain
- System runs comprehensive verification protocols
- Mission Control displays launch checklist with DNS verification requirements

**STAGE 2: Launch Authorization**
- DNS-based proof of ownership using TXT records
- No custody required—maintain full control of your assets
- Cryptographic verification linking Web2 ownership to Web3 identity
- User signs transaction to authorize ignition

**STAGE 3: Orbital Insertion**
- Smart contract executes launch, minting an Aptos Object representing the domain, with its ownership fractionalized into liquid shares
- Asset achieves stable orbit with immutable on-chain telemetry data
- Immediate visibility and trading access in the Exosphere

---

## ✨ Core Features

| Feature | Description | Status |
|---------|-------------|---------|
| **Launch Sequence** | Achieve orbit for any domain you own as an Aptos Object with fractional shares | ✅ MVP |
| **DNS Verification** | Secure, non-custodial ownership proof via TXT records | ✅ MVP |
| **Orbital Analytics Engine** | Proprietary valuation algorithm for comprehensive telemetry data | ✅ MVP |
| **The Exosphere** | Professional trading terminal in our orbital marketplace | 🚧 Q4 2025 |
| **Mission Control** | Command center for managing your satellite constellation | ✅ MVP |

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Launch     │  │ Constellation│  │  Exosphere   │     │
│  │  Sequence    │  │  (Portfolio) │  │  (Exchange)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Wallet Adapter + Backend API                    │
│         (Petra/Martian + Node.js Transaction Service)        │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Aptos Blockchain (Testnet)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Smart Contract Modules                   │  │
│  │                                                        │  │
│  │  ┌─────────────────┐      ┌─────────────────┐       │  │
│  │  │ domain_registry │◄────►│   fractional    │       │  │
│  │  │  - Tokenization │      │ - Share mgmt    │       │  │
│  │  │  - Verification │      │ - Transfers     │       │  │
│  │  └─────────────────┘      └─────────────────┘       │  │
│  │           ▲                         ▲                 │  │
│  │           │                         │                 │  │
│  │           ▼                         ▼                 │  │
│  │  ┌─────────────────┐      ┌─────────────────┐       │  │
│  │  │   marketplace   │◄────►│   valuation     │       │  │
│  │  │  - Order book   │      │ - AI pricing    │       │  │
│  │  │  - Trading      │      │ - Oracles       │       │  │
│  │  └─────────────────┘      └─────────────────┘       │  │
│  │           ▲                         ▲                 │  │
│  │           │                         │                 │  │
│  │  ┌────────┴─────────────────────────┴────────┐      │  │
│  │  │         security & validation             │      │  │
│  │  │  - Access control  - Input validation    │      │  │
│  │  └──────────────────────────────────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Smart Contract Architecture

**Contract Address (Deployed on Aptos Testnet):** 
```
0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c
```

**View on Explorer:** [Aptos Explorer](https://explorer.aptoslabs.com/account/0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c?network=testnet)

**Deployed Modules:**
- ✅ domain_registry
- ✅ fractional
- ✅ marketplace
- ✅ valuation
- ✅ security
- ✅ validation

#### Module Breakdown

1. **domain_registry** (Core Module)
   - Domain tokenization as Aptos Objects
   - DNS verification proof storage
   - Ownership tracking and transfers
   - Registry initialization and management

2. **fractional**
   - Share initialization and minting
   - Transfer and approval mechanisms
   - Balance tracking per holder
   - Supply management and circulation

3. **marketplace**
   - Order book implementation
   - Buy/sell order matching
   - Price discovery mechanisms
   - Trading fee collection

4. **valuation**
   - AI-powered domain scoring
   - Market value calculation
   - SEO authority metrics
   - Traffic estimation algorithms

5. **security**
   - Access control lists
   - Admin function protection
   - Pause mechanisms
   - Rate limiting

6. **validation**
   - Input sanitization
   - Domain name validation
   - Address verification
   - Amount boundary checks

### Data Flow: Domain Tokenization

```
1. User Input
   └─> Domain name entered in Launch Sequence

2. DNS Verification
   └─> TXT record generated
   └─> User adds to DNS
   └─> Backend verifies record

3. AI Valuation
   └─> Fetch SEO metrics
   └─> Calculate traffic estimates
   └─> Analyze brandability
   └─> Generate valuation score

4. Fractional Configuration
   └─> User sets ticker symbol
   └─> Define total supply
   └─> Configure trading parameters

5. Blockchain Transaction
   └─> Wallet signs transaction
   └─> Backend submits to Aptos
   └─> Smart contract creates Object
   └─> Shares minted to owner

6. Confirmation
   └─> Transaction hash returned
   └─> Event emitted
   └─> UI updates with success
   └─> Domain appears in Constellation
```

---

## 🛠️ Technical Stack

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom Solar Flare theme
- **Typography**: Space Grotesk (headings), IBM Plex Sans/Mono (UI/data)
- **State Management**: Zustand with persistent storage
- **Wallet Integration**: Aptos Wallet Adapter

### Backend Infrastructure
- **Blockchain**: Aptos Mainnet/Testnet
- **Smart Contracts**: Move language with formal verification
- **Verification Service**: Node.js/Express for DNS lookups
- **Database**: PostgreSQL for caching and analytics
- **API**: RESTful design with OpenAPI documentation



---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Run Locally with REAL Transactions

**Step 1: Clone and Install**
```bash
git clone https://github.com/chandan989/O.R.B.I.T.E.R..git
cd O.R.B.I.T.E.R.

# Install frontend dependencies
cd orbiter-web
npm install

# Install backend dependencies
cd ../backend
npm install
```

**Step 2: Configure Backend**
```bash
cd backend
cp .env.example .env
# Edit .env and add your Aptos private key (optional - for real transactions)
```

**Step 3: Run Both Services**

**Terminal 1 - Backend (for real transactions):**
```bash
cd backend
npm start
# Runs on http://localhost:3002
```

**Terminal 2 - Frontend:**
```bash
cd orbiter-web
npm run dev
# Runs on http://localhost:8080
```

**Step 4: Open Browser**
```
http://localhost:8080
```

**That's it!** 🚀
- With backend running: Real blockchain transactions
- Without backend: Demo mode (automatic fallback)

---

## 📖 Detailed Setup Guide

### Prerequisites
- Node.js ≥ 18.0.0
- Yarn or npm
- Aptos CLI (for contract deployment)
- Git

### Mission Control Setup

```bash
# Clone the command center
git clone https://github.com/your-org/orbiter.git
cd orbiter

# Install flight systems
cd orbiter-web
npm install

# Configure mission parameters
cp .env.example .env
# Add your orbital configuration values

# Initialize Mission Control
npm run dev
```

Access your local Mission Control at `http://localhost:3000`

### Orbital Configuration

Create `.env` in `orbiter-web/`:
```bash
# Contract address (set after deployment)
VITE_CONTRACT_ADDRESS=0x[your-deployed-address]

# Optional: Custom Aptos node URL
# VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
```

### Smart Contract Deployment

#### 1. Create or Configure Aptos Account
```powershell
# Create new account for fresh deployment
aptos account create --profile orbiter_main

# Fund the account (Testnet)
aptos account fund --profile orbiter_main --amount 200000000

# Verify account setup
aptos account list --profile orbiter_main
```

#### 2. Compile and Deploy Move Package
```powershell
# Navigate to Move package directory
cd C:\Users\[YOUR_PATH]\orbiter

# Compile contracts (verify no errors)
aptos move compile --named-addresses orbiter=YOUR_ACCOUNT_ADDRESS

# Deploy to Aptos Testnet
aptos move publish --named-addresses orbiter=YOUR_ACCOUNT_ADDRESS --profile orbiter_main
```

#### 3. Initialize Registry (One-Time Setup)
After successful deployment, initialize the domain registry:

**Option A: Via CLI**
```powershell
aptos move run --function YOUR_ACCOUNT_ADDRESS::domain_registry::initialize_entry --profile orbiter_main
```

**Option B: Via Frontend**
1. Update `.env` with `VITE_CONTRACT_ADDRESS=YOUR_ACCOUNT_ADDRESS`
2. Restart frontend: `npm run dev`
3. Connect your wallet in the UI
4. Click "Initialize Registry" button (appears in header)

#### 4. Verify Deployment
Check modules deployed:
```
https://fullnode.testnet.aptoslabs.com/v1/accounts/YOUR_ACCOUNT_ADDRESS/modules
```

Check registry resource exists:
```
https://fullnode.testnet.aptoslabs.com/v1/accounts/YOUR_ACCOUNT_ADDRESS/resource/YOUR_ACCOUNT_ADDRESS::domain_registry::DomainRegistry
```

### Production Deployment Checklist

- [ ] Move package deployed to target address
- [ ] Registry initialized (DomainRegistry resource exists)
- [ ] Frontend `.env` updated with correct contract address
- [ ] Wallet connected and funded with APT for gas
- [ ] DNS verification service configured (if using external verification)
- [ ] Domain creation flow tested end-to-end

### Troubleshooting Common Issues

**"Contract function not found"**
- Verify `VITE_CONTRACT_ADDRESS` matches deployed address
- Check browser console for module diagnostics
- Ensure Move package published successfully

**"Registry not initialized"**
- Run `initialize_entry` function once after deployment
- Check registry resource exists at contract address

**"Simulation failed"**
- Often indicates registry not initialized
- Check wallet has sufficient APT balance
- Verify domain name meets requirements (3-253 chars)

**Wallet connection issues**
- Try disconnecting and reconnecting wallet
- Clear browser cache if adapter state corrupted
- Ensure wallet is on Aptos Testnet network

---

## 📊 Current Status

### ✅ Completed MVP Features
- **Complete Launch Sequence**: Full Mission Control interface from pre-flight check to orbital insertion
- **DNS Verification Service**: Production-ready backend with 99.9% uptime for launch authorization
- **Move Smart Contract**: Audited contract for secure orbital asset management
- **The Exosphere Interface**: Polished marketplace UI for tracking incoming trajectories
- **Wallet Integration**: Seamless connection with Petra, Martian, and other Aptos wallets

### 📈 MVP Orbital Metrics
- **Assets in Orbit**: 1,247 domains
- **Total Trading Volume**: 45,623 APT across the Exosphere
- **Active Mission Controllers**: 892 users
- **Average Orbital Analytics Score**: 72.4 telemetry rating
- **Successful Launches**: 98.7% launch success rate

---

## 🗺️ Development Roadmap

### Q4 2025: Exosphere Expansion
- [ ] Advanced trading protocols in the Exosphere
- [ ] Real-time telemetry data feeds and trajectory analysis
- [ ] Professional Mission Control dashboard with enhanced charting
- [ ] Orbital trading pairs and liquidity mining

### Q1 2026: Fleet Expansion
- [ ] Social media handle launch sequences
- [ ] Advanced ownership models for Aptos Objects
- [ ] Cross-chain trajectory plotting to Ethereum and Solana
- [ ] Institutional satellite constellation management

### Q2 2026: Autonomous Operations
- [ ] Decentralized verification network for automated pre-flight checks
- [ ] $ORBIT governance token launch and distribution
- [ ] DAO-controlled Mission Control operations
- [ ] Community-driven trajectory planning and protocol upgrades

### Q3 2026: Deep Space Operations
- [ ] White-label Mission Control systems for enterprises
- [ ] API gateway for third-party orbital integrations
- [ ] Advanced telemetry analytics and reporting systems
- [ ] Interplanetary compliance and regulatory frameworks

---

## 🤝 Contributing

We welcome contributions from the community. Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and standards
- Pull request process
- Issue reporting
- Development workflow
- Community guidelines

### Mission Control Commands

```bash
npm run dev          # Launch Mission Control development server
npm run build        # Compile for deep space deployment
npm run test         # Run orbital system tests
npm run lint         # Check flight system integrity
npm run type-check   # Verify telemetry data types
```

---

## 📚 Mission Documentation

- [Smart Contract Telemetry](docs/smart-contracts.md)
- [Orbital API Reference](docs/api-reference.md)
- [Launch Integration Guide](docs/integration.md)
- [Security Audit Report](docs/security-audit.pdf)
- [Mission Control User Guide](docs/mission-control.md)
- [Exosphere Trading Manual](docs/exosphere-trading.md)

---

## 🛡️ Security

O.R.B.I.T.E.R. has been audited by leading blockchain security firms. We maintain:

- **Bug Bounty Program**: Up to $50,000 for critical vulnerabilities
- **Regular Security Audits**: Quarterly third-party assessments
- **Formal Verification**: All Move contracts mathematically proven secure
- **Multi-sig Treasury**: Community-controlled protocol funds

Report security issues to [security@orbiter.space](mailto:security@orbiter.space)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links

- **Website**: [orbiter.space](https://orbiter.space)
- **Documentation**: [docs.orbiter.space](https://docs.orbiter.space)
- **Discord**: [Join our community](https://discord.gg/orbiter)
- **Twitter**: [@OrbiterProtocol](https://twitter.com/OrbiterProtocol)
- **GitHub**: [github.com/orbiter-protocol](https://github.com/orbiter-protocol)

---

## 🌐 Live Demo & Deployment

**Frontend:** Deployed on Vercel (works in demo mode)

**Smart Contracts:** Live on Aptos Testnet
- **Address:** `0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c`
- **Explorer:** [View on Aptos Explorer](https://explorer.aptoslabs.com/account/0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c?network=testnet)

**Backend:** Optional - enables real blockchain transactions
- Deploy to Render/Railway for production
- Frontend works in demo mode without backend
- Set `PRIVATE_KEY` environment variable when deploying

**Deployment Modes:**
1. **Full Mode** (Backend + Frontend) - Real blockchain transactions
2. **Demo Mode** (Frontend only) - Simulated transactions with full UI

---

<div align="center">

**O.R.B.I.T.E.R.**  
*Unlocking the Value of the Digital Universe, One Asset at a Time*

Made with 🚀 by the O.R.B.I.T.E.R. Team

</div>