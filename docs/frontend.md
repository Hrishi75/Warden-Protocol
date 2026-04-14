# Frontend Guide

Frontend routes, onboarding flow, and client-side stack.

## Frontend Pages

The frontend uses a cyberpunk/HUD theme with wallet-first onboarding.

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Mission Control hero, network visualization, protocol activity |
| `/dashboard` | Safety Dashboard | Default post-connect experience with personal risk overview and network state |
| `/register` | Register Agent | Main first action for owners: deploy an agent with bond and guardrails |
| `/agents/[id]` | Agent Safety Passport | Interpretable trust page for one agent: status, limits, history, insurance |
| `/auth` | Governance Profile | Optional callsign/faction/avatar setup for governance and reviewer identity |
| `/profile` | Governance Profile Detail | Manage linked wallets, identity fields, and account reputation |
| `/dao` | War Council | Governance surfaces for profile-complete users |
| `/demo` | Mission Simulation | Step-by-step lifecycle demo |
| `/docs` | Intel Database | Protocol documentation with classified document theme |

All protected pages require wallet connection. Profile setup is optional and only matters for governance, public identity, and reviewer credibility.

---

## Onboarding Model

Sentinel now follows a **wallet connect = account creation** model.

### Default Journey

1. User connects Phantom or Solflare
2. Backend auto-creates a lightweight account record on first connect
3. User lands directly on the Safety Dashboard
4. User registers or inspects agents immediately
5. User optionally completes a profile later for governance and social trust features

### Product Rules

- Basic safety features must work for wallet-only users
- Agent registration must not require callsign, faction, or avatar
- Governance participation can require completed profile fields later
- Public reviewer reputation is earned through the optional profile path, not forced during onboarding

---

## Dashboard Priorities

The default dashboard should answer these questions immediately:

- Do I already have agents?
- Which of my agents look risky?
- Which ones are uninsured or have violations?
- What should I do next?

Core sections:

- `My Agents Risk Overview`
- `Recommended Actions`
- `Watchlist Alerts`
- `Network Overview`

If the wallet has no agent yet, the dashboard should emphasize:

- `Register First Agent`
- `How Sentinel Protects You`
- `Complete Profile for Governance` as a secondary path

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Anchor |
| Blockchain | Solana Devnet |
| Frontend | Next.js App Router |
| Styling | Tailwind CSS + custom HUD theme |
| Animations | Framer Motion |
| Wallet | `@solana/wallet-adapter` |
| Auth | Wallet connection + optional signed profile |
| Persistence | Prisma + PostgreSQL |
| Agent Simulation | TypeScript |
| SDK | `@sentinel-protocol/sdk` — TypeScript client with `SentinelClient` class, published to GitHub Packages |

The frontend imports all on-chain interaction logic (instruction builders, account fetchers, PDA helpers) from the SDK via `app/src/lib/program.ts`, which re-exports SDK functions with app-specific defaults. Server-side read-only access uses `SentinelClient.readOnly()` in `app/src/lib/program-server.ts`.

See the [SDK README](../sdk/README.md) for the full API reference.
