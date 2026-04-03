# Frontend Guide

Frontend routes, auth flow, and client-side stack.
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

