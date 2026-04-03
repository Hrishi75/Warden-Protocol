# Development Guide

Run the frontend, tests, and full lifecycle simulation.
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

