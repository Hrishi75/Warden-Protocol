# Setup Guide

Use this guide for prerequisites and local/Docker installation.
## Prerequisites


| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | v18+ | Frontend & tests |
| [Rust](https://rustup.rs/) | 1.85+ | Compile Solana program |
| [Solana CLI](https://docs.solanalabs.com/cli/install) | v1.18+ | Wallet, deploy, airdrop |
| [Anchor CLI](https://www.anchor-lang.com/docs/installation) | 0.31.1 | Build & deploy framework |
| [Docker](https://docs.docker.com/get-docker/) | 20+ | *(Optional)* Containerized setup |

> **Windows Users:** Solana CLI does not run natively on Windows. You have two options:
> 1. **Docker (Recommended)** — No native installs needed, everything runs in containers
> 2. **WSL2** — Install Ubuntu via WSL and run all `solana` / `anchor` commands inside it

---

## Installation


### 1. Clone the Repository

```bash
git clone https://github.com/your-username/warden-protocol.git
cd warden-protocol
```

### 2. Install Dependencies

```bash
# Root dependencies (Anchor tests, SDK)
npm install

# Frontend dependencies
cd app && npm install && cd ..
```

---

## Docker Setup (Recommended)


Docker lets you build, deploy, and run everything without installing Rust, Solana CLI, or Anchor locally. Three profiles are available:

### Option A: Frontend Dev Mode (Hot Reload)

Best for frontend development. Mounts your local `app/` folder with live reload.

```bash
docker compose --profile dev up
```

- Opens at **http://localhost:3000**
- Edits to `app/` are reflected instantly
- No build step needed

### Option B: Production Frontend

Builds an optimized Next.js production image.

```bash
docker compose --profile app up --build
```

- Serves at **http://localhost:3000**
- Multi-stage build (deps → build → slim Alpine runner)
- ~87MB final image

### Option C: Deploy Solana Program

Builds the Rust program and deploys to Solana devnet inside a container.

```bash
docker compose --profile deploy up --build
```

What it does:
1. Installs Rust, Solana CLI (v1.18.26), and Anchor (0.31.1)
2. Generates a wallet keypair (or uses a mounted one)
3. Airdrops devnet SOL if balance is low
4. Runs `anchor build`
5. Deploys to devnet
6. Prints the Program ID and Solana Explorer link

### Option D: Full Stack (Deploy + Frontend)

```bash
docker compose --profile full up --build
```

Runs both the Solana deployer and the production frontend.

### Docker Volumes

| Volume | Purpose |
|--------|---------|
| `wallet-data` | Persists wallet keypair between container runs |
| `shared-data` | Shares IDL from deployer to frontend |
| `cargo-cache` | Caches Rust dependencies (speeds up rebuilds) |
| `target-cache` | Caches build artifacts |
| `dev-node-modules` | Isolated node_modules for dev container |

### Using Your Own Wallet

To use an existing wallet keypair instead of a generated one:

```bash
# Create the wallet directory and copy your key
mkdir -p ./wallet
cp ~/.config/solana/id.json ./wallet/id.json
```

Then mount it in `docker-compose.yml` under the `solana` service:

```yaml
volumes:
  - ./wallet:/warden/wallet
```

### Docker Files

```
warden-protocol/
├── docker-compose.yml              # Orchestrates all services
├── .dockerignore                    # Excludes node_modules, target, .next
└── docker/
    ├── solana/
    │   ├── Dockerfile               # Rust + Solana CLI + Anchor
    │   └── entrypoint.sh            # Build → airdrop → deploy script
    └── frontend/
        └── Dockerfile               # Multi-stage Next.js production build
```

---

## Manual Setup


If you prefer installing everything locally (Linux/macOS or WSL on Windows):

### Step 1: Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustup update stable
```

Verify:
```bash
rustc --version   # Should be 1.85+
```

### Step 2: Install Solana CLI

**Linux/macOS/WSL:**
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

**Windows (PowerShell):**
```powershell
irm https://release.anza.xyz/stable/install-init.ps1 | iex
```

Restart your terminal, then verify:
```bash
solana --version
```

### Step 3: Install Anchor CLI

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli --locked
```

Or using AVM (Anchor Version Manager):
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.31.1
avm use 0.31.1
```

Verify:
```bash
anchor --version   # Should be 0.31.1
```

### Step 4: Create a Solana Wallet

```bash
# Generate a new keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Save the seed phrase somewhere safe!
```

Your wallet address will be printed. Save it — you'll need it for airdrops.

### Step 5: Configure for Devnet

```bash
# Set network to devnet
solana config set --url devnet

# Set your keypair as default
solana config set --keypair ~/.config/solana/id.json

# Verify config
solana config get
```

Expected output:
```
Config File: ~/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/
Keypair Path: ~/.config/solana/id.json
Commitment: confirmed
```

### Step 6: Get Devnet SOL

You need ~4 SOL for deployment and testing.

```bash
# Airdrop 2 SOL (run multiple times if needed)
solana airdrop 2
solana airdrop 2

# Check balance
solana balance
```

If airdrops fail (rate limited), use the web faucet:
1. Go to https://faucet.solana.com
2. Paste your wallet address
3. Select "Devnet"
4. Request SOL

