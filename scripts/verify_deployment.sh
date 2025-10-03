#!/bin/bash

# ORBITER Deployment Verification Script
# This script verifies that all contracts are deployed and initialized correctly

set -e

echo "🔍 Verifying ORBITER deployment..."

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if deployment info exists
if [ ! -f ".env.deployment" ]; then
    print_error "Deployment info not found. Please run ./scripts/deploy.sh first."
    exit 1
fi

# Load deployment info
source .env.deployment

print_status "Verifying deployment on $NETWORK"
print_status "Package: $PACKAGE_ADDRESS"
print_status "Account: $ACCOUNT_ADDRESS"

# Verification functions
verify_module() {
    local module_name=$1
    print_status "Checking module: $module_name"
    
    if aptos move view --profile=$PROFILE_NAME --function-id="${PACKAGE_ADDRESS}::${module_name}::get_module_info" &>/dev/null; then
        print_success "✓ Module $module_name is deployed and accessible"
        return 0
    else
        print_error "✗ Module $module_name verification failed"
        return 1
    fi
}

verify_registry() {
    print_status "Verifying domain registry initialization..."
    
    # Try to call a view function to check if registry is initialized
    if aptos move view --profile=$PROFILE_NAME --function-id="${PACKAGE_ADDRESS}::domain_registry::get_registry_stats" &>/dev/null; then
        print_success "✓ Domain registry is initialized"
        return 0
    else
        print_warning "⚠ Domain registry may not be initialized or view function unavailable"
        return 1
    fi
}

verify_marketplace() {
    print_status "Verifying marketplace initialization..."
    
    if aptos move view --profile=$PROFILE_NAME --function-id="${PACKAGE_ADDRESS}::marketplace::get_marketplace_stats" &>/dev/null; then
        print_success "✓ Marketplace is initialized"
        return 0
    else
        print_warning "⚠ Marketplace may not be initialized or view function unavailable"
        return 1
    fi
}

verify_valuation() {
    print_status "Verifying valuation oracle initialization..."
    
    if aptos move view --profile=$PROFILE_NAME --function-id="${PACKAGE_ADDRESS}::valuation::get_oracle_info" &>/dev/null; then
        print_success "✓ Valuation oracle is initialized"
        return 0
    else
        print_warning "⚠ Valuation oracle may not be initialized or view function unavailable"
        return 1
    fi
}

# Run verifications
echo "==================== MODULE VERIFICATION ===================="

MODULES=("domain_registry" "fractional" "marketplace" "valuation" "security")
MODULE_ERRORS=0

for module in "${MODULES[@]}"; do
    if ! verify_module "$module"; then
        ((MODULE_ERRORS++))
    fi
done

echo ""
echo "==================== INITIALIZATION VERIFICATION ===================="

INIT_ERRORS=0

if ! verify_registry; then
    ((INIT_ERRORS++))
fi

if ! verify_marketplace; then
    ((INIT_ERRORS++))
fi

if ! verify_valuation; then
    ((INIT_ERRORS++))
fi

echo ""
echo "==================== ACCOUNT VERIFICATION ===================="

# Check account resources
print_status "Checking account resources..."
RESOURCES=$(aptos account list --profile=$PROFILE_NAME --query=resources 2>/dev/null || echo "")

if echo "$RESOURCES" | grep -q "domain_registry"; then
    print_success "✓ Domain registry resources found"
else
    print_warning "⚠ Domain registry resources not found"
    ((INIT_ERRORS++))
fi

if echo "$RESOURCES" | grep -q "marketplace"; then
    print_success "✓ Marketplace resources found"
else
    print_warning "⚠ Marketplace resources not found"
    ((INIT_ERRORS++))
fi

echo ""
echo "==================== VERIFICATION SUMMARY ===================="

if [ $MODULE_ERRORS -eq 0 ] && [ $INIT_ERRORS -eq 0 ]; then
    print_success "🎉 All verifications passed! Deployment is successful."
    echo ""
    print_status "Deployment Summary:"
    echo "  Network: $NETWORK"
    echo "  Package: $PACKAGE_ADDRESS"
    echo "  Account: $ACCOUNT_ADDRESS"
    echo "  Deployed: $DEPLOYED_AT"
    echo ""
    print_status "Ready for frontend integration!"
    exit 0
else
    print_error "❌ Verification failed!"
    echo "  Module errors: $MODULE_ERRORS"
    echo "  Initialization errors: $INIT_ERRORS"
    echo ""
    print_status "Please check the deployment and try again."
    exit 1
fi