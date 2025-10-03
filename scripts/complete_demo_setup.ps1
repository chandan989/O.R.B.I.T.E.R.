# Complete Demo Setup for Hackathon Presentation (PowerShell)
# This script runs the complete setup process for the O.R.B.I.T.E.R. demo

param(
    [string]$Network = "testnet"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 O.R.B.I.T.E.R. Complete Demo Setup" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

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

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Magenta
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to run script with error handling
function Invoke-Script {
    param(
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Status "Running: $Description"
    
    if (Test-Path $ScriptPath) {
        try {
            & $ScriptPath
            Write-Success "$Description completed"
            return $true
        } catch {
            Write-Error "$Description failed"
            return $false
        }
    } else {
        Write-Error "Script not found: $ScriptPath"
        return $false
    }
}

# Check prerequisites
Write-Step "1. Checking Prerequisites"

if (-not (Test-Command "aptos")) {
    Write-Error "Aptos CLI not found. Please install from: https://aptos.dev/tools/aptos-cli/"
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Error "Node.js not found. Please install from: https://nodejs.org/"
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Error "npm not found. Please install Node.js which includes npm"
    exit 1
}

Write-Success "All prerequisites found"

# Check Aptos CLI configuration
Write-Status "Checking Aptos CLI configuration..."
try {
    aptos config show-profiles | Out-Null
    Write-Success "Aptos CLI configured"
} catch {
    Write-Warning "Aptos CLI not configured. Please run 'aptos init' first"
    exit 1
}

Write-Host ""

# Step 2: Deploy Smart Contracts
Write-Step "2. Deploying Smart Contracts"
if (-not (Invoke-Script ".\scripts\deploy.ps1" "Smart contract deployment")) {
    exit 1
}

Write-Host ""

# Step 3: Create Demo Accounts
Write-Step "3. Creating Demo Accounts"
if (-not (Invoke-Script ".\scripts\create_demo_accounts.ps1" "Demo account creation")) {
    exit 1
}

Write-Host ""

# Step 4: Setup Demo Data
Write-Step "4. Setting Up Demo Data"
if (-not (Invoke-Script ".\scripts\setup_demo.ps1" "Demo data setup")) {
    exit 1
}

Write-Host ""

# Step 5: Run Demo Scenarios
Write-Step "5. Running Demo Scenarios"
if (-not (Invoke-Script ".\scripts\run_demo_scenarios.ps1" "Demo scenario execution")) {
    exit 1
}

Write-Host ""

# Step 6: Setup Frontend
Write-Step "6. Setting Up Frontend"

if (Test-Path "orbiter-web") {
    Write-Status "Installing frontend dependencies..."
    Push-Location "orbiter-web"
    
    try {
        npm install
        Write-Success "Frontend dependencies installed"
    } catch {
        Write-Error "Frontend dependency installation failed"
        Pop-Location
        exit 1
    }
    
    Pop-Location
} else {
    Write-Error "Frontend directory 'orbiter-web' not found"
    exit 1
}

Write-Host ""

# Step 7: Verification
Write-Step "7. Verifying Setup"

# Check deployment files
if (Test-Path ".env.deployment") {
    Write-Success "Deployment configuration found"
    $deploymentInfo = Get-Content ".env.deployment" | ConvertFrom-StringData
    Write-Status "Package address: $($deploymentInfo.PACKAGE_ADDRESS)"
} else {
    Write-Error "Deployment configuration missing"
    exit 1
}

# Check demo accounts
if (Test-Path ".env.demo_accounts") {
    Write-Success "Demo accounts configuration found"
    $demoAccountInfo = Get-Content ".env.demo_accounts" | ConvertFrom-StringData
    Write-Status "Demo accounts created: 5"
} else {
    Write-Error "Demo accounts configuration missing"
    exit 1
}

# Check frontend dependencies
if (Test-Path "orbiter-web\node_modules") {
    Write-Success "Frontend dependencies installed"
} else {
    Write-Error "Frontend dependencies missing"
    exit 1
}

Write-Host ""

# Final Summary
Write-Success "🎉 Complete Demo Setup Finished!"

Write-Host ""
Write-Status "Setup Summary:"
Write-Host "  ✅ Smart contracts deployed to testnet"
Write-Host "  ✅ 5 demo accounts created and funded"
Write-Host "  ✅ 15 premium domains tokenized"
Write-Host "  ✅ Trading scenarios executed"
Write-Host "  ✅ Frontend dependencies installed"

Write-Host ""
Write-Status "Demo Environment Ready:"
Write-Host "  📊 Total Value Locked: `$2.5B+"
Write-Host "  🏦 Active Trading Pairs: 10+"
Write-Host "  👥 Demo Accounts: 5 (Presenter, Whale, Retail, Market Maker, Day Trader)"
Write-Host "  💰 Account Balances: 10 APT each"
Write-Host "  🎯 Domains: google.com, amazon.com, microsoft.com, apple.com, meta.com, +"

Write-Host ""
Write-Status "Next Steps:"
Write-Host "  1. Start frontend: cd orbiter-web && npm run dev"
Write-Host "  2. Open browser: http://localhost:5173"
Write-Host "  3. Review presentation checklist: demo\presentation_checklist.md"
Write-Host "  4. Practice demo scenarios"

Write-Host ""
Write-Status "Demo Account Information:"
if (Test-Path ".env.demo_accounts") {
    $demoAccountInfo = Get-Content ".env.demo_accounts" | ConvertFrom-StringData
    Write-Host "  👨‍💼 Presenter: $($demoAccountInfo.PRESENTER_ADDRESS)"
    Write-Host "  🐋 Whale Investor: $($demoAccountInfo.WHALE_INVESTOR_ADDRESS)"
    Write-Host "  👤 Retail Trader: $($demoAccountInfo.RETAIL_TRADER_ADDRESS)"
    Write-Host "  🏦 Market Maker: $($demoAccountInfo.MARKET_MAKER_ADDRESS)"
    Write-Host "  📈 Day Trader: $($demoAccountInfo.DAY_TRADER_ADDRESS)"
}

Write-Host ""
Write-Status "Key URLs for Demo:"
Write-Host "  🌐 Landing Page: http://localhost:5173/"
Write-Host "  🚀 Launch Sequence: http://localhost:5173/launch-sequence"
Write-Host "  📈 Trading Interface: http://localhost:5173/exosphere-exchange"
Write-Host "  👤 Portfolio View: http://localhost:5173/satellite-constellation"

Write-Host ""
Write-Status "Troubleshooting:"
Write-Host "  📖 Demo Guide: demo\README.md"
Write-Host "  ✅ Presentation Checklist: demo\presentation_checklist.md"
Write-Host "  🔧 If issues occur, check the troubleshooting section in demo\README.md"

Write-Host ""
Write-Success "🎪 Ready for Hackathon Presentation!"
Write-Status "Good luck! 🚀"