import express from 'express';
import cors from 'cors';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

const app = express();
app.use(cors());
app.use(express.json());

// Aptos setup
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Demo account - you can replace with your own private key or generate new one
const DEMO_PRIVATE_KEY = "0x37368b46ce665362562c6d1d4ec01a08c8644c488690df5a17e13ba163e20221";
const CONTRACT_ADDRESS = "0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c";

let demoAccount;
try {
  const privateKey = new Ed25519PrivateKey(DEMO_PRIVATE_KEY);
  demoAccount = Account.fromPrivateKey({ privateKey });
  console.log('Demo account address:', demoAccount.accountAddress.toString());
} catch (e) {
  console.error('Error setting up demo account:', e);
}

// Initialize registry endpoint
app.post('/api/initialize-registry', async (req, res) => {
  try {
    if (!demoAccount) {
      return res.status(500).json({ error: 'Demo account not configured' });
    }

    const transaction = await aptos.transaction.build.simple({
      sender: demoAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::domain_registry::initialize_entry`,
        typeArguments: [],
        functionArguments: []
      }
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: demoAccount,
      transaction
    });

    await aptos.waitForTransaction({ transactionHash: response.hash });

    res.json({ 
      success: true, 
      hash: response.hash,
      message: 'Registry initialized successfully!'
    });
  } catch (error) {
    console.error('Initialize error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

// Create domain endpoint
app.post('/api/create-domain', async (req, res) => {
  try {
    if (!demoAccount) {
      return res.status(500).json({ error: 'Demo account not configured' });
    }

    const { domainName } = req.body;
    if (!domainName) {
      return res.status(400).json({ error: 'Domain name required' });
    }

    // Mock valuation data
    const args = [
      domainName,                    // domain_name
      `verification_${Date.now()}`,  // verification_hash
      "85",                         // score
      "1000000",                    // market_value (in octas)
      "75",                         // seo_authority
      "60",                         // traffic_estimate
      "90",                         // brandability
      "80",                         // tld_rarity
      false,                        // enable_fractional
      "DEMO",                       // ticker (unused when fractional=false)
      "1000000",                    // total_supply (unused)
      "1000000",                    // circulating_supply (unused)
      false                         // trading_enabled (unused)
    ];

    const transaction = await aptos.transaction.build.simple({
      sender: demoAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::domain_registry::create_domain_object_entry`,
        typeArguments: [],
        functionArguments: args
      }
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: demoAccount,
      transaction
    });

    await aptos.waitForTransaction({ transactionHash: response.hash });

    res.json({ 
      success: true, 
      hash: response.hash,
      message: `Domain ${domainName} created successfully!`,
      explorerUrl: `https://explorer.aptoslabs.com/txn/${response.hash}?network=testnet`
    });
  } catch (error) {
    console.error('Create domain error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
});

// Get account info
app.get('/api/account-info', async (req, res) => {
  try {
    if (!demoAccount) {
      return res.status(500).json({ error: 'Demo account not configured' });
    }

    const balance = await aptos.getAccountAPTAmount({
      accountAddress: demoAccount.accountAddress
    });

    res.json({
      address: demoAccount.accountAddress.toString(),
      balance: balance.toString(),
      balanceAPT: (balance / 100000000).toFixed(4)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Contract: ${CONTRACT_ADDRESS}`);
  if (demoAccount) {
    console.log(`💼 Demo account: ${demoAccount.accountAddress.toString()}`);
  }
});