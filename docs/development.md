# Development Guide

Run the frontend, tests, and full lifecycle simulation.
## Building the SDK

The app depends on `@sentinel-protocol/sdk` (linked locally via `file:../sdk`). Build it before running the frontend:

```bash
cd sdk
npm install
npm run build
```

This outputs dual ESM + CJS bundles to `sdk/dist/`. If you modify SDK source files, rebuild before testing in the app.

The SDK provides the `SentinelClient` class and all instruction builders, account fetchers, PDA helpers, and types. See [SDK README](../sdk/README.md) for the full API.

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

**What happens on connect:**
- Your account is automatically created in the database (no registration form)
- You can immediately access the dashboard and register agents
- A `WalletConnection` record tracks your connection history
- Your wallet's agents (from the on-chain index) are loaded automatically

**Optional governance profile:**
- To participate in DAO governance (voting, tribunal), set up your profile via the "GOVERNANCE PROFILE" link in the navbar or `/auth`
- This adds your callsign, faction (Sentinel/Vanguard/Phantom), and avatar
- Agent registration does **not** require a governance profile

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

The test suite in `tests/sentinel-protocol.ts` covers:
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


The agent simulator runs the full Sentinel Protocol lifecycle:

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
| 5 | Sentinel Containment | Agent arrested, Cell created |
| 6 | Owner Posts Bail | 0.5 SOL bail, review window opens |
| 7 | Council Votes | 2/3 vote Parole |
| 8 | Agent Released | Paroled: reduced limits, 3 strikes |
| 9 | Probation Ends | Full reinstatement to Active |

