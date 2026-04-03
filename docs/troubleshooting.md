# Troubleshooting Guide

Common setup, build, wallet, and Docker issues.
## Troubleshooting


### `solana: command not found`

Add Solana to your PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Add this line to `~/.bashrc` or `~/.zshrc` to make it permanent.

### `anchor build` fails with `edition2024` error

Ensure Rust 1.85+:
```bash
rustup update stable
```

### `anchor build` fails with `source_file` error

Upgrade to Anchor 0.31.1:
```bash
avm install 0.31.1 && avm use 0.31.1
```

### Insufficient funds for deployment

```bash
solana airdrop 2
# If rate limited, use https://faucet.solana.com
```

### Program ID mismatch after `anchor build`

```bash
# Check the generated key
solana address -k target/deploy/warden_protocol-keypair.json

# Update all three locations if different:
# 1. Anchor.toml → [programs.devnet]
# 2. programs/warden-protocol/src/lib.rs → declare_id!
# 3. app/src/lib/program.ts → PROGRAM_ID

# Rebuild after updating
anchor build
```

### Frontend wallet connection issues

- Make sure your wallet (Phantom/Solflare) is set to **Devnet** in wallet settings
- Clear browser cache if switching between wallets
- Check browser console for errors

### Docker build fails on Windows

- Ensure Docker Desktop is running with **WSL 2 backend** enabled
- Allocate at least **4GB RAM** to Docker in Settings → Resources
- The Solana build container needs ~2GB RAM for Rust compilation

### `npm run dev` errors after fresh clone

```bash
cd app
rm -rf node_modules .next
npm install
npm run dev
```

