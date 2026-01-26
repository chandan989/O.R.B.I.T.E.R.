# O.R.B.I.T.E.R. Smart Contracts

Complete Clarity smart contract implementation for the O.R.B.I.T.E.R. platform on Stacks blockchain.

## 📦 Contract Modules

### 1. **domain-registry.clar**
Core domain tokenization logic.

**Key Functions:**
- `create-domain-object-entry` - Tokenize a new domain
- `transfer-domain` - Transfer domain ownership
- `update-valuation` - Update domain valuation
- `get-domain-info` - Query domain information
- `domain-exists` - Check if domain is registered

**Data Structures:**
- Domain metadata (name, owner, verification hash)
- Valuation data (score, market value, SEO, traffic, etc.)
- Ownership tracking

---

### 2. **fractional.clar**
Fractional ownership and share management.

**Key Functions:**
- `initialize-fractional-ownership` - Create fractional shares
- `transfer-shares` - Transfer shares between holders
- `approve-shares` - Approve share transfers (ERC20-like)
- `transfer-from` - Transfer shares on behalf of owner
- `get-share-balance` - Query share balance
- `enable-trading` / `disable-trading` - Control trading status

**Features:**
- ERC20-like token interface
- Custom ticker symbols (GOOGLE, AMAZON, etc.)
- Trading enable/disable controls
- Allowance system for marketplace integration

---

### 3. **marketplace.clar**
Trading infrastructure and order matching.

**Key Functions:**
- `create-listing-entry` - Create a sell order
- `buy-shares-entry` - Purchase shares from listing
- `cancel-listing` - Cancel an active listing
- `update-listing-price` - Update listing price
- `get-marketplace-stats` - Query platform statistics

**Features:**
- Order book management
- 0.3% trading fee (30 basis points)
- Trade history tracking
- Volume and statistics tracking
- Pause/unpause functionality

---

### 4. **valuation.clar**
AI-powered domain valuation with oracle consensus.

**Key Functions:**
- `set-initial-valuation` - Set initial domain valuation
- `propose-valuation-update` - Oracle proposes new valuation
- `vote-on-valuation` - Oracle votes on proposal
- `calculate-composite-score` - Calculate weighted score
- `add-oracle` / `remove-oracle` - Manage authorized oracles

**Features:**
- Multi-oracle consensus mechanism
- Weighted scoring algorithm (30% market, 25% SEO, 20% traffic, 15% brand, 10% TLD)
- Proposal and voting system
- Automatic execution on consensus

---

### 5. **security.clar**
Access control and safety mechanisms.

**Key Functions:**
- `acquire-lock` / `release-lock` - Reentrancy protection
- `verify-admin` / `verify-owner` - Access control
- `emergency-pause` / `emergency-unpause` - Emergency controls
- `add-admin` / `remove-admin` - Admin management
- `set-function-permission` - Function-level permissions

**Features:**
- Reentrancy protection
- Role-based access control
- Emergency pause mechanism
- Function-level permission management
- Multi-admin support

---

### 6. **validation.clar**
Input validation and business logic constraints.

**Key Functions:**
- `validate-domain-creation` - Comprehensive domain validation
- `validate-listing-creation` - Listing validation
- `validate-share-transfer` - Transfer validation
- `assert-valid-*` - Individual validation functions
- `get-validation-constraints` - Get all constraints

**Features:**
- Domain name validation (3-256 characters)
- Price range validation (1 - 1 trillion micro-STX)
- Share amount validation
- Score validation (0-100)
- Ticker validation (2-10 characters)

---

## 🚀 Deployment

### Prerequisites
```bash
# Install Clarinet
curl -L https://github.com/hirosystems/clarinet/releases/download/v1.7.0/clarinet-linux-x64.tar.gz | tar xz
sudo mv clarinet /usr/local/bin/

# Verify installation
clarinet --version
```

### Local Development
```bash
# Check contracts
clarinet check

# Run tests
clarinet test

# Start local devnet
clarinet integrate
```

### Testnet Deployment
```bash
# Deploy to testnet
clarinet deploy --testnet

# Or deploy individually
stacks deploy domain-registry.clar --testnet
stacks deploy fractional.clar --testnet
stacks deploy marketplace.clar --testnet
stacks deploy valuation.clar --testnet
stacks deploy security.clar --testnet
stacks deploy validation.clar --testnet
```

---

## 📊 Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Stacks Blockchain Layer                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   domain-    │  │  fractional  │  │ marketplace  │  │
│  │   registry   │◄─┤              │◄─┤              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ▲                 ▲                  ▲          │
│         │                 │                  │          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  valuation   │  │   security   │  │  validation  │  │
│  │              │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### Reentrancy Protection
```clarity
;; Acquire lock before sensitive operations
(try! (contract-call? .security acquire-lock "marketplace"))
;; ... perform operation ...
(try! (contract-call? .security release-lock "marketplace"))
```

### Access Control
```clarity
;; Only admin can perform action
(try! (contract-call? .security verify-admin tx-sender))
```

### Emergency Pause
```clarity
;; Pause all operations
(try! (contract-call? .security emergency-pause))
```

---

## 📝 Usage Examples

### Create a Tokenized Domain
```clarity
(contract-call? .domain-registry create-domain-object-entry
  "blockchain.com"           ;; domain name
  "0xabc123..."             ;; verification hash
  u95                       ;; valuation score
  u45000000                 ;; market value
  u90                       ;; SEO authority
  u500000                   ;; traffic estimate
  u95                       ;; brandability
  u85                       ;; TLD rarity
  true                      ;; has fractional
  "BLKC"                    ;; ticker
  u1000000                  ;; total supply
  u1000000                  ;; circulating supply
  true                      ;; trading enabled
)
```

### Create a Listing
```clarity
(contract-call? .marketplace create-listing-entry
  u1                        ;; domain ID
  u100                      ;; price per share (micro-STX)
  u10000                    ;; shares to sell
)
```

### Buy Shares
```clarity
(contract-call? .marketplace buy-shares-entry
  u1                        ;; listing ID
  u100                      ;; shares to buy
)
```

---

## 🧪 Testing

### Unit Tests
Create test files in `tests/` directory:

```clarity
;; tests/domain-registry_test.clar
(define-public (test-create-domain)
  (let
    (
      (result (contract-call? .domain-registry create-domain-object-entry
        "test.com" "hash123" u80 u1000000 u70 u10000 u85 u75
        false "" u0 u0 false
      ))
    )
    (asserts! (is-ok result) (err u1))
    (ok true)
  )
)
```

### Run Tests
```bash
clarinet test
```

---

## 📈 Gas Optimization

All contracts are optimized for:
- Minimal storage reads/writes
- Efficient data structures
- Batched operations where possible
- Read-only functions for queries

---

## 🔗 Contract Interactions

### Inter-Contract Calls
Contracts interact with each other using `contract-call?`:

```clarity
;; domain-registry calls fractional
(contract-call? .fractional initialize-fractional-ownership ...)

;; marketplace calls fractional
(contract-call? .fractional transfer-from ...)

;; valuation calls domain-registry
(contract-call? .domain-registry update-valuation ...)
```

---

## 📚 Additional Resources

- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Clarinet Documentation](https://github.com/hirosystems/clarinet)
- [Stacks Blockchain](https://www.stacks.co/)
- [O.R.B.I.T.E.R. Architecture](../ARCHITECTURE.md)

---

## 🏆 Built for Stacks Ctrl+MOVE Hackathon 2025

Complete production-ready smart contract suite for domain tokenization and DeFi trading on Stacks blockchain.

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.
