# 🚀 Deploying O.R.B.I.T.E.R. Contracts to Stacks Testnet

## 📋 Deployment Plan Generated

**Deployer Address:** `ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7`

### Contracts to Deploy:
1. ✅ domain-registry (75.9M µSTX)
2. ✅ fractional (76.0M µSTX)
3. ✅ marketplace (76.1M µSTX)
4. ✅ security (75.9M µSTX)
5. ✅ validation (76.0M µSTX)
6. ✅ valuation (76.1M µSTX)

**Total Cost:** ~455 STX (testnet)

---

## 🎯 Next Steps

### 1. Get Testnet STX

Visit the Stacks testnet faucet:
```
https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

Enter your deployer address:
```
ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7
```

Request **500 STX** (faucet gives 500 STX per request)

### 2. Verify Balance

Check your balance:
```
https://explorer.hiro.so/address/ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7?chain=testnet
```

### 3. Deploy Contracts

Once you have STX, run:
```bash
cd /Users/nikhilsharma/Downloads/hacks/O.R.B.I.T.E.R.
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

This will:
- Deploy all 6 contracts
- Take ~10-15 minutes
- Return contract addresses

### 4. Update Frontend

After deployment, update:

**File:** `orbiter-web/src/config/contracts.ts`
```typescript
const FALLBACK_CONTRACT = "ST1167QYEXGAFNB1H94QZGDMNAPAD4ZNKVCFY9K7";
```

**File:** `orbiter-web/src/config/demoMode.ts`
```typescript
export const DEMO_MODE = false; // Switch to real mode
```

---

## ⚠️ Important Notes

1. **Testnet STX is free** - Get it from the faucet
2. **Deployment is permanent** - Contracts can't be deleted
3. **Takes 10-15 minutes** - Wait for all blocks to confirm
4. **Save contract addresses** - You'll need them for the frontend

---

## 🎬 Alternative: Keep Demo Mode

If you want to record your video NOW without waiting for deployment:

1. Keep `DEMO_MODE = true`
2. Record your demo video
3. Deploy contracts later
4. Switch to `DEMO_MODE = false` for production

**Demo mode works perfectly for hackathon submission!**

---

## 📝 Deployment Command

When ready:
```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

Or if you want to see what will happen first:
```bash
clarinet deployments apply -p deployments/default.testnet-plan.yaml --dry-run
```
