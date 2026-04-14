# Architecture Guide

System architecture, repository layout, and account/state design.
## Architecture


```
┌─────────────────────────────────────────────────────────┐
│                    SENTINEL PROTOCOL                       │
├──────────┬──────────┬───────────┬───────────┬───────────┤
│ Register │  Arrest  │ Post Bail │ DAO Vote  │  Release  │
│  Agent   │  Agent   │           │           │  Agent    │
├──────────┴──────────┴───────────┴───────────┴───────────┤
│              Solana Program (Anchor/Rust)                 │
├─────────────────────────────────────────────────────────┤
│  AgentRecord PDA │ Cell PDA │ BailRequest │ SentinelDAO   │
└─────────────────────────────────────────────────────────┘
         │                          │
    ┌────┴────┐              ┌──────┴──────┐
    │   SDK   │              │  Frontend   │◄──┐
    │  (TS)   │              │  (Next.js)  │   │ Query/Sync
    └────┬────┘              └──────┬──────┘   │
         │                          │          │
    ┌────┴────┐              ┌──────┴──────┐   │
    │  Agent  │              │ API Routes  │   │
    │   Sim   │              │ (Next.js)   │   │
    └─────────┘              └──────┬──────┘   │
                                    │          │
                        ┌───────────┴───────┐  │
                        │                   │  │
                        ▼                   ▼  │
                 ┌─────────────┐    ┌───────────┴──┐
                 │ PostgreSQL  │    │   Indexer    │
                 │   (Prisma)  │    │  (on-chain → │
                 └─────────────┘    │      DB)     │
                                    └──────────────┘
```

---

## Project Structure


