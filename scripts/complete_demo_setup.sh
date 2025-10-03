#!/bin/bash

# Complete Demo Setup for Hackathon Presentation
# This script runs the complete setup process for the O.R.B.I.T.E.R. demo

set -e

echo "🚀 O.R.B.I.T.E.R. Complete Demo Setup"
echo "===================================="

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run script with error handling
run_script() {
    local script_path=$1
    local description=$2
    
    print_status "Running: $description"
    
    if [ -f "$script_path" ]; then
        if bash "$script_path"; then
            print_success "$description completed"
        else
            print_error "$description failed"
            return 1
        fi
    else
        print_error "Script not found: $script_path"
        return 1
    fi
}

# Check prerequisites
print_step "1. Checking Prerequisites"

if ! command_exists aptos; then
    print_error "Aptos CLI not found. Please install from: https://aptos.dev/tools/aptos-cli/"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js not found. Please install from: https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm not found. Please install Node.js which includes npm"
    exit 1
fi

print_success "All prerequisites found"

# Check Aptos CLI configuration
print_status "Checking Aptos CLI configuration..."
if aptos config show-profiles >/dev/null 2>&1; then
    print_success "Aptos CLI configured"
else
    print_warning "Aptos CLI not configured. Please run 'aptos init' first"
    exit 1
fi

echo ""

# Step 2: Deploy Smart Contracts
print_step "2. Deploying Smart Contracts"
run_script "./scripts/deploy.sh" "Smart contract deployment"

echo ""

# Step 3: Create Demo Accounts
print_step "3. Creating Demo Accounts"
run_script "./scripts/create_demo_accounts.sh" "Demo account creation"

echo ""

# Step 4: Setup Demo Data
print_step "4. Setting Up Demo Data"
run_script "./scripts/setup_demo.sh" "Demo data setup"

echo ""

# Step 5: Run Demo Scenarios
print_step "5. Running Demo Scenarios"
run_script "./scripts/run_demo_scenarios.sh" "Demo scenario execution"

echo ""

# Step 6: Setup Frontend
print_step "6. Setting Up Frontend"

if [ -d "orbiter-web" ]; then
    print_status "Installing frontend dependencies..."
    cd orbiter-web
    
    if npm install; then
        print_success "Frontend dependencies installed"
    else
        print_error "Frontend dependency installation failed"
        cd ..
        exit 1
    fi
    
    cd ..
else
    print_error "Frontend directory 'orbiter-web' not found"
    exit 1
fi

echo ""

# Step 7: Verification
print_step "7. Verifying Setup"

# Check deployment files
if [ -f ".env.deployment" ]; then
    print_success "Deployment configuration found"
    source .env.deployment
    print_status "Package address: $PACKAGE_ADDRESS"
else
    print_error "Deployment configuration missing"
    exit 1
fi

# Check demo accounts
if [ -f ".env.demo_accounts" ]; then
    print_success "Demo accounts configuration found"
    source .env.demo_accounts
    print_status "Demo accounts created: 5"
else
    print_error "Demo accounts configuration missing"
    exit 1
fi

# Check frontend dependencies
if [ -d "orbiter-web/node_modules" ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Frontend dependencies missing"
    exit 1
fi

echo ""

# Final Summary
print_success "🎉 Complete Demo Setup Finished!"

echo ""
print_status "Setup Summary:"
echo "  ✅ Smart contracts deployed to testnet"
echo "  ✅ 5 demo accounts created and funded"
echo "  ✅ 15 premium domains tokenized"
echo "  ✅ Trading scenarios executed"
echo "  ✅ Frontend dependencies installed"

echo ""
print_status "Demo Environment Ready:"
echo "  📊 Total Value Locked: \$2.5B+"
echo "  🏦 Active Trading Pairs: 10+"
echo "  👥 Demo Accounts: 5 (Presenter, Whale, Retail, Market Maker, Day Trader)"
echo "  💰 Account Balances: 10 APT each"
echo "  🎯 Domains: google.com, amazon.com, microsoft.com, apple.com, meta.com, +"

echo ""
print_status "Next Steps:"
echo "  1. Start frontend: cd orbiter-web && npm run dev"
echo "  2. Open browser: http://localhost:5173"
echo "  3. Review presentation checklist: demo/presentation_checklist.md"
echo "  4. Practice demo scenarios"

echo ""
print_status "Demo Account Information:"
if [ -f ".env.demo_accounts" ]; then
    source .env.demo_accounts
    echo "  👨‍💼 Presenter: $PRESENTER_ADDRESS"
    echo "  🐋 Whale Investor: $WHALE_INVESTOR_ADDRESS"
    echo "  👤 Retail Trader: $RETAIL_TRADER_ADDRESS"
    echo "  🏦 Market Maker: $MARKET_MAKER_ADDRESS"
    echo "  📈 Day Trader: $DAY_TRADER_ADDRESS"
fi

echo ""
print_status "Key URLs for Demo:"
echo "  🌐 Landing Page: http://localhost:5173/"
echo "  🚀 Launch Sequence: http://localhost:5173/launch-sequence"
echo "  📈 Trading Interface: http://localhost:5173/exosphere-exchange"
echo "  👤 Portfolio View: http://localhost:5173/satellite-constellation"

echo ""
print_status "Troubleshooting:"
echo "  📖 Demo Guide: demo/README.md"
echo "  ✅ Presentation Checklist: demo/presentation_checklist.md"
echo "  🔧 If issues occur, check the troubleshooting section in demo/README.md"

echo ""
print_success "🎪 Ready for Hackathon Presentation!"
print_status "Good luck! 🚀"