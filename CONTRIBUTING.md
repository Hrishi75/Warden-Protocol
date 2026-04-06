# Contributing

Thanks for helping improve Sentinel Protocol.

## Before You Start

1. Read setup and workflow docs: [docs/setup.md](docs/setup.md), [docs/development.md](docs/development.md)
2. Review architecture and protocol docs: [docs/architecture.md](docs/architecture.md), [docs/protocol.md](docs/protocol.md)
3. Check open issues/tasks and avoid duplicate work.

## Development Workflow

1. Create a branch from `main` for each change.
2. Keep changes focused and small.
3. Run relevant checks before opening a PR:

```bash
# Program + integration tests
anchor test

# Optional: run against devnet
anchor test --provider.cluster devnet --skip-local-validator

# Frontend checks
cd app
npm run build
```

## Pull Request Guidelines

1. Explain what changed and why.
2. Include test evidence (commands + outcome).
3. Add screenshots/GIFs for UI changes.
4. Update docs when behavior or setup changes.

## Commit Message Tips

Use clear, action-oriented messages, for example:

- `docs: split README into topic-based guides`
- `fix(program): validate bail minimum before transfer`
- `feat(app): add DAO vote status indicator`

## Code Style

- Follow existing patterns in each module.
- Prefer explicit names over short/ambiguous identifiers.
- Keep functions focused and add comments only where logic is non-obvious.

## Reporting Bugs

When opening a bug report, include:

1. Environment (OS, Solana CLI, Anchor version, Node version)
2. Exact command(s) run
3. Full error output
4. Steps to reproduce

## Security

Do not publish secrets, wallet seed phrases, or private keys in issues/PRs.