```
sentinel-protocol/
├── programs/sentinel-protocol/src/       # Solana program (Rust/Anchor)
│   ├── lib.rs                          # Program entrypoint, declare_id
│   ├── state/                          # Account structs
│   │   ├── agent.rs                    # AgentRecord, PermissionScope, Violation
│   │   ├── cell.rs                     # Cell (arrest context)
│   │   ├── bail.rs                     # BailRequest, VoteRecord, BailOutcome
│   │   └── dao.rs                      # SentinelDao, DaoMember
│   ├── instructions/                   # All 13 instructions
│   │   ├── init_dao.rs
│   │   ├── register_agent.rs
│   │   ├── arrest_agent.rs
│   │   ├── freeze_agent_token.rs
│   │   ├── post_bail.rs
│   │   ├── cast_vote.rs
│   │   ├── release_agent.rs
│   │   ├── report_violation.rs
│   │   ├── check_probation.rs
│   │   ├── process_payment.rs
│   │   ├── init_insurance_pool.rs
│   │   ├── buy_coverage.rs
│   │   ├── file_claim.rs
│   │   └── cancel_coverage.rs
│   ├── errors.rs                       # Custom error codes
│   └── constants.rs                    # PDA seeds, limits, defaults
├── app/                                # Next.js frontend + backend
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema (9 models)
│   │   └── migrations/                 # Versioned SQL migrations
│   ├── prisma.config.ts                # Prisma v7 config (datasource URL)
│   ├── src/
│   │   ├── app/                        # Pages (Next.js App Router)
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── auth/page.tsx           # Optional governance profile setup
│   │   │   ├── dashboard/page.tsx      # Command Center
│   │   │   ├── register/page.tsx       # Deploy Agent
│   │   │   ├── dao/page.tsx            # War Council (governance)
│   │   │   ├── demo/page.tsx           # Mission Simulation
│   │   │   ├── docs/page.tsx           # Intel Database
│   │   │   └── api/                    # Backend API routes
│   │   │       ├── wallet/connect/     # Wallet connect (auto-creates account)
│   │   │       ├── payments/           # Checkout, status, payout
│   │   │       ├── webhooks/dodo/      # Dodo Payments webhook handler
│   │   │       ├── profiles/           # Operative CRUD, link-wallet
│   │   │       ├── agents/             # Indexed agent queries
│   │   │       ├── bail/               # Indexed bail request queries
│   │   │       ├── indexer/run/        # On-chain indexer trigger
│   │   │       └── audit/              # Audit log queries
│   │   ├── components/                 # UI components
│   │   ├── lib/
│   │   │   ├── db.ts                   # Prisma client singleton
│   │   │   ├── payment-store.ts        # Payment persistence (Prisma)
│   │   │   ├── profile-api.ts          # Client-side profile fetch helpers
│   │   │   ├── wallet-api.ts           # Client-side wallet connect helper
│   │   │   ├── audit.ts                # Audit log utility
│   │   │   ├── program.ts              # Browser Anchor client (re-exports from SDK)
│   │   │   └── program-server.ts       # Server-side read-only client (uses SDK)
│   │   └── providers/                  # Wallet + Auth providers
│   ├── public/                         # Static assets
│   └── tailwind.config.ts              # Gaming HUD theme
├── sdk/                                # TypeScript SDK (@sentinel-protocol/sdk)
│   ├── src/
│   │   ├── index.ts                    # Barrel re-exports
│   │   ├── constants.ts                # DEFAULT_PROGRAM_ID
│   │   ├── pda.ts                      # PDA derivation helpers
│   │   ├── types.ts                    # On-chain type mirrors
│   │   ├── helpers.ts                  # Enum-to-string converters
│   │   ├── client.ts                   # SentinelClient class
│   │   ├── idl/                        # Bundled Anchor IDL
│   │   ├── instructions/               # All instruction builders
│   │   └── accounts/                   # Account fetchers
│   ├── package.json                    # Published to GitHub Packages
│   └── tsup.config.ts                  # Dual ESM + CJS build
├── agent-sim/src/                      # Agent simulation
│   ├── demo-flow.ts                    # Full lifecycle demo
│   ├── rogue-agent.ts                  # Simulated rogue AI agent
│   └── sentinel-monitor.ts            # Off-chain violation detector
├── tests/                              # Anchor integration tests
│   └── sentinel-protocol.ts
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
| `SentinelDao` | `["sentinel_dao"]` | Permanent (singleton) |
| `AgentRecord` | `["agent", agent_pubkey]` | Permanent |
| `Cell` | `["cell", agent_record_pda]` | Created on arrest, closed on release |
| `BailRequest` | `["bail", cell_pda]` | Created on bail, closed on release |
| `Vault` (stake) | `["vault", agent_record_pda]` | Holds staked SOL |
| `BailVault` | `["bail_vault", bail_request_pda]` | Holds bail SOL |
| `InsurancePool` | `["insurance_pool"]` | Permanent (singleton) |
| `InsurancePolicy` | `["insurance_policy", agent_record_pda]` | Created on coverage purchase |
| `InsuranceVault` | `["insurance_vault", insurance_pool_pda]` | Holds insurance pool funds |
| `InsuranceClaim` | `["insurance_claim", insurance_policy_pda]` | Created on claim filing |

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

## Backend (PostgreSQL + Prisma)

The frontend is paired with a Next.js API-route backend backed by PostgreSQL via Prisma v7. The backend stores off-chain data that has no place on-chain, and mirrors on-chain accounts for fast querying.

### Responsibilities

| Concern | On-Chain | Off-Chain (PostgreSQL) |
|---------|----------|------------------------|
| Agent accountability state | ✅ Source of truth | Mirrored for queries |
| Violations, bail, DAO votes | ✅ Source of truth | Mirrored for queries |
| Wallet connections | ❌ | ✅ Persistent (auto-created on connect) |
| Payment records (Dodo) | ❌ | ✅ Persistent |
| Operative profiles | ❌ | ✅ Persistent (with localStorage cache) |
| Audit logs | ❌ | ✅ Persistent |
| Webhook events | ❌ | ✅ Raw payloads for replay |

### Database Schema

| Model | Purpose |
|-------|---------|
| `WalletConnection` | Tracks wallet connections — first/last connected, connection count |
| `Payment` | DodoPay checkout records, status, amounts, agent/owner keys |
| `OperativeProfile` | Wallet address (required), plus optional callsign, faction, clearance, XP, avatar, signature |
| `LinkedWallet` | Multi-wallet support per profile |
| `AuditLog` | Action logs — actor, action, target, metadata |
| `WebhookEvent` | Raw webhook payloads (source, eventType, signature, processedAt) |
| `IndexedAgent` | Mirror of on-chain `AgentRecord` (status, stake, permissions) |
| `IndexedViolation` | Violation details linked to indexed agents |
| `IndexedBailRequest` | Mirror of on-chain `BailRequest` (outcome, votes count) |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/wallet/connect` | POST | Record wallet connection, auto-create profile, return profile + agents |
| `/api/payments/checkout` | POST | Create DodoPay checkout session, persist pending payment |
| `/api/payments/status` | GET | Poll payment status by `payment_id` |
| `/api/payments/payout` | POST | Request payout (test mode) |
| `/api/webhooks/dodo` | POST | HMAC-verified webhook handler, updates payment status |
| `/api/profiles` | GET / POST / DELETE | Operative profile CRUD (all fields optional except walletAddress) |
| `/api/profiles/link-wallet` | POST / DELETE | Link/unlink secondary wallet |
| `/api/agents` | GET | Query indexed agents (filter by status, owner) |
| `/api/agents/[id]` | GET | Single agent + violations |
| `/api/bail` | GET | Query indexed bail requests (filter by outcome, agent) |
| `/api/indexer/run` | POST | Trigger a full on-chain → DB sync |
| `/api/audit` | GET | Paginated audit log query |

