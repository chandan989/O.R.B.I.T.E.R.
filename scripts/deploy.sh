#!/bin/bash

# ORBITER Smart Contract Deployment Script for Aptos Testnet
# This script deploys all ORBITER contracts to Aptos testnet

set -e

echo "🚀 Starting ORBITER Smart Contract Deployment..."

# Configuration
NETWORK="testnet"
PROFILE_NAME="default"
PACKAGE_DIR="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    print_error "Aptos CLI is not installed. Please install it first."
    print_status "Visit: https://aptos.dev/tools/aptos-cli/install-cli/"
    exit 1
fi

# Check if profile exists
if ! aptos config show-profiles | grep -q "$PROFILE_NAME"; then
    print_error "Profile '$PROFILE_NAME' not found."
    print_status "Please run: aptos init --profile $PROFILE_NAME --network $NETWORK"
    exit 1
fi

# Get account address
ACCOUNT_ADDRESS=$(aptos config show-profiles --profile=$PROFILE_NAME | grep "account" | awk '{print $2}')
print_status "Deploying with account: $ACCOUNT_ADDRESS"

# Check account balance
BALANCE=$(aptos account lookup-address --profile=$PROFILE_NAME --address=$ACCOUNT_ADDRESS | grep "Balance" | awk '{print $2}' || echo "0")
print_status "Account balance: $BALANCE APT"

if [ "$BALANCE" -lt 100000000 ]; then  # 1 APT = 100000000 octas
    print_warning "Low balance detected. You may need to fund your account."
    print_status "Get testnet tokens: https://aptoslabs.com/testnet-faucet"
fi

# Compile the package
print_status "Compiling Move package..."
if ! aptos move compile --profile=$PROFILE_NAME --package-dir=$PACKAGE_DIR; then
    print_error "Compilation failed!"
    exit 1
fi
print_success "Package compiled successfully"

# Publish the package
print_status "Publishing package to $NETWORK..."
PUBLISH_OUTPUT=$(aptos move publish --profile=$PROFILE_NAME --package-dir=$PACKAGE_DIR --assume-yes)

if [ $? -eq 0 ]; then
    print_success "Package published successfully!"
    echo "$PUBLISH_OUTPUT"
    
    # Extract package address from output
    PACKAGE_ADDRESS=$(echo "$PUBLISH_OUTPUT" | grep -o "0x[a-fA-F0-9]\{64\}" | head -1)
    print_status "Package address: $PACKAGE_ADDRESS"
    
    # Save deployment info
    echo "PACKAGE_ADDRESS=$PACKAGE_ADDRESS" > .env.deployment
    echo "ACCOUNT_ADDRESS=$ACCOUNT_ADDRESS" >> .env.deployment
    echo "NETWORK=$NETWORK" >> .env.deployment
    echo "DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .env.deployment
    
    print_success "Deployment info saved to .env.deployment"
else
    print_error "Package publication failed!"
    exit 1
fi

# Run initialization script
print_status "Initializing contracts..."
if aptos move run-script --profile=$PROFILE_NAME --script-path=scripts/deploy_contracts.move --assume-yes; then
    print_success "Contracts initialized successfully!"
else
    print_error "Contract initialization failed!"
    exit 1
fi

print_success "🎉 ORBITER deployment completed successfully!"
print_status "Package Address: $PACKAGE_ADDRESS"
print_status "Network: $NETWORK"
print_status "Account: $ACCOUNT_ADDRESS"

echo ""
print_status "Next steps:"
echo "1. Run demo data setup: ./scripts/setup_demo.sh"
echo "2. Verify deployment: ./scripts/verify_deployment.sh"
echo "3. Update frontend configuration with package address"