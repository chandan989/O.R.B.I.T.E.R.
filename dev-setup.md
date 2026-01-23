# Development Environment Setup

## Prerequisites

1. **Install Stacks CLI**
   ```powershell
   # On Windows (PowerShell)
   Invoke-WebRequest -Uri "https://stacks.dev/scripts/install_cli.py" -OutFile "install_cli.py"
   python install_cli.py
   setx PATH "%PATH%;C:\Users\%USERNAME%\.stackscli\bin"
   ```
   
   ```bash
   # On macOS/Linux
   curl -fsSL "https://stacks.dev/scripts/install_cli.py" | python3
   ```

2. **Verify Installation**
   ```bash
   stacks --version
   ```

## Development Workflow

1. **Initialize Stacks Account**
   ```bash
   stacks init --profile default
   ```

2. **Compile the Clarity Package**
   ```bash
   stacks clarity compile --named-addresses orbiter=0x42
   ```

3. **Run Tests**
   ```bash
   stacks clarity test
   ```

4. **Publish to Devnet**
   ```bash
   stacks clarity publish --profile default
   ```

## Testing Framework

The project uses the built-in Stacks Clarity testing framework:
- Unit tests go in the `tests/` directory
- Use `#[test]` attribute for test functions
- Use `#[test_only]` for test-only modules and functions
- Run tests with `stacks clarity test`

## Useful Commands

- `stacks clarity compile --save-metadata` - Compile and save metadata
- `stacks clarity test --coverage` - Run tests with coverage
- `stacks account fund-with-faucet --profile default` - Fund account from faucet
- `stacks clarity clean` - Clean build artifacts