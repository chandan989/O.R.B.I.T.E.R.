# ORBITER Deployment Verification Script (PowerShell)
# This script verifies that all contracts are deployed and initialized correctly

param(
    [string]$Network = "testnet",
    [string]$Profile = "default"
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Verifying ORBITER deployment..." -ForegroundColor Blue

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

# Check if deployment info exists
if (-not (Test-Path ".env.deployment")) {
    Write-Error "Deployment info not found. Please run .\scripts\deploy.ps1 first."
    exit 1
}

# Load deployment info
$deploymentInfo = Get-Content ".env.deployment" | ConvertFrom-StringData
$packageAddress = $deploymentInfo.PACKAGE_ADDRESS
$accountAddress = $deploymentInfo.ACCOUNT_ADDRESS
$deployedAt = $deploymentInfo.DEPLOYED_AT

Write-Status "Verifying deployment on $Network"
Write-Status "Package: $packageAddress"
Write-Status "Account: $accountAddress"

# Verification functions
function Test-Module {
    param([string]$ModuleName)
    Write-Status "Checking module: $ModuleName"
    
    try {
        $null = aptos move view --profile=$Profile --function-id="${packageAddress}::${ModuleName}::get_module_info" 2>$null
        Write-Success "✓ Module $ModuleName is deployed and accessible"
        return $true
    } catch {
        Write-Error "✗ Module $ModuleName verification failed"
        return $false
    }
}

function Test-Registry {
    Write-Status "Verifying domain registry initialization..."
    
    try {
        $null = aptos move view --profile=$Profile --function-id="${packageAddress}::domain_registry::get_registry_stats" 2>$null
        Write-Success "✓ Domain registry is initialized"
        return $true
    } catch {
        Write-Warning "⚠ Domain registry may not be initialized or view function unavailable"
        return $false
    }
}

function Test-Marketplace {
    Write-Status "Verifying marketplace initialization..."
    
    try {
        $null = aptos move view --profile=$Profile --function-id="${packageAddress}::marketplace::get_marketplace_stats" 2>$null
        Write-Success "✓ Marketplace is initialized"
        return $true
    } catch {
        Write-Warning "⚠ Marketplace may not be initialized or view function unavailable"
        return $false
    }
}

function Test-Valuation {
    Write-Status "Verifying valuation oracle initialization..."
    
    try {
        $null = aptos move view --profile=$Profile --function-id="${packageAddress}::valuation::get_oracle_info" 2>$null
        Write-Success "✓ Valuation oracle is initialized"
        return $true
    } catch {
        Write-Warning "⚠ Valuation oracle may not be initialized or view function unavailable"
        return $false
    }
}

# Run verifications
Write-Host "==================== MODULE VERIFICATION ====================" -ForegroundColor Yellow

$modules = @("domain_registry", "fractional", "marketplace", "valuation", "security")
$moduleErrors = 0

foreach ($module in $modules) {
    if (-not (Test-Module $module)) {
        $moduleErrors++
    }
}

Write-Host ""
Write-Host "==================== INITIALIZATION VERIFICATION ====================" -ForegroundColor Yellow

$initErrors = 0

if (-not (Test-Registry)) {
    $initErrors++
}

if (-not (Test-Marketplace)) {
    $initErrors++
}

if (-not (Test-Valuation)) {
    $initErrors++
}

Write-Host ""
Write-Host "==================== ACCOUNT VERIFICATION ====================" -ForegroundColor Yellow

# Check account resources
Write-Status "Checking account resources..."
try {
    $resources = aptos account list --profile=$Profile --query=resources 2>$null
    
    if ($resources -match "domain_registry") {
        Write-Success "✓ Domain registry resources found"
    } else {
        Write-Warning "⚠ Domain registry resources not found"
        $initErrors++
    }
    
    if ($resources -match "marketplace") {
        Write-Success "✓ Marketplace resources found"
    } else {
        Write-Warning "⚠ Marketplace resources not found"
        $initErrors++
    }
} catch {
    Write-Warning "⚠ Could not check account resources"
    $initErrors++
}

Write-Host ""
Write-Host "==================== VERIFICATION SUMMARY ====================" -ForegroundColor Yellow

if ($moduleErrors -eq 0 -and $initErrors -eq 0) {
    Write-Success "🎉 All verifications passed! Deployment is successful."
    Write-Host ""
    Write-Status "Deployment Summary:"
    Write-Host "  Network: $Network"
    Write-Host "  Package: $packageAddress"
    Write-Host "  Account: $accountAddress"
    Write-Host "  Deployed: $deployedAt"
    Write-Host ""
    Write-Status "Ready for frontend integration!"
    exit 0
} else {
    Write-Error "❌ Verification failed!"
    Write-Host "  Module errors: $moduleErrors"
    Write-Host "  Initialization errors: $initErrors"
    Write-Host ""
    Write-Status "Please check the deployment and try again."
    exit 1
}