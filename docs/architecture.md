# Architecture Guide

System architecture, repository layout, and account/state design.
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

