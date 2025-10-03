require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Your account private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY not found in .env file!");
  process.exit(1);
}

// Create account from private key
let account;
try {
  // Ensure private key has 0x prefix
  const keyWithPrefix = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;
  const privateKey = new Ed25519PrivateKey(keyWithPrefix);
  account = Account.fromPrivateKey({ privateKey });
  console.log("✅ Account loaded:", account.accountAddress.toString());
} catch (error) {
  console.error("❌ Failed to load account:", error.message);
  console.error("Private key format:", PRIVATE_KEY?.substring(0, 10) + "...");
  process.exit(1);
}

// Submit domain creation transaction
app.post('/api/create-domain', async (req, res) => {
  try {
    const { domainName, verificationHash, valuation, fractionalConfig } = req.body;

    console.log("📡 Creating domain:", domainName);

    // Build transaction
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: "0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c::domain_registry::create_domain_object_entry",
        typeArguments: [],
        functionArguments: [
          domainName,
          verificationHash,
          valuation.score.toString(),
          valuation.market_value.toString(),
          valuation.seo_authority.toString(),
          valuation.traffic_estimate.toString(),
          valuation.brandability.toString(),
          valuation.tld_rarity.toString(),
          !!fractionalConfig,
          fractionalConfig?.ticker || "",
          fractionalConfig?.total_supply?.toString() || "0",
          fractionalConfig?.circulating_supply?.toString() || "0",
          fractionalConfig?.trading_enabled || false
        ]
      }
    });

    // Sign and submit
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction
    });

    // Wait for confirmation
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTxn.hash
    });

    console.log("✅ Transaction confirmed:", committedTxn.hash);

    res.json({
      success: true,
      hash: committedTxn.hash,
      sender: account.accountAddress.toString(),
      explorerUrl: `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`
    });

  } catch (error) {
    console.error("❌ Transaction failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    account: account?.accountAddress.toString(),
    network: 'testnet'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Account: ${account?.accountAddress.toString()}`);
});
