# Development Environment Setup

## Prerequisites

1. **Install Aptos CLI**
   ```powershell
   # On Windows (PowerShell)
   Invoke-WebRequest -Uri "https://aptos.dev/scripts/install_cli.py" -OutFile "install_cli.py"
   python install_cli.py
   setx PATH "%PATH%;C:\Users\%USERNAME%\.aptoscli\bin"
   ```
   
   ```bash
   # On macOS/Linux
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

2. **Verify Installation**
   ```bash
   aptos --version
   ```

## Development Workflow

1. **Initialize Aptos Account**
   ```bash
   aptos init --profile default
   ```

2. **Compile the Move Package**
   ```bash
   aptos move compile --named-addresses orbiter=0x42
   ```

3. **Run Tests**
   ```bash
   aptos move test
   ```

4. **Publish to Devnet**
   ```bash
   aptos move publish --profile default
   ```

## Testing Framework

The project uses the built-in Aptos Move testing framework:
- Unit tests go in the `tests/` directory
- Use `#[test]` attribute for test functions
- Use `#[test_only]` for test-only modules and functions
- Run tests with `aptos move test`

## Useful Commands

- `aptos move compile --save-metadata` - Compile and save metadata
- `aptos move test --coverage` - Run tests with coverage
- `aptos account fund-with-faucet --profile default` - Fund account from faucet
- `aptos move clean` - Clean build artifacts