# Create Demo Accounts for Hackathon Presentation (PowerShell)
# This script creates and funds multiple demo accounts for realistic trading scenarios

param(
    [string]$Network = "testnet",
    [int]$FundingAmount = 1000000000  # 10 APT in octas
)

$ErrorActionPreference = "Stop"

Write-Host "🎭 Creating demo accounts for hackathon presentation..." -ForegroundColor Blue

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

# Demo account profiles
$DemoAccounts = @(
    @{Profile="presenter"; Role="Platform Admin"},
    @{Profile="whale_investor"; Role="Institutional Investor"},
    @{Profile="retail_trader"; Role="Individual Trader"},
    @{Profile="market_maker"; Role="Liquidity Provider"},
    @{Profile="day_trader"; Role="Active Trader"}
)

$AccountAddresses = @{}

# Create demo accounts
foreach ($account in $DemoAccounts) {
    $profileName = $account.Profile
    $role = $account.Role
    
    Write-Status "Creating $role account: $profileName"
    
    # Check if profile already exists
    $profiles = aptos config show-profiles
    if ($profiles -match $profileName) {
        Write-Status "Profile $profileName already exists, skipping creation"
    } else {
        # Create new profile
        try {
            aptos init --profile $profileName --network $Network --assume-yes
            Write-Success "Created profile: $profileName"
        } catch {
            Write-Error "Failed to create profile: $profileName"
            continue
        }
    }
    
    # Get account address
    $profileInfo = aptos config show-profiles --profile=$profileName
    $accountAddress = ($profileInfo | Select-String "account" | ForEach-Object { $_.Line.Split()[1] })
    $AccountAddresses[$profileName] = $accountAddress
    Write-Status "Account address: $accountAddress"
    
    # Fund account
    Write-Status "Funding $profileName with 10 APT..."
    try {
        aptos account fund-with-faucet --profile=$profileName --amount=$FundingAmount
        Write-Success "Funded $profileName successfully"
    } catch {
        Write-Error "Failed to fund $profileName"
    }
    
    # Get balance to verify
    $balanceInfo = aptos account balance --profile=$profileName
    $balance = ($balanceInfo | Select-String "APT" | ForEach-Object { $_.Line.Split()[1] })
    Write-Status "Current balance: $balance APT"
    
    Write-Host ""
}

# Save account information for demo scripts
Write-Status "Saving demo account information..."

$envContent = @"
# Demo Account Information
# Generated on $(Get-Date)

PRESENTER_PROFILE=presenter
WHALE_INVESTOR_PROFILE=whale_investor
RETAIL_TRADER_PROFILE=retail_trader
MARKET_MAKER_PROFILE=market_maker
DAY_TRADER_PROFILE=day_trader

# Account Addresses
PRESENTER_ADDRESS=$($AccountAddresses['presenter'])
WHALE_INVESTOR_ADDRESS=$($AccountAddresses['whale_investor'])
RETAIL_TRADER_ADDRESS=$($AccountAddresses['retail_trader'])
MARKET_MAKER_ADDRESS=$($AccountAddresses['market_maker'])
DAY_TRADER_ADDRESS=$($AccountAddresses['day_trader'])

# Network Configuration
NETWORK=$Network
FUNDING_AMOUNT=$FundingAmount
"@

$envContent | Out-File -FilePath ".env.demo_accounts" -Encoding UTF8

Write-Success "🎉 Demo accounts created successfully!"
Write-Status "Account information saved to .env.demo_accounts"

Write-Host ""
Write-Status "Demo Account Summary:"
Write-Host "  👨‍💼 Presenter (Admin): $($AccountAddresses['presenter'])"
Write-Host "  🐋 Whale Investor: $($AccountAddresses['whale_investor'])"
Write-Host "  👤 Retail Trader: $($AccountAddresses['retail_trader'])"
Write-Host "  🏦 Market Maker: $($AccountAddresses['market_maker'])"
Write-Host "  📈 Day Trader: $($AccountAddresses['day_trader'])"

Write-Host ""
Write-Status "Next steps:"
Write-Host "  1. Run .\scripts\deploy.ps1 to deploy contracts"
Write-Host "  2. Run .\scripts\setup_demo.ps1 to create demo data"
Write-Host "  3. Run .\scripts\run_demo_scenarios.ps1 for live demo"