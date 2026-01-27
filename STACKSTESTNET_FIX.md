# 🔧 Fix for "StacksTestnet is not defined" Error

## ✅ Changes Made

The import has been added to `orbiter-web/src/hooks/useContract.ts`:

```typescript
import { StacksTestnet } from '@stacks/network';
```

And it's being used on line 79:
```typescript
network: new StacksTestnet(),
```

## 🚀 How to Fix

### Option 1: Restart Dev Server (Recommended)
```bash
cd orbiter-web
# Stop the current server (Ctrl+C)
npm run dev
```

### Option 2: Hard Refresh Browser
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Clear Build Cache
```bash
cd orbiter-web
rm -rf node_modules/.vite
npm run dev
```

## 📝 Verify the Fix

After restarting, check the browser console. You should NOT see:
- ❌ "StacksTestnet is not defined"

You should see the wallet popup when clicking tokenize.

## ⚠️ Still Need to Fix Contract Arguments

Even after this fix, you'll need to update `contractService.ts` to pass all 6 required parameters.

See `CONTRACT_FIX.txt` for details.

## 🐛 If Still Not Working

Check that `@stacks/network` is installed:
```bash
cd orbiter-web
npm list @stacks/network
```

Should show: `@stacks/network@7.3.1`

If not installed:
```bash
npm install @stacks/network@^7.3.1
```
