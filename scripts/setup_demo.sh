#!/bin/bash

# ORBITER Demo Data Setup Script
# This script sets up demo data for hackathon presentation

set -e

echo "🎭 Setting up ORBITER demo data..."

# Configuration
NETWORK="testnet"
PROFILE_NAME="default"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if deployment info exists
if [ ! -f ".env.deployment" ]; then
    print_error "Deployment info not found. Please run ./scripts/deploy.sh first."
    exit 1
fi

# Load deployment info
source .env.deployment

print_status "Setting up demo data on $NETWORK"
print_status "Using package: $PACKAGE_ADDRESS"

# Run demo data setup script
print_status "Creating demo domains and listings..."
if aptos move run-script --profile=$PROFILE_NAME --script-path=scripts/setup_demo_data.move --assume-yes; then
    print_success "Demo data created successfully!"
else
    print_error "Demo data setup failed!"
    exit 1
fi

# Create additional demo accounts if needed
print_status "Creating additional demo accounts..."

# Create buyer account
BUYER_PROFILE="demo_buyer"
if ! aptos config show-profiles | grep -q "$BUYER_PROFILE"; then
    aptos init --profile $BUYER_PROFILE --network $NETWORK --assume-yes
    BUYER_ADDRESS=$(aptos config show-profiles --profile=$BUYER_PROFILE | grep "account" | awk '{print $2}')
    print_status "Created buyer account: $BUYER_ADDRESS"
    
    # Fund buyer account
    print_status "Funding buyer account..."
    aptos account fund-with-faucet --profile=$BUYER_PROFILE --amount=1000000000
fi

# Create seller account
SELLER_PROFILE="demo_seller"
if ! aptos config show-profiles | grep -q "$SELLER_PROFILE"; then
    aptos init --profile $SELLER_PROFILE --network $NETWORK --assume-yes
    SELLER_ADDRESS=$(aptos config show-profiles --profile=$SELLER_PROFILE | grep "account" | awk '{print $2}')
    print_status "Created seller account: $SELLER_ADDRESS"
    
    # Fund seller account
    print_status "Funding seller account..."
    aptos account fund-with-faucet --profile=$SELLER_PROFILE --amount=1000000000
fi

# Save demo account info
echo "BUYER_ADDRESS=$BUYER_ADDRESS" >> .env.deployment
echo "SELLER_ADDRESS=$SELLER_ADDRESS" >> .env.deployment

print_success "🎉 Demo data setup completed!"
print_status "Demo accounts created and funded"
print_status "Sample domains: google.com, apple.com"
print_status "Sample listings created for both domains"

echo ""
print_status "Demo accounts:"
echo "  Main: $ACCOUNT_ADDRESS"
echo "  Buyer: $BUYER_ADDRESS"
echo "  Seller: $SELLER_ADDRESS"