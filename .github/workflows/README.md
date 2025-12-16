# GitHub Actions CI Workflow

This repository includes a GitHub Actions workflow that automatically runs on pull requests and pushes to the `develop` and `main` branches.

## What Gets Tested

The CI workflow performs the following checks in order:

1. **TypeScript Type Checking** (`pnpm typecheck`)
   - Validates that all TypeScript code is properly typed
   - Fails if there are any type errors

2. **ESLint Linting** (`pnpm lint`)
   - Checks code quality and style
   - Enforces consistent code patterns
   - Configured for TypeScript and React
   - Fails if there are any lint errors or warnings

3. **Build** (`pnpm build`)
   - Compiles TypeScript code
   - Builds the Vite project for production
   - Fails if there are any build errors

4. **Unit Tests** (`pnpm test`)
   - Runs all Vitest unit tests
   - Fails if any tests fail

## Workflow Configuration

- **File:** `.github/workflows/ci.yml`
- **Node Version:** 20
- **Package Manager:** pnpm 8
- **Runs On:** Ubuntu Latest

## Triggers

The workflow runs automatically when:
- A pull request is opened targeting `develop` or `main`
- A pull request is updated (new commits pushed)
- Code is pushed directly to `develop` or `main` branches

## Local Development

You can run the same checks locally before pushing:

```bash
# Install dependencies
pnpm install

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Build the project
pnpm build

# Run tests
pnpm test

# Run all checks at once
pnpm typecheck && pnpm lint && pnpm build && pnpm test
```

## ESLint Configuration

The project uses ESLint with the following plugins:
- `@typescript-eslint` - TypeScript-specific linting rules
- `react-hooks` - React hooks best practices
- `react-refresh` - Fast Refresh support for Vite

Configuration file: `.eslintrc.cjs`

## Performance Optimization

The workflow includes pnpm store caching to speed up dependency installation on subsequent runs.
