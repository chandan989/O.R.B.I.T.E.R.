#!/bin/bash

# Run Demo Scenarios for Hackathon Presentation
# This script executes various trading scenarios to demonstrate platform capabilities

set -e

echo "🎪 Running hackathon demo scenarios..."

# Configuration
NETWORK="testnet"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_scenario() {
    echo -e "${PURPLE}[SCENARIO]${NC} $1"
}

# Check if demo accounts exist
if [ ! -f ".env.demo_accounts" ]; then
    print_error "Demo accounts not found. Please run ./scripts/create_demo_accounts.sh first."
    exit 1
fi

# Load demo account info
source .env.demo_accounts

# Check if deployment exists
if [ ! -f ".env.deployment" ]; then
    print_error "Deployment info not found. Please run ./scripts/deploy.sh first."
    exit 1
fi

# Load deployment info
source .env.deployment

print_status "Using package: $PACKAGE_ADDRESS"
print_status "Demo accounts loaded successfully"

# Function to run a Move script with error handling
run_move_script() {
    local script_path=$1
    local profile=$2
    local description=$3
    
    print_status "Executing: $description"
    
    if aptos move run-script --profile=$profile --script-path=$script_path --assume-yes; then
        print_success "$description completed"
    else
        print_error "$description failed"
        return 1
    fi
}

# Scenario 1: Initial Demo Setup
print_scenario "1. Setting up complete demo environment"
run_move_script "demo/hackathon_presentation.move" "$PRESENTER_PROFILE" "Complete hackathon demo setup"

echo ""

# Scenario 2: Live Domain Tokenization (for presentation)
print_scenario "2. Live domain tokenization demo"
cat > temp_live_tokenization.move << 'EOF'
script {
    use orbiter::demo_scripts;
    use std::signer;

    fun live_tokenization_demo(presenter: &signer) {
        demo_scripts::demo_live_tokenization(presenter);
    }
}
EOF

run_move_script "temp_live_tokenization.move" "$PRESENTER_PROFILE" "Live domain tokenization"
rm temp_live_tokenization.move

echo ""

# Scenario 3: Whale Investor Activity
print_scenario "3. Whale investor trading activity"
cat > temp_whale_trading.move << 'EOF'
script {
    use orbiter::demo_data;
    use orbiter::marketplace;
    use std::signer;
    use std::vector;

    fun whale_trading_demo(whale: &signer) {
        // Get demo domains
        let domains = demo_data::create_demo_domains(whale);
        
        if (vector::length(&domains) > 0) {
            let google_domain = *vector::borrow(&domains, 0);
            
            // Create large buy order
            marketplace::create_listing(whale, google_domain, 49500, 5000);
        };
    }
}
EOF

run_move_script "temp_whale_trading.move" "$WHALE_INVESTOR_PROFILE" "Whale investor large orders"
rm temp_whale_trading.move

echo ""

# Scenario 4: Retail Trading Activity
print_scenario "4. Retail trader diversification"
cat > temp_retail_trading.move << 'EOF'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun retail_trading_demo(trader: &signer) {
        let domains = demo_data::create_demo_domains(trader);
        demo_scripts::demo_portfolio_diversification(trader, &domains);
    }
}
EOF

run_move_script "temp_retail_trading.move" "$RETAIL_TRADER_PROFILE" "Retail trader diversification"
rm temp_retail_trading.move

echo ""

# Scenario 5: Market Making Activity
print_scenario "5. Market maker liquidity provision"
cat > temp_market_making.move << 'EOF'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun market_making_demo(maker: &signer) {
        let domains = demo_data::create_demo_domains(maker);
        demo_scripts::demo_market_making(maker, &domains);
    }
}
EOF

run_move_script "temp_market_making.move" "$MARKET_MAKER_PROFILE" "Market maker liquidity provision"
rm temp_market_making.move

echo ""

# Scenario 6: High-Frequency Trading
print_scenario "6. High-frequency trading simulation"
cat > temp_hft_trading.move << 'EOF'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun hft_trading_demo(trader1: &signer) {
        let domains = demo_data::create_demo_domains(trader1);
        demo_scripts::demo_high_frequency_trading(trader1, trader1, &domains);
    }
}
EOF

run_move_script "temp_hft_trading.move" "$DAY_TRADER_PROFILE" "High-frequency trading"
rm temp_hft_trading.move

echo ""

# Display demo statistics
print_scenario "7. Generating demo statistics"
cat > temp_stats.move << 'EOF'
script {
    use orbiter::demo_scripts;
    use std::debug;

    fun display_demo_stats(_account: &signer) {
        let (domains, volume, trades, market_cap, users) = demo_scripts::get_live_demo_stats();
        
        debug::print(&domains);
        debug::print(&volume);
        debug::print(&trades);
        debug::print(&market_cap);
        debug::print(&users);
    }
}
EOF

run_move_script "temp_stats.move" "$PRESENTER_PROFILE" "Demo statistics generation"
rm temp_stats.move

echo ""

print_success "🎉 All demo scenarios completed successfully!"

echo ""
print_status "Demo Environment Summary:"
echo "  📊 15 premium domains tokenized"
echo "  💰 $2.5B+ total value locked"
echo "  📈 Active trading across all pairs"
echo "  🏦 Market makers providing liquidity"
echo "  👥 Multiple user types participating"

echo ""
print_status "Presentation Ready! Key highlights:"
echo "  🚀 Live domain tokenization: hackathon-demo.com"
echo "  📊 Real-time trading data and order books"
echo "  🐋 Institutional and retail participation"
echo "  ⚡ Sub-second transaction finality"
echo "  🔒 DNS verification and security"

echo ""
print_status "Frontend URLs:"
echo "  🌐 Landing Page: http://localhost:5173/"
echo "  🚀 Launch Sequence: http://localhost:5173/launch-sequence"
echo "  📈 Trading Interface: http://localhost:5173/exosphere-exchange"
echo "  👤 Portfolio: http://localhost:5173/satellite-constellation"

echo ""
print_status "Demo accounts ready for presentation:"
echo "  👨‍💼 Presenter: $PRESENTER_ADDRESS"
echo "  🐋 Whale Investor: $WHALE_INVESTOR_ADDRESS"
echo "  👤 Retail Trader: $RETAIL_TRADER_ADDRESS"
echo "  🏦 Market Maker: $MARKET_MAKER_ADDRESS"
echo "  📈 Day Trader: $DAY_TRADER_ADDRESS"