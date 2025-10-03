# ORBITER Smart Contract Deployment Script for Aptos Testnet (PowerShell)
# This script deploys all ORBITER contracts to Aptos testnet

param(
    [string]$Network = "testnet",
    [string]$Profile = "default",
    [string]$PackageDir = "."
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting ORBITER Smart Contract Deployment..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Aptos CLI is installed
try {
    $null = Get-Command aptos -ErrorAction Stop
} catch {
    Write-Error "Aptos CLI is not installed. Please install it first."
    Write-Status "Visit: https://aptos.dev/tools/aptos-cli/install-cli/"
    exit 1
}

# Check if profile exists
$profiles = aptos config show-profiles
if (-not ($profiles -match $Profile)) {
    Write-Error "Profile '$Profile' not found."
    Write-Status "Please run: aptos init --profile $Profile --network $Network"
    exit 1
}

# Get account address
$accountInfo = aptos config show-profiles --profile=$Profile
$accountAddress = ($accountInfo | Select-String "account" | ForEach-Object { $_.Line.Split()[1] })
Write-Status "Deploying with account: $accountAddress"

# Check account balance
try {
    $balanceInfo = aptos account lookup-address --profile=$Profile --address=$accountAddress
    $balance = ($balanceInfo | Select-String "Balance" | ForEach-Object { $_.Line.Split()[1] })
    Write-Status "Account balance: $balance APT"
    
    if ([int64]$balance -lt 100000000) {  # 1 APT = 100000000 octas
        Write-Warning "Low balance detected. You may need to fund your account."
        Write-Status "Get testnet tokens: https://aptoslabs.com/testnet-faucet"
    }
} catch {
    Write-Warning "Could not check account balance"
}

# Compile the package
Write-Status "Compiling Move package..."
try {
    aptos move compile --profile=$Profile --package-dir=$PackageDir
    Write-Success "Package compiled successfully"
} catch {
    Write-Error "Compilation failed!"
    exit 1
}

# Publish the package
Write-Status "Publishing package to $Network..."
try {
    $publishOutput = aptos move publish --profile=$Profile --package-dir=$PackageDir --assume-yes
    Write-Success "Package published successfully!"
    Write-Host $publishOutput
    
    # Extract package address from output
    $packageAddress = ($publishOutput | Select-String "0x[a-fA-F0-9]{64}" | ForEach-Object { $_.Matches[0].Value })
    Write-Status "Package address: $packageAddress"
    
    # Save deployment info
    $deploymentInfo = @"
PACKAGE_ADDRESS=$packageAddress
ACCOUNT_ADDRESS=$accountAddress
NETWORK=$Network
DEPLOYED_AT=$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
"@
    $deploymentInfo | Out-File -FilePath ".env.deployment" -Encoding UTF8
    Write-Success "Deployment info saved to .env.deployment"
} catch {
    Write-Error "Package publication failed!"
    exit 1
}

# Run initialization script
Write-Status "Initializing contracts..."
try {
    aptos move run-script --profile=$Profile --script-path=scripts/deploy_contracts.move --assume-yes
    Write-Success "Contracts initialized successfully!"
} catch {
    Write-Error "Contract initialization failed!"
    exit 1
}

Write-Success "🎉 ORBITER deployment completed successfully!"
Write-Status "Package Address: $packageAddress"
Write-Status "Network: $Network"
Write-Status "Account: $accountAddress"

Write-Host ""
Write-Status "Next steps:"
Write-Host "1. Run demo data setup: .\scripts\setup_demo.ps1"
Write-Host "2. Verify deployment: .\scripts\verify_deployment.ps1"
Write-Host "3. Update frontend configuration with package address"