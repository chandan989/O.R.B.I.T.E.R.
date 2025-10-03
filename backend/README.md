# O.R.B.I.T.E.R. Backend

This backend submits REAL transactions to Aptos blockchain using your private key.

## Setup

1. Dependencies are already installed
2. `.env` file is configured with your private key

## Start the Backend

### Option 1: Using npm
```bash
cd backend
npm start
```

### Option 2: Using the batch file
```bash
cd backend
start.bat
```

### Option 3: Direct node
```bash
cd backend
node server.js
```

## What it does

- Listens on `http://localhost:3001`
- Accepts domain creation requests from frontend
- Submits REAL transactions to Aptos testnet
- Returns transaction hash and explorer link

## Test it

Once running, visit: http://localhost:3001/api/health

You should see:
```json
{
  "status": "ok",
  "account": "0x2a259fea4483e1ce69d3230ef3dbc2a7eb00a262938f2885bc630c442eb2ff7c",
  "network": "testnet"
}
```

## Usage

The frontend will automatically use this backend when you click "Launch" on a domain.

You'll see REAL transaction hashes that you can verify on Aptos Explorer!
