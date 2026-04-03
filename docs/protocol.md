# Protocol Reference

Instruction-level behavior, account models, and governance/economic mechanics.
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

## What Makes It Novel


- First agent-native accountability primitive on Solana
- Stake-slashing creates real economic consequences for bad agent behavior
- Parole mode is a genuinely new primitive — not binary freeze/unfreeze
- Composable — any protocol can integrate Warden to govern their agents
- Directly addresses the biggest unsolved problem in the agentic AI stack

