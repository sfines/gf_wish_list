---
trigger: glob
globs: **/*.{ts,tsx,js,jsx}
---

# TypeScript Coding Standards

## Purpose

This document defines a concise, practical TypeScript coding standard for frontend services and libraries. It is written for developers and for AI agents that will generate or review code. It includes: high-value rules, a one-page Decision Table, "bad → good" examples, tooling/config snippets (ESLint, Prettier, Vitest, tsconfig), a one-page PR checklist, CI snippet, and a migration plan.

**Package Manager:** All TypeScript work uses `pnpm` exclusively. Never use `npm` or `yarn`.

## Decision Table (Top 12 rules)

| #   | Rule                                           | Enforcement | Rationale                                                                    |
| --- | ---------------------------------------------- | ----------: | ---------------------------------------------------------------------------- |
| 1   | Use ESLint + Prettier for formatting/linting   |        FAIL | Single-source formatting + linting ensures consistent style and fast checks. |
| 2   | Require strict type checking (`tsconfig.json`) |        FAIL | Prevents major runtime errors and enables safe refactors.                    |
| 3   | No `any` in new code                           |        FAIL | Avoids unsafe type assertions that undermine the type system.                |
| 4   | Use named exports only (no `default export`)   |        FAIL | Ensures consistency and avoids naming collisions.                            |
| 5   | Use structured logging                         |        WARN | Facilitates log parsing for observability—structured logs reduce ambiguity.  |
| 6   | Secure secrets handling                        |        FAIL | Prevents accidental exposure of credentials and secrets.                     |
| 7   | Use `for...of` for array iteration             |        INFO | More readable and less error-prone than traditional `for` loops.             |
| 8   | Use `pnpm` exclusively (never npm/yarn)        |        FAIL | Standardizes local and CI environments with fast, efficient installs.        |
| 9   | Avoid global mutable states                    |        WARN | Easier to test and reason about code.                                        |
| 10  | Catch explicit exceptions only                 |        FAIL | Avoids hiding unexpected errors and protects control flow.                   |
| 11  | Use `async/await` for I/O-bound code           |        WARN | Prevents blocking and enables concurrency for web apps.                      |
| 12  | Document public functions with JSDoc           |        INFO | Improves discoverability and guarantees clearer APIs.                        |

## Core rules & explanations

### 1. File Structure & Basics

- **File Organization**: Files must be structured in this order: Copyright, `@fileoverview` JSDoc, Imports, Implementation.
- **File Encoding**: UTF-8 only. Use single quotes (`'`) for strings.
- **Whitespace**: Use spaces, not tabs.

### 2. Imports & Exports

- **Import Style**: Use named imports. Never use `default export`.
- **Import Paths**: Use relative paths (`./foo`) for same-project files.
- **Type Imports**: Use `import type {...}` for type-only imports.

### 3. Variables & Declarations

- **Use `const` and `let`**: `const` by default, `let` only when reassignment is necessary. Never use `var`.
- **One variable per declaration**.

### 4. Types & Type System

- **Type Inference**: Let TypeScript infer simple types. Annotate complex types for clarity.
- **Primitive Types**: Use lowercase: `string`, `number`, `boolean`.
- **Interfaces vs Type Aliases**: Prefer `interface` for object types.
- **`any` vs `unknown`**: Avoid `any`. Use `unknown` for truly unknown types and perform type checking.

### 5. Classes

- **Structure**: Fields, constructor, methods. Use `readonly` for properties never reassigned.
- **Visibility**: Use `private`, `protected`. Default is `public` (do not write it explicitly).
- **No `#private` fields**: Use TypeScript's `private` keyword.

### 6. Functions

- **Style**: Prefer function declarations for named functions. Use arrow functions for callbacks.
- **`this`**: Avoid `this` outside of class methods. Use arrow functions to preserve `this` context.

### 7. Control Flow

- **Braces**: Always use braces for blocks (`if`, `for`, `while`).
- **Equality**: Always use `===` and `!==`. Exception: `== null` to check for `null` or `undefined`.

### 8. Exception Handling

- **Throw Errors**: Always `throw new Error()`. Never throw strings or objects.
- **Catching**: Catch as `unknown` and perform instance checks.

## Package Management with pnpm

**Rule:** All TypeScript projects MUST use `pnpm` as the package manager. Never use `npm` or `yarn`.

**Rationale:**

- Fast, disk-space efficient installations via content-addressable storage
- Strict dependency resolution prevents phantom dependencies
- Workspace support for monorepos
- Consistent lockfile format (`pnpm-lock.yaml`)

**Common Commands:**

```bash
pnpm install           # Install dependencies
pnpm add <package>     # Add dependency
pnpm add -D <package>  # Add dev dependency
pnpm run <script>      # Run package.json script
pnpm test              # Run tests
pnpm lint              # Run linter
pnpm format            # Format code
```

**Project Setup:**

```bash
# Install pnpm globally (if needed)
npm install -g pnpm

# Initialize new project
pnpm init

# Install dependencies from package.json
pnpm install
```

## Tooling & Config snippets

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### `prettier.config.js`

```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
};
```

### `package.json` scripts

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest"
}
```

### `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
  - repo: https://github.com/prettier/prettier
    rev: 3.3.2
    hooks:
      - id: prettier
  - repo: https://github.com/eslint/eslint
    rev: v9.5.0
    hooks:
      - id: eslint
        args: [--fix]
```

## PR reviewer checklist (10 items)

1.  `pnpm format` and `pnpm lint` pass locally.
2.  `pnpm typecheck` returns no errors.
3.  New public functions/methods have JSDoc comments.
4.  No `any` in new code; `unknown` is used correctly.
5.  No `default export` is used.
6.  Secrets are not committed; config uses environment variables.
7.  Exceptions are typed and handled (no bare `catch`).
8.  Tests cover new behaviors and edge cases.
9.  Files formatted and imports sorted.
10. Update the Decision Table if the change introduces a new rule.
11. Verify `pnpm-lock.yaml` is committed (never `package-lock.json` or `yarn.lock`).

## Migration plan

1.  Install `pnpm` globally if not present: `npm install -g pnpm`
2.  Add `tsconfig.json`, `.eslintrc.cjs`, `prettier.config.js`, and `.pre-commit-config.yaml`.
3.  Run `pnpm install` to generate `pnpm-lock.yaml`.
4.  Run `pnpm format` and `pnpm lint --fix` to fix format and easy style errors.
5.  Turn on incremental type checking via `pnpm typecheck` with `strict` toggles per module.
6.  Add CI gating: lint → format → typecheck → test.
7.  Incrementally enforce `noImplicitAny` with a targeted schedule.