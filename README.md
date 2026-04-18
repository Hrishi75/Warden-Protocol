# Sentinel Protocol

**On-chain accountability and containment system for autonomous AI agents on Solana.**

Sentinel Protocol gives developers, DAOs, and protocols a structured way to monitor, freeze, penalize, and reinstate AI agents that operate with real on-chain permissions and funds.

## Documentation

- [Docs Index](docs/README.md)
- [Setup Guide](docs/setup.md)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)
- [Architecture Guide](docs/architecture.md)
- [Protocol Reference](docs/protocol.md)
- [SDK Reference](sdk/README.md)
- [Frontend Guide](docs/frontend.md)
- [Wallet-First Roadmap](docs/wallet-first-roadmap.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- [Contributing](CONTRIBUTING.md)

## SDK

The `@sentinel-protocol/sdk` package provides a complete TypeScript client for the Sentinel Protocol program. Install it from GitHub Packages:

```bash
npm install @sentinel-protocol/sdk
```

```typescript
import { SentinelClient } from "@sentinel-protocol/sdk";

const client = new SentinelClient({ connection, wallet });
await client.registerAgent(owner, agentKeypair, permissions, stakeAmount);

// Read-only access (dashboards, indexers, bots)
const reader = SentinelClient.readOnly(connection);
const agents = await reader.fetchAllAgents();
```

See the full [SDK documentation](sdk/README.md).

## Quick Start

```bash
git clone https://github.com/your-username/sentinel-protocol.git
cd sentinel-protocol
npm install
cd sdk && npm install && npm run build && cd ..
cd app && npm install && cd ..
```

Continue with [docs/setup.md](docs/setup.md) and [docs/deployment.md](docs/deployment.md).

## License

MIT
