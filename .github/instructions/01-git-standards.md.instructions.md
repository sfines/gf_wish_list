---
applyTo: '**'
---

# Git Standards Instructions

## Overview

All code changes in this project must follow Git Flow workflow and Conventional Commits standards.

## Branch Naming

- **Production:** `main`
- **Development:** `develop`
- **Feature:** `feature/<issue_id>-<issue-short-desc>`
- **Bugfix:** `bugfix/<issue_id>-<issue-short-desc>`
- **Release:** `release/<version>`
- **Hotfix:** `hotfix/<issue_id>-<issue-short-desc>`
- **Support:** `support/<version>`

## Development Rules

- Only develop in `feature/*` or `bugfix/*` branches
- Never commit directly to `main` or `develop`
- Release, hotfix, and support branches are idempotent snapshots

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring (no functional change)
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Build system or dependencies
- `ci:` CI/CD configuration
- `chore:` Maintenance tasks

### Examples

```bash
feat(dice-roller): add support for advantage/disadvantage rolls

fix(room-manager): prevent duplicate player entries

test(dice-engine): add unit tests for complex formulas

refactor(socket): extract room state validation logic
```

## Commit Best Practices

### DO:

- ✅ Keep commits focused on a single change
- ✅ Commit early and often (multiple times per day)
- ✅ Push commits daily at minimum
- ✅ Follow existing code patterns
- ✅ Write clear, descriptive commit messages
- ✅ Separate concerns: logic, formatting, refactoring, dependencies

### DON'T:

- ❌ Mix logic and formatting changes
- ❌ Mix logic and refactoring changes
- ❌ Mix logic and dependency updates
- ❌ Create large, cross-functional commits
- ❌ Leave commits unpushed overnight

## Merge Strategy

- **Feature/Bugfix → Develop:** Squash merge
- **Develop → Main:** Regular merge (preserve history)
- **Main → Release/Hotfix/Support:** Regular merge

## Pre-Commit Checklist

Before committing, ensure:

1. Code follows project standards (Python, TypeScript)
2. Tests pass (`pnpm test`, `uv run nox -s test`)
3. Linting passes (`pnpm lint`, `uv run nox -s lint`)
4. No console.log or debug statements in production code
5. Commit message follows Conventional Commits format

## AI Agent Specific Instructions

When making commits:

1. Always check current branch before committing
2. Use descriptive, conventional commit messages
3. Separate formatting fixes from logic changes
4. Create multiple focused commits rather than one large commit
5. Never use `git commit -m` with generic messages like "updates" or "fixes"
