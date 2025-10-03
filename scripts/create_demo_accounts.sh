#!/bin/bash

# Create Demo Accounts for Hackathon Presentation
# This script creates and funds multiple demo accounts for realistic trading scenarios

set -e

echo "🎭 Creating demo accounts for hackathon presentation..."

# Configuration
NETWORK="testnet"
FUNDING_AMOUNT=1000000000  # 10 APT in octas

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

# Demo account profiles
declare -a DEMO_ACCOUNTS=(
    "presenter:Platform Admin"
    "whale_investor:Institutional Investor" 
    "retail_trader:Individual Trader"
    "market_maker:Liquidity Provider"
    "day_trader:Active Trader"
)

# Create demo accounts
for account_info in "${DEMO_ACCOUNTS[@]}"; do
    IFS=':' read -r profile_name role <<< "$account_info"
    
    print_status "Creating $role account: $profile_name"
    
    # Check if profile already exists
    if aptos config show-profiles | grep -q "$profile_name"; then
        print_status "Profile $profile_name already exists, skipping creation"
    else
        # Create new profile
        aptos init --profile $profile_name --network $NETWORK --assume-yes
        
        if [ $? -eq 0 ]; then
            print_success "Created profile: $profile_name"
        else
            print_error "Failed to create profile: $profile_name"
            continue
        fi
    fi
    
    # Get account address
    ACCOUNT_ADDRESS=$(aptos config show-profiles --profile=$profile_name | grep "account" | awk '{print $2}')
    print_status "Account address: $ACCOUNT_ADDRESS"
    
    # Fund account
    print_status "Funding $profile_name with 10 APT..."
    if aptos account fund-with-faucet --profile=$profile_name --amount=$FUNDING_AMOUNT; then
        print_success "Funded $profile_name successfully"
    else
        print_error "Failed to fund $profile_name"
    fi
    
    # Get balance to verify
    BALANCE=$(aptos account balance --profile=$profile_name | grep "APT" | awk '{print $2}')
    print_status "Current balance: $BALANCE APT"
    
    echo ""
done

# Save account information for demo scripts
print_status "Saving demo account information..."

cat > .env.demo_accounts << EOF
# Demo Account Information
# Generated on $(date)

PRESENTER_PROFILE=presenter
WHALE_INVESTOR_PROFILE=whale_investor
RETAIL_TRADER_PROFILE=retail_trader
MARKET_MAKER_PROFILE=market_maker
DAY_TRADER_PROFILE=day_trader

# Account Addresses
PRESENTER_ADDRESS=$(aptos config show-profiles --profile=presenter | grep "account" | awk '{print $2}')
WHALE_INVESTOR_ADDRESS=$(aptos config show-profiles --profile=whale_investor | grep "account" | awk '{print $2}')
RETAIL_TRADER_ADDRESS=$(aptos config show-profiles --profile=retail_trader | grep "account" | awk '{print $2}')
MARKET_MAKER_ADDRESS=$(aptos config show-profiles --profile=market_maker | grep "account" | awk '{print $2}')
DAY_TRADER_ADDRESS=$(aptos config show-profiles --profile=day_trader | grep "account" | awk '{print $2}')

# Network Configuration
NETWORK=$NETWORK
FUNDING_AMOUNT=$FUNDING_AMOUNT
EOF

print_success "🎉 Demo accounts created successfully!"
print_status "Account information saved to .env.demo_accounts"

echo ""
print_status "Demo Account Summary:"
echo "  👨‍💼 Presenter (Admin): $(aptos config show-profiles --profile=presenter | grep "account" | awk '{print $2}')"
echo "  🐋 Whale Investor: $(aptos config show-profiles --profile=whale_investor | grep "account" | awk '{print $2}')"
echo "  👤 Retail Trader: $(aptos config show-profiles --profile=retail_trader | grep "account" | awk '{print $2}')"
echo "  🏦 Market Maker: $(aptos config show-profiles --profile=market_maker | grep "account" | awk '{print $2}')"
echo "  📈 Day Trader: $(aptos config show-profiles --profile=day_trader | grep "account" | awk '{print $2}')"

echo ""
print_status "Next steps:"
echo "  1. Run ./scripts/deploy.sh to deploy contracts"
echo "  2. Run ./scripts/setup_demo.sh to create demo data"
echo "  3. Run ./scripts/run_demo_scenarios.sh for live demo"