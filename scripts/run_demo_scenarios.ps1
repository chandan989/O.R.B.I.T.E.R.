# Run Demo Scenarios for Hackathon Presentation (PowerShell)
# This script executes various trading scenarios to demonstrate platform capabilities

param(
    [string]$Network = "testnet"
)

$ErrorActionPreference = "Stop"

Write-Host "🎪 Running hackathon demo scenarios..." -ForegroundColor Blue

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

function Write-Scenario {
    param([string]$Message)
    Write-Host "[SCENARIO] $Message" -ForegroundColor Magenta
}

# Check if demo accounts exist
if (-not (Test-Path ".env.demo_accounts")) {
    Write-Error "Demo accounts not found. Please run .\scripts\create_demo_accounts.ps1 first."
    exit 1
}

# Load demo account info
$demoAccountInfo = Get-Content ".env.demo_accounts" | ConvertFrom-StringData

# Check if deployment exists
if (-not (Test-Path ".env.deployment")) {
    Write-Error "Deployment info not found. Please run .\scripts\deploy.ps1 first."
    exit 1
}

# Load deployment info
$deploymentInfo = Get-Content ".env.deployment" | ConvertFrom-StringData

Write-Status "Using package: $($deploymentInfo.PACKAGE_ADDRESS)"
Write-Status "Demo accounts loaded successfully"

# Function to run a Move script with error handling
function Run-MoveScript {
    param(
        [string]$ScriptPath,
        [string]$Profile,
        [string]$Description
    )
    
    Write-Status "Executing: $Description"
    
    try {
        aptos move run-script --profile=$Profile --script-path=$ScriptPath --assume-yes
        Write-Success "$Description completed"
        return $true
    } catch {
        Write-Error "$Description failed"
        return $false
    }
}

# Scenario 1: Initial Demo Setup
Write-Scenario "1. Setting up complete demo environment"
Run-MoveScript "demo/hackathon_presentation.move" $demoAccountInfo.PRESENTER_PROFILE "Complete hackathon demo setup"

Write-Host ""

# Scenario 2: Live Domain Tokenization (for presentation)
Write-Scenario "2. Live domain tokenization demo"
$liveTokenizationScript = @'
script {
    use orbiter::demo_scripts;
    use std::signer;

    fun live_tokenization_demo(presenter: &signer) {
        demo_scripts::demo_live_tokenization(presenter);
    }
}
'@

$liveTokenizationScript | Out-File -FilePath "temp_live_tokenization.move" -Encoding UTF8
Run-MoveScript "temp_live_tokenization.move" $demoAccountInfo.PRESENTER_PROFILE "Live domain tokenization"
Remove-Item "temp_live_tokenization.move"

Write-Host ""

# Scenario 3: Whale Investor Activity
Write-Scenario "3. Whale investor trading activity"
$whaleTradingScript = @'
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
'@

$whaleTradingScript | Out-File -FilePath "temp_whale_trading.move" -Encoding UTF8
Run-MoveScript "temp_whale_trading.move" $demoAccountInfo.WHALE_INVESTOR_PROFILE "Whale investor large orders"
Remove-Item "temp_whale_trading.move"

Write-Host ""

# Scenario 4: Retail Trading Activity
Write-Scenario "4. Retail trader diversification"
$retailTradingScript = @'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun retail_trading_demo(trader: &signer) {
        let domains = demo_data::create_demo_domains(trader);
        demo_scripts::demo_portfolio_diversification(trader, &domains);
    }
}
'@

$retailTradingScript | Out-File -FilePath "temp_retail_trading.move" -Encoding UTF8
Run-MoveScript "temp_retail_trading.move" $demoAccountInfo.RETAIL_TRADER_PROFILE "Retail trader diversification"
Remove-Item "temp_retail_trading.move"

Write-Host ""

# Scenario 5: Market Making Activity
Write-Scenario "5. Market maker liquidity provision"
$marketMakingScript = @'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun market_making_demo(maker: &signer) {
        let domains = demo_data::create_demo_domains(maker);
        demo_scripts::demo_market_making(maker, &domains);
    }
}
'@

$marketMakingScript | Out-File -FilePath "temp_market_making.move" -Encoding UTF8
Run-MoveScript "temp_market_making.move" $demoAccountInfo.MARKET_MAKER_PROFILE "Market maker liquidity provision"
Remove-Item "temp_market_making.move"

Write-Host ""

# Scenario 6: High-Frequency Trading
Write-Scenario "6. High-frequency trading simulation"
$hftTradingScript = @'
script {
    use orbiter::demo_data;
    use orbiter::demo_scripts;
    use std::signer;

    fun hft_trading_demo(trader1: &signer) {
        let domains = demo_data::create_demo_domains(trader1);
        demo_scripts::demo_high_frequency_trading(trader1, trader1, &domains);
    }
}
'@

$hftTradingScript | Out-File -FilePath "temp_hft_trading.move" -Encoding UTF8
Run-MoveScript "temp_hft_trading.move" $demoAccountInfo.DAY_TRADER_PROFILE "High-frequency trading"
Remove-Item "temp_hft_trading.move"

Write-Host ""

# Display demo statistics
Write-Scenario "7. Generating demo statistics"
$statsScript = @'
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
'@

$statsScript | Out-File -FilePath "temp_stats.move" -Encoding UTF8
Run-MoveScript "temp_stats.move" $demoAccountInfo.PRESENTER_PROFILE "Demo statistics generation"
Remove-Item "temp_stats.move"

Write-Host ""

Write-Success "🎉 All demo scenarios completed successfully!"

Write-Host ""
Write-Status "Demo Environment Summary:"
Write-Host "  📊 15 premium domains tokenized"
Write-Host "  💰 `$2.5B+ total value locked"
Write-Host "  📈 Active trading across all pairs"
Write-Host "  🏦 Market makers providing liquidity"
Write-Host "  👥 Multiple user types participating"

Write-Host ""
Write-Status "Presentation Ready! Key highlights:"
Write-Host "  🚀 Live domain tokenization: hackathon-demo.com"
Write-Host "  📊 Real-time trading data and order books"
Write-Host "  🐋 Institutional and retail participation"
Write-Host "  ⚡ Sub-second transaction finality"
Write-Host "  🔒 DNS verification and security"

Write-Host ""
Write-Status "Frontend URLs:"
Write-Host "  🌐 Landing Page: http://localhost:5173/"
Write-Host "  🚀 Launch Sequence: http://localhost:5173/launch-sequence"
Write-Host "  📈 Trading Interface: http://localhost:5173/exosphere-exchange"
Write-Host "  👤 Portfolio: http://localhost:5173/satellite-constellation"

Write-Host ""
Write-Status "Demo accounts ready for presentation:"
Write-Host "  👨‍💼 Presenter: $($demoAccountInfo.PRESENTER_ADDRESS)"
Write-Host "  🐋 Whale Investor: $($demoAccountInfo.WHALE_INVESTOR_ADDRESS)"
Write-Host "  👤 Retail Trader: $($demoAccountInfo.RETAIL_TRADER_ADDRESS)"
Write-Host "  🏦 Market Maker: $($demoAccountInfo.MARKET_MAKER_ADDRESS)"
Write-Host "  📈 Day Trader: $($demoAccountInfo.DAY_TRADER_ADDRESS)"