### On-Chain Indexer

Since the Anchor program does not emit events (`emit!` is unused), the indexer polls on-chain accounts directly via Anchor's `program.account.*.all()`:

```
POST /api/indexer/run
  ├─ fetchAllAgentsOnChain()    → upsert IndexedAgent + IndexedViolation
  ├─ fetchAllBailRequestsOnChain() → upsert IndexedBailRequest
  └─ logAudit("indexer.run", ...)
```

The indexer uses `SentinelClient.readOnly()` from the SDK ([program-server.ts](../app/src/lib/program-server.ts)) — it never signs or submits transactions. Trigger it on page load, via cron, or manually.

### Authentication & Profile Flow

**Wallet connect = account creation.** There is no mandatory registration form. Connecting a wallet auto-creates a minimal `OperativeProfile` in the database (wallet address only). Users can optionally set up a governance profile (callsign, faction, avatar) later via `/auth`.

```
Wallet connects
  └─ POST /api/wallet/connect
       ├─ Upsert WalletConnection (tracks connection count, timestamps)
       ├─ Upsert OperativeProfile (auto-create with just walletAddress if new)
       ├─ Fetch IndexedAgents owned by this wallet
       └─ Return { connection, profile, agents }

AuthProvider receives response
  ├─ Sets operative (authenticated immediately)
  ├─ Sets walletAgents (agents owned by this wallet)
  └─ Syncs localStorage ↔ server (whichever has richer data wins)
```

**Two user paths:**

| User Type | Flow |
|-----------|------|
| Agent Owner | Connect wallet → Dashboard → Register agents (no profile setup needed) |
| Governance Participant | Connect wallet → Set up profile (callsign/faction/avatar via `/auth`) → DAO voting |

Profile fields (`callsign`, `faction`, `avatarStyle`, `signature`) are all optional in the database. The `isProfileComplete()` helper checks if all governance fields are set.

**Profile persistence (dual-write):**

```
signAndCreateProfile()     → localStorage + POST /api/profiles (with wallet signature)
saveProfile(profile)       → localStorage + POST /api/profiles
loadProfile(wallet)        → localStorage only (sync)
loadProfileAsync(wallet)   → localStorage → GET /api/profiles fallback → cache
```

### Audit Trail

Every mutation route calls `logAudit(action, actor, targetType, targetId, metadata)`. Actions follow a dotted namespace (`payment.created`, `profile.saved`, `indexer.run`, etc.) and are indexed for efficient filtering.

