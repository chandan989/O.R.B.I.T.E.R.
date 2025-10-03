# ORBITER Demo Data Setup Script (PowerShell)
# This script sets up demo data for hackathon presentation

param(
    [string]$Network = "testnet",
    [string]$Profile = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "🎭 Setting up ORBITER demo data..." -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if deployment info exists
if (-not (Test-Path ".env.deployment")) {
    Write-Error "Deployment info not found. Please run .\scripts\deploy.ps1 first."
    exit 1
}

# Load deployment info
$deploymentInfo = Get-Content ".env.deployment" | ConvertFrom-StringData
$packageAddress = $deploymentInfo.PACKAGE_ADDRESS
$accountAddress = $deploymentInfo.ACCOUNT_ADDRESS

Write-Status "Setting up demo data on $Network"
Write-Status "Using package: $packageAddress"

# Run demo data setup script
Write-Status "Creating demo domains and listings..."
try {
    aptos move run-script --profile=$Profile --script-path=scripts/setup_demo_data.move --assume-yes
    Write-Success "Demo data created successfully!"
} catch {
    Write-Error "Demo data setup failed!"
    exit 1
}

# Create additional demo accounts if needed
Write-Status "Creating additional demo accounts..."

# Create buyer account
$buyerProfile = "demo_buyer"
$profiles = aptos config show-profiles
if (-not ($profiles -match $buyerProfile)) {
    aptos init --profile $buyerProfile --network $Network --assume-yes
    $buyerInfo = aptos config show-profiles --profile=$buyerProfile
    $buyerAddress = ($buyerInfo | Select-String "account" | ForEach-Object { $_.Line.Split()[1] })
    Write-Status "Created buyer account: $buyerAddress"
    
    # Fund buyer account
    Write-Status "Funding buyer account..."
    aptos account fund-with-faucet --profile=$buyerProfile --amount=1000000000
}

# Create seller account
$sellerProfile = "demo_seller"
if (-not ($profiles -match $sellerProfile)) {
    aptos init --profile $sellerProfile --network $Network --assume-yes
    $sellerInfo = aptos config show-profiles --profile=$sellerProfile
    $sellerAddress = ($sellerInfo | Select-String "account" | ForEach-Object { $_.Line.Split()[1] })
    Write-Status "Created seller account: $sellerAddress"
    
    # Fund seller account
    Write-Status "Funding seller account..."
    aptos account fund-with-faucet --profile=$sellerProfile --amount=1000000000
}

# Append demo account info
"BUYER_ADDRESS=$buyerAddress" | Add-Content ".env.deployment"
"SELLER_ADDRESS=$sellerAddress" | Add-Content ".env.deployment"

Write-Success "🎉 Demo data setup completed!"
Write-Status "Demo accounts created and funded"
Write-Status "Sample domains: google.com, apple.com"
Write-Status "Sample listings created for both domains"

Write-Host ""
Write-Status "Demo accounts:"
Write-Host "  Main: $accountAddress"
Write-Host "  Buyer: $buyerAddress"
Write-Host "  Seller: $sellerAddress"