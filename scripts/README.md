# ORBITER Deployment Scripts

This directory contains deployment and configuration scripts for the ORBITER smart contracts on Aptos.

## Overview

The ORBITER deployment system provides automated scripts for:
- Contract compilation and deployment
- System initialization and configuration
- Demo data setup for hackathon presentations
- Deployment verification and testing
- Cross-platform support (Linux/macOS and Windows)

## Prerequisites

1. **Aptos CLI**: Install the Aptos CLI tool
   ```bash
   # Install via script (Linux/macOS)
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   
   # Or download from releases
   # https://github.com/aptos-labs/aptos-core/releases
   ```

2. **Account Setup**: Initialize your Aptos account
   ```bash
   aptos init --profile default --network testnet
   ```

3. **Funding**: Get testnet tokens from the faucet
   - Visit: https://aptoslabs.com/testnet-faucet
   - Or use CLI: `aptos account fund-with-faucet --profile default`

## Quick Start

### Linux/macOS

1. **Deploy contracts**:
   ```bash
   chmod +x scripts/*.sh
   ./scripts/deploy.sh
   ```

2. **Setup demo data**:
   ```bash
   ./scripts/setup_demo.sh
   ```

3. **Verify deployment**:
   ```bash
   ./scripts/verify_deployment.sh
   ```

### Windows (PowerShell)

1. **Deploy contracts**:
   ```powershell
   .\scripts\deploy.ps1
   ```

2. **Setup demo data**:
   ```powershell
   .\scripts\setup_demo.ps1
   ```

3. **Verify deployment**:
   ```powershell
   .\scripts\verify_deployment.ps1
   ```

## Script Details

### Core Scripts

#### `deploy_contracts.move`
Move script that initializes all ORBITER modules:
- Domain Registry
- Marketplace (with 2.5% trading fee)
- Valuation Oracle system

#### `setup_demo_data.move`
Creates demo domains and listings:
- google.com with GOOGL ticker
- apple.com with AAPL ticker
- Sample marketplace listings

#### `add_oracle.move`
Adds new oracles to the valuation system.

#### `update_marketplace_config.move`
Updates marketplace configuration (fees, collector address).

### Deployment Scripts

#### `deploy.sh` / `deploy.ps1`
Main deployment script that:
- Compiles the Move package
- Publishes to testnet
- Initializes all modules
- Saves deployment information

#### `setup_demo.sh` / `setup_demo.ps1`
Demo data setup script that:
- Creates sample domains
- Sets up demo accounts
- Funds accounts with testnet tokens
- Creates marketplace listings

#### `verify_deployment.sh` / `verify_deployment.ps1`
Verification script that:
- Checks module deployment
- Verifies initialization
- Tests account resources
- Provides deployment summary

## Configuration

### `config.json`
Contains deployment configuration:
- Network settings
- Marketplace parameters
- Valuation oracle settings
- Demo data specifications

### `.env.deployment`
Generated during deployment, contains:
- Package address
- Account address
- Network information
- Deployment timestamp
- Demo account addresses

## Usage Examples

### Custom Network Deployment

```bash
# Deploy to devnet
./scripts/deploy.sh --network devnet --profile devnet

# Deploy with custom profile
./scripts/deploy.sh --profile my-profile
```

### Adding Oracles

```bash
# Add oracle address
aptos move run-script \
  --profile default \
  --script-path scripts/add_oracle.move \
  --args address:0x123...
```

### Updating Marketplace Fees

```bash
# Update to 1% trading fee (100 basis points)
aptos move run-script \
  --profile default \
  --script-path scripts/update_marketplace_config.move \
  --args u64:100 address:0x456...
```

## Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Check Move.toml dependencies
   - Ensure all source files are present
   - Verify syntax in Move files

2. **Insufficient Balance**
   - Fund account from faucet
   - Check minimum balance requirements
   - Verify network connectivity

3. **Profile Not Found**
   - Initialize profile: `aptos init --profile <name> --network <network>`
   - Check profile list: `aptos config show-profiles`

4. **Module Not Found**
   - Verify package deployment
   - Check package address in .env.deployment
   - Ensure initialization completed

### Debug Mode

Enable verbose output:
```bash
# Linux/macOS
APTOS_CLI_DEBUG=1 ./scripts/deploy.sh

# Windows
$env:APTOS_CLI_DEBUG=1; .\scripts\deploy.ps1
```

## Security Considerations

1. **Private Keys**: Never commit private keys or mnemonics
2. **Admin Access**: Secure admin accounts with strong authentication
3. **Oracle Management**: Carefully manage oracle permissions
4. **Fee Configuration**: Set reasonable trading fees

## Integration

After successful deployment:

1. **Frontend Integration**: Use package address from `.env.deployment`
2. **API Integration**: Configure backend services with contract addresses
3. **Monitoring**: Set up monitoring for contract events
4. **Analytics**: Track marketplace and trading metrics

## Support

For issues or questions:
- Check the troubleshooting section
- Review Aptos documentation: https://aptos.dev
- Verify network status: https://status.aptoslabs.com

## File Structure

```
scripts/
├── README.md                    # This file
├── config.json                  # Deployment configuration
├── deploy_contracts.move        # Contract initialization script
├── setup_demo_data.move         # Demo data creation script
├── add_oracle.move              # Oracle management script
├── update_marketplace_config.move # Marketplace configuration script
├── deploy.sh                    # Linux/macOS deployment script
├── deploy.ps1                   # Windows deployment script
├── setup_demo.sh                # Linux/macOS demo setup script
├── setup_demo.ps1               # Windows demo setup script
├── verify_deployment.sh         # Linux/macOS verification script
└── verify_deployment.ps1        # Windows verification script
```