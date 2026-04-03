# Warden Protocol

**On-chain accountability and containment system for autonomous AI agents on Solana.**

Warden Protocol gives developers, DAOs, and protocols a structured way to monitor, freeze, penalize, and reinstate AI agents that operate with real on-chain permissions and funds — creating a justice system for autonomous AI rather than just a kill switch.

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup (Recommended)](#docker-setup-recommended)
- [Manual Setup](#manual-setup)
- [Deploying the Program](#deploying-the-program)
- [Running the Frontend](#running-the-frontend)
- [Running Tests](#running-tests)
- [Running the Demo Simulation](#running-the-demo-simulation)
- [Program ID](#program-id)
- [Project Structure](#project-structure)
- [PDA Derivation Map](#pda-derivation-map)
- [State Machine](#state-machine)
- [Core Instructions](#core-instructions)
- [Instruction Reference](#instruction-reference)
- [Account Structures](#account-structures)
- [Stake Economics](#stake-economics)
- [Token Freezing](#token-freezing)
- [Voting Mechanism](#voting-mechanism)
- [Frontend Pages](#frontend-pages)
- [Custom Auth System](#custom-auth-system)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WARDEN PROTOCOL                       │
├──────────┬──────────┬───────────┬───────────┬───────────┤
│ Register │  Arrest  │ Post Bail │ DAO Vote  │  Release  │
│  Agent   │  Agent   │           │           │  Agent    │
├──────────┴──────────┴───────────┴───────────┴───────────┤
│              Solana Program (Anchor/Rust)                 │
├─────────────────────────────────────────────────────────┤
│  AgentRecord PDA │ Cell PDA │ BailRequest │ WardenDAO   │
└─────────────────────────────────────────────────────────┘
         │                          │
    ┌────┴────┐              ┌──────┴──────┐
    │   SDK   │              │  Frontend   │
    │  (TS)   │              │  (Next.js)  │
    └────┬────┘              └─────────────┘
         │
    ┌────┴────┐
    │  Agent  │
    │   Sim   │
    └─────────┘
```

---

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

---

## Deploying the Program

### Step 1: Build

```bash
anchor build
```

This produces:
- `target/deploy/warden_protocol.so` — Deployable BPF binary
- `target/deploy/warden_protocol-keypair.json` — Program keypair
- `target/idl/warden_protocol.json` — IDL for client generation
- `target/types/warden_protocol.ts` — TypeScript types

### Step 2: Verify Program ID

```bash
solana address -k target/deploy/warden_protocol-keypair.json
```

This should output:
```
5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa
```

If it's **different**, update the ID in three places:

| File | Location |
|------|----------|
| `Anchor.toml` | Line 8: `warden_protocol = "YOUR_ID"` |
| `programs/warden-protocol/src/lib.rs` | Line 11: `declare_id!("YOUR_ID")` |
| `app/src/lib/program.ts` | Line 7-9: `PROGRAM_ID = new PublicKey("YOUR_ID")` |

Then rebuild: `anchor build`

### Step 3: Deploy

```bash
anchor deploy
```

Expected output:
```
Deploying program "warden_protocol"...
Program Id: 5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa
Deploy success
```

### Step 4: Verify on Explorer

Open in browser:
```
https://explorer.solana.com/address/5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa?cluster=devnet
```

### Upgrading an Existing Deployment

```bash
anchor upgrade target/deploy/warden_protocol.so \
  --program-id 5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa \
  --provider.cluster devnet
```

---

## Running the Frontend

### Development Mode

```bash
cd app
npm run dev
```

Opens at **http://localhost:3000** with hot reload.

### Production Build

```bash
cd app
npm run build
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Solana cluster |
| `NEXT_PUBLIC_RPC_ENDPOINT` | `https://api.devnet.solana.com` | RPC endpoint |

### Connecting Your Wallet

1. Install [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/) browser extension
2. Open wallet settings → **Switch to Devnet**
3. Open http://localhost:3000
4. Click "Select Wallet" in the top nav
5. Approve the connection

---

## Running Tests

### Full Test Suite (with local validator)

```bash
anchor test
```

This spins up a local Solana validator, deploys the program, runs all tests, and shuts down.

### Against Devnet (skip local validator)

```bash
anchor test --provider.cluster devnet --skip-local-validator
```

### Test Coverage

The test suite in `tests/warden-protocol.ts` covers:
1. DAO initialization with members and config
2. Agent registration with stake bond
3. Agent arrest with violation evidence
4. Bail posting and review window
5. DAO voting (stake-weighted, eager-tally)
6. Agent release (reinstate, parole, terminate)
7. Parole violation reporting
8. Probation completion and reinstatement

---

## Running the Demo Simulation

The agent simulator runs the full Warden Protocol lifecycle:

```bash
cd agent-sim
npm install
npx ts-node src/demo-flow.ts
```

### Demo Steps

| Step | Action | Result |
|------|--------|--------|
| 1 | Initialize DAO | 3 council members, 51% threshold |
| 2 | Deploy AI Agent | 1 SOL bond, 0.1 SOL transfer limit |
| 3 | Normal Operations | 3 transfers within limits |
| 4 | Agent Goes Rogue | 0.5 SOL transfer (5x the limit) |
| 5 | Warden Containment | Agent arrested, Cell created |
| 6 | Owner Posts Bail | 0.5 SOL bail, review window opens |
| 7 | Council Votes | 2/3 vote Parole |
| 8 | Agent Released | Paroled: reduced limits, 3 strikes |
| 9 | Probation Ends | Full reinstatement to Active |

---

## Program ID

```
5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa
```

Defined in:
- `programs/warden-protocol/src/lib.rs` — `declare_id!` macro
- `app/src/lib/program.ts` — Frontend `PROGRAM_ID`
- `Anchor.toml` — Anchor config

---

## Project Structure

```
warden-protocol/
├── programs/warden-protocol/src/       # Solana program (Rust/Anchor)
│   ├── lib.rs                          # Program entrypoint, declare_id
│   ├── state/                          # Account structs
│   │   ├── agent.rs                    # AgentRecord, PermissionScope, Violation
│   │   ├── cell.rs                     # Cell (arrest context)
│   │   ├── bail.rs                     # BailRequest, VoteRecord, BailOutcome
│   │   └── dao.rs                      # WardenDao, DaoMember
│   ├── instructions/                   # All 9 instructions
│   │   ├── init_dao.rs
│   │   ├── register_agent.rs
│   │   ├── arrest_agent.rs
│   │   ├── freeze_agent_token.rs
│   │   ├── post_bail.rs
│   │   ├── cast_vote.rs
│   │   ├── release_agent.rs
│   │   ├── report_violation.rs
│   │   └── check_probation.rs
│   ├── errors.rs                       # Custom error codes
│   └── constants.rs                    # PDA seeds, limits, defaults
├── app/                                # Next.js frontend
│   ├── src/
│   │   ├── app/                        # Pages (Next.js App Router)
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── auth/page.tsx           # Operative registration
│   │   │   ├── dashboard/page.tsx      # Command Center
│   │   │   ├── register/page.tsx       # Deploy Agent
│   │   │   ├── dao/page.tsx            # War Council
│   │   │   ├── demo/page.tsx           # Mission Simulation
│   │   │   └── docs/page.tsx           # Intel Database
│   │   ├── components/                 # UI components
│   │   ├── lib/                        # Program client, auth logic
│   │   └── providers/                  # Wallet + Auth providers
│   ├── public/                         # Static assets
│   └── tailwind.config.ts              # Gaming HUD theme
├── sdk/src/                            # TypeScript SDK
│   ├── pda.ts                          # PDA derivation helpers
│   └── types.ts                        # On-chain type mirrors
├── agent-sim/src/                      # Agent simulation
│   ├── demo-flow.ts                    # Full lifecycle demo
│   ├── rogue-agent.ts                  # Simulated rogue AI agent
│   └── warden-monitor.ts              # Off-chain violation detector
├── tests/                              # Anchor integration tests
│   └── warden-protocol.ts
├── docker/                             # Docker configuration
│   ├── solana/Dockerfile               # Rust + Solana + Anchor
│   ├── solana/entrypoint.sh            # Deploy automation script
│   └── frontend/Dockerfile             # Multi-stage Next.js build
├── docker-compose.yml                  # Container orchestration
├── Anchor.toml                         # Anchor config (devnet)
├── Cargo.toml                          # Rust workspace
└── package.json                        # Root Node.js dependencies
```

---

## PDA Derivation Map

| Account | Seeds | Lifetime |
|---------|-------|----------|
| `WardenDao` | `["warden_dao"]` | Permanent (singleton) |
| `AgentRecord` | `["agent", agent_pubkey]` | Permanent |
| `Cell` | `["cell", agent_record_pda]` | Created on arrest, closed on release |
| `BailRequest` | `["bail", cell_pda]` | Created on bail, closed on release |
| `Vault` (stake) | `["vault", agent_record_pda]` | Holds staked SOL |
| `BailVault` | `["bail_vault", bail_request_pda]` | Holds bail SOL |

---

## State Machine

```
                   register_agent
                        │
                        ▼
                    ┌────────┐
         ┌────────→│ Active │←──── check_probation
         │         └────┬───┘      (probation ended)
         │              │
         │         arrest_agent
         │              │
         │              ▼
         │         ┌──────────┐
         │         │ Arrested │
         │         └────┬─────┘
         │              │
         │          post_bail
         │              │
         │              ▼
         │         ┌──────────────┐
         │         │ Bail Pending │◄── cast_vote (until threshold)
         │         └──────┬───────┘
         │                │
         │           release_agent
         │          ┌─────┼─────┐
         │          ▼     ▼     ▼
         │     Released Paroled Terminated
         │        │       │        │
         └────────┘       │     (slash + freeze)
         │                ▼
         │          ┌──────────┐
         │          │ Paroled  │
         │          └────┬─────┘
         │               │
         │       report_violation
         │          (strikes > 0)
         │               │
         │        strikes == 0 ──→ Arrested (auto re-arrest)
         │               │
         └── check_probation
              (period ended)
```

---

## Core Instructions

| Instruction | Description |
|-------------|-------------|
| `init_dao` | Initialize the Warden DAO with members, voting threshold, and config |
| `register_agent` | Onboard an AI agent with staked SOL bond and permission scope |
| `arrest_agent` | Freeze an agent — sets status to Arrested, creates Cell, logs violation |
| `freeze_agent_token` | Freeze an agent's SPL token accounts via CPI |
| `post_bail` | Owner stakes additional SOL to open an appeal/review window |
| `cast_vote` | DAO member votes on bail request (Release / Parole / Terminate) |
| `release_agent` | Execute voting outcome — reinstate, parole, or terminate + slash |
| `report_violation` | Report a parole violation, auto re-arrest at zero strikes |
| `check_probation` | Check if probation ended, auto-reinstate to Active |

---

## Instruction Reference

### init_dao

Initializes the Warden DAO singleton. Must be called once before any other instruction.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `vote_threshold` | `u8` | Percentage of stake needed to resolve a vote (e.g., 51) |
| `review_window_seconds` | `i64` | Duration of the bail review window in seconds |
| `min_bail_lamports` | `u64` | Minimum bail amount in lamports |
| `slash_percentage` | `u8` | Percentage of stake slashed on termination |
| `initial_members` | `Vec<DaoMember>` | Initial DAO jury members with wallets and stakes |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `authority` | `Signer` | DAO initializer (becomes authority) |
| `warden_dao` | `Account<WardenDao>` | PDA `["warden_dao"]` — initialized |
| `treasury` | `UncheckedAccount` | Treasury to receive slashed funds |
| `system_program` | `Program<System>` | System program |

### register_agent

Registers an AI agent on-chain with a staked SOL bond.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `permissions` | `PermissionScope` | Max transfer, allowed programs, daily tx limit |
| `stake_amount` | `u64` | SOL to lock as accountability bond (lamports) |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `owner` | `Signer` | Agent owner who pays for registration |
| `agent_identity` | `Signer` | Agent's keypair (proves ownership) |
| `agent_record` | `Account<AgentRecord>` | PDA `["agent", agent_pubkey]` — initialized |
| `vault` | `SystemAccount` | PDA `["vault", agent_record]` — receives stake |
| `system_program` | `Program<System>` | System program |

### arrest_agent

Arrests an active or paroled agent. Creates a Cell account and logs the violation.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `reason` | `String` | Human-readable arrest reason (max 256 chars) |
| `evidence_hash` | `[u8; 32]` | SHA-256 hash of off-chain evidence |
| `violation_type` | `ViolationType` | Category of violation |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `arrester` | `Signer` | Must be a DAO member or the agent owner |
| `agent_record` | `Account<AgentRecord>` | Must be Active or Paroled |
| `cell` | `Account<Cell>` | PDA `["cell", agent_record]` — initialized |
| `warden_dao` | `Account<WardenDao>` | DAO config for member validation |
| `token_program` | `Program<Token>` | SPL Token program |
| `system_program` | `Program<System>` | System program |

**Effects:** Agent status → `Arrested`, violation added to rap sheet, Cell created, parole terms cleared.

### freeze_agent_token

Freezes an arrested agent's SPL token account via CPI to the Token Program.

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `authority` | `Signer` | Caller |
| `agent_record` | `Account<AgentRecord>` | Must be Arrested |
| `cell` | `Account<Cell>` | Associated Cell account |
| `warden_dao` | `Account<WardenDao>` | Signs as freeze authority |
| `token_account` | `Account<TokenAccount>` | Token account to freeze |
| `mint` | `Account<Mint>` | Token mint |
| `token_program` | `Program<Token>` | SPL Token program |

### post_bail

Owner stakes additional SOL to open an appeal review window.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `bail_amount` | `u64` | SOL to post as bail (lamports, must be >= min_bail) |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `owner` | `Signer` | Must be the agent's owner |
| `agent_record` | `Account<AgentRecord>` | Must be Arrested |
| `cell` | `Account<Cell>` | Must not have bail already posted |
| `bail_request` | `Account<BailRequest>` | PDA `["bail", cell]` — initialized |
| `bail_vault` | `SystemAccount` | PDA `["bail_vault", bail_request]` — receives bail |
| `warden_dao` | `Account<WardenDao>` | For min_bail and review window config |
| `system_program` | `Program<System>` | System program |

**Effects:** BailRequest created with review deadline, bail SOL transferred to vault, Cell marked as `bail_posted = true`.

### cast_vote

DAO member votes on a pending bail request. Uses eager-tally — resolves immediately when threshold is met.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `decision` | `BailOutcome` | `Released`, `Paroled`, or `Terminated` |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `voter` | `Signer` | Must be an active DAO member |
| `bail_request` | `Account<BailRequest>` | Must be Pending |
| `cell` | `Account<Cell>` | Associated Cell |
| `agent_record` | `Account<AgentRecord>` | Associated agent |
| `warden_dao` | `Account<WardenDao>` | For member validation and threshold |

### release_agent

Executes the resolved voting outcome.

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `authority` | `Signer` | Any caller (outcome already decided) |
| `agent_record` | `Account<AgentRecord>` | Must be Arrested |
| `cell` | `Account<Cell>` | Closed after release |
| `bail_request` | `Account<BailRequest>` | Must not be Pending; closed after release |
| `bail_vault` | `SystemAccount` | Bail funds source |
| `stake_vault` | `SystemAccount` | Agent stake source |
| `owner` | `SystemAccount` | Receives returned bail/stake |
| `warden_dao` | `Account<WardenDao>` | For slash config |
| `treasury` | `SystemAccount` | Receives slashed funds |
| `system_program` | `Program<System>` | System program |

**Outcome Effects:**

| Outcome | Status | Bail | Stake | Accounts |
|---------|--------|------|-------|----------|
| Released | → Active | Returned to owner | Untouched | Cell + BailRequest closed |
| Paroled | → Paroled | Returned to owner | Untouched | Cell + BailRequest closed |
| Terminated | → Terminated | Sent to treasury | Slashed to treasury | Cell + BailRequest closed |

### report_violation

Reports a parole violation. Decrements strikes and may trigger auto re-arrest.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `violation_type` | `ViolationType` | Category of violation |
| `evidence_hash` | `[u8; 32]` | SHA-256 hash of evidence |
| `description` | `String` | Description (max 128 chars) |

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `reporter` | `Signer` | Must be a DAO member or agent owner |
| `agent_record` | `Account<AgentRecord>` | Must be Paroled |
| `warden_dao` | `Account<WardenDao>` | For member validation |
| `system_program` | `Program<System>` | System program |

**Effects:** Violation added to rap sheet, `strikes_remaining` decremented. If strikes reach 0 → auto re-arrest.

### check_probation

Checks if an agent's probation period has ended and reinstates them.

**Accounts:**
| Name | Type | Description |
|------|------|-------------|
| `caller` | `Signer` | Any caller |
| `agent_record` | `Account<AgentRecord>` | Must be Paroled |

**Effects:** If `clock.unix_timestamp >= probation_end` → status set to `Active`, parole terms cleared.

---

## Account Structures

### AgentRecord — `PDA["agent", agent_pubkey]`

Stores the full state of a registered AI agent:
- Identity, owner, stake amount
- Status: `Active` | `Arrested` | `Paroled` | `Terminated`
- Permission scope (transfer limits, allowed programs, rate limits)
- Violation history (rap sheet)
- Parole terms (if on parole)

### Cell — `PDA["cell", agent_record]`

Created when an agent is arrested. Stores arrest context:
- Who triggered the arrest and why
- Evidence hash, timestamp
- Frozen token account references

### BailRequest — `PDA["bail", cell]`

Created when the owner posts bail:
- Bail amount, review deadline
- Vote records with stake-weighted tallies
- Outcome: `Pending` | `Released` | `Paroled` | `Terminated`

### WardenDAO — `PDA["warden_dao"]` (singleton)

DAO configuration:
- Member list with stakes
- Vote threshold, review window, minimum bail
- Slash percentage, treasury address

---

## Stake Economics

| Event | Stake Effect |
|-------|-------------|
| Registration | SOL locked in vault PDA |
| Arrest | Stake frozen (no movement) |
| Release (full) | Stake remains, bail returned to owner |
| Release (parole) | Stake remains, bail returned to owner |
| Termination | `slash_percentage` of stake sent to DAO treasury, remainder returned |
| Bail posted | Additional SOL locked in bail vault |
| Bail slashed | On termination, bail sent to treasury |

---

## Token Freezing

When an agent is arrested, its SPL token accounts can be frozen:

1. At registration, agent token accounts are created under mints where the Warden DAO PDA is the **freeze authority**
2. On arrest, `freeze_agent_token` issues a CPI to `spl_token::freeze_account`
3. On release, a corresponding `thaw_account` CPI unfreezes the accounts
4. If terminated, accounts remain frozen permanently

---

## Voting Mechanism

Voting uses an eager-tally approach:

1. Each `cast_vote` call records the vote with stake-weighted power
2. After recording, the instruction tallies all votes for each outcome
3. If any outcome reaches `vote_threshold`% of total active member stake, the `BailOutcome` is resolved immediately
4. No separate finalize step is needed

---

## Frontend Pages

The frontend uses a cyberpunk/HUD gaming theme with military-operative language.

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Mission Control hero, live network graph, activity feed, protocol stats |
| `/auth` | Operative Registration | Custom auth: wallet signature + callsign/faction/avatar profile |
| `/dashboard` | Command Center | Agent overview, operative card, radar scan, stat cards |
| `/register` | Deploy Agent | Form to register new agent with bond and permission scope |
| `/dao` | War Council | DAO members, tribunal votes, protocol config tabs |
| `/demo` | Mission Simulation | Step-by-step lifecycle demo with status progression |
| `/docs` | Intel Database | Protocol documentation with classified document theme |

All protected pages require wallet connection + operative registration via the AuthGuard component.

---

## Custom Auth System

Warden Protocol uses a **wallet-based identity system** called "Operative Identity" — no backend required.

### How It Works

1. User connects Phantom/Solflare wallet
2. User fills out a profile: callsign, faction, avatar
3. Wallet signs a structured message (proves ownership)
4. Profile is saved to localStorage keyed by wallet address
5. Protected routes check for both wallet connection and signed profile

### Factions

| Faction | Color | Description |
|---------|-------|-------------|
| Sentinel | Cyan | Defensive operatives — monitors and guardians |
| Vanguard | Orange | Offensive operatives — first responders |
| Phantom | Purple | Covert operatives — intelligence and recon |

### Progression

- **XP System**: Actions earn experience points
- **Clearance Levels**: L1 (Recruit) → L2 (Operative) → L3 (Agent) → L4 (Commander) → L5 (Director)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Anchor 0.31.1 (Rust) |
| Blockchain | Solana Devnet |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS 3.4 + custom HUD theme |
| Animations | Framer Motion |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Auth | Wallet message signing + localStorage |
| Agent Simulation | TypeScript (Node.js) |
| SDK | TypeScript |
| Containerization | Docker + Docker Compose |

---

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

---

## What Makes It Novel

- First agent-native accountability primitive on Solana
- Stake-slashing creates real economic consequences for bad agent behavior
- Parole mode is a genuinely new primitive — not binary freeze/unfreeze
- Composable — any protocol can integrate Warden to govern their agents
- Directly addresses the biggest unsolved problem in the agentic AI stack

---

## License

MIT
