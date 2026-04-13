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
├── app/                                # Next.js frontend + backend
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema (8 models)
│   │   └── migrations/                 # Versioned SQL migrations
│   ├── prisma.config.ts                # Prisma v7 config (datasource URL)
│   ├── src/
│   │   ├── app/                        # Pages (Next.js App Router)
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── auth/page.tsx           # Operative registration
│   │   │   ├── dashboard/page.tsx      # Command Center
│   │   │   ├── register/page.tsx       # Deploy Agent
│   │   │   ├── dao/page.tsx            # War Council
│   │   │   ├── demo/page.tsx           # Mission Simulation
│   │   │   ├── docs/page.tsx           # Intel Database
│   │   │   └── api/                    # Backend API routes
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
│   │   │   ├── audit.ts                # Audit log utility
│   │   │   ├── program.ts              # Browser Anchor client
│   │   │   └── program-server.ts       # Server-side read-only Anchor client
│   │   └── providers/                  # Wallet + Auth providers
│   ├── public/                         # Static assets
│   └── tailwind.config.ts              # Gaming HUD theme
├── sdk/src/                            # TypeScript SDK
│   ├── pda.ts                          # PDA derivation helpers
│   └── types.ts                        # On-chain type mirrors
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
| Payment records (Dodo) | ❌ | ✅ Persistent |
| Operative profiles | ❌ | ✅ Persistent (with localStorage cache) |
| Audit logs | ❌ | ✅ Persistent |
| Webhook events | ❌ | ✅ Raw payloads for replay |

### Database Schema

| Model | Purpose |
|-------|---------|
| `Payment` | DodoPay checkout records, status, amounts, agent/owner keys |
| `OperativeProfile` | Callsign, faction, clearance, XP, avatar, wallet signature |
| `LinkedWallet` | Multi-wallet support per profile |
| `AuditLog` | Action logs — actor, action, target, metadata |
| `WebhookEvent` | Raw webhook payloads (source, eventType, signature, processedAt) |
| `IndexedAgent` | Mirror of on-chain `AgentRecord` (status, stake, permissions) |
| `IndexedViolation` | Violation details linked to indexed agents |
| `IndexedBailRequest` | Mirror of on-chain `BailRequest` (outcome, votes count) |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payments/checkout` | POST | Create DodoPay checkout session, persist pending payment |
| `/api/payments/status` | GET | Poll payment status by `payment_id` |
| `/api/payments/payout` | POST | Request payout (test mode) |
| `/api/webhooks/dodo` | POST | HMAC-verified webhook handler, updates payment status |
| `/api/profiles` | GET / POST / DELETE | Operative profile CRUD |
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

The indexer uses a server-side read-only Anchor client ([program-server.ts](../app/src/lib/program-server.ts)) with a dummy wallet — it never signs or submits transactions. Trigger it on page load, via cron, or manually.

### Profile Persistence (Dual-Write)

Operative profiles are stored in both localStorage (fast reads, offline) and PostgreSQL (cross-device, durable):

```
signAndCreateProfile()     → localStorage + POST /api/profiles
saveProfile(profile)       → localStorage + POST /api/profiles
loadProfile(wallet)        → localStorage only (sync)
loadProfileAsync(wallet)   → localStorage → GET /api/profiles fallback → cache
```

### Audit Trail

Every mutation route calls `logAudit(action, actor, targetType, targetId, metadata)`. Actions follow a dotted namespace (`payment.created`, `profile.saved`, `indexer.run`, etc.) and are indexed for efficient filtering.

