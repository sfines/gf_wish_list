---
trigger: glob
globs: '**/*.py'
---

# Python Coding Standards

## Purpose

This document defines a concise, practical Python coding standard for backend services and libraries.
It is written for developers and for AI agents that will generate or review code. It includes: high-value rules, a one-page Decision Table, "bad → good" examples, tooling/config snippets (Ruff, isort, MyPy, nox, uv), a one-page PR checklist, CI snippet, and a migration plan.

## Decision Table (Top 12 rules)

| #   | Rule                                                           | Enforcement | Rationale                                                                    |
| --- | -------------------------------------------------------------- | ----------: | ---------------------------------------------------------------------------- |
| 1   | Use `pyproject.toml` + Ruff for formatting/linting             |        FAIL | Single-source formatting + linting ensures consistent style and fast checks. |
| 2   | Require type hints for public APIs (MyPy)                      |        FAIL | Prevents major runtime errors and enables safe refactors.                    |
| 3   | No bare `except`                                               |        FAIL | Avoids swallowing unexpected errors and hiding bugs.                         |
| 4   | No mutable defaults                                            |        FAIL | Prevents surprising shared state across calls.                               |
| 5   | Use structured logging                                         |        WARN | Facilitates log parsing for observability—structured logs reduce ambiguity.  |
| 6   | Secure secrets storage                                         |        FAIL | Prevents accidental exposure of credentials and secrets.                     |
| 7   | Use `isort` import ordering                                    |        INFO | Keeps imports grouped and consistent across files.                           |
| 8   | Use `nox` sessions for lint/test/format                        |        INFO | Standardizes local and CI run steps.                                         |
| 9   | Avoid global mutable states                                    |        WARN | Easier to test and reason about code.                                        |
| 10  | Catch explicit exceptions only                                 |        FAIL | Avoids hiding unexpected errors and protects control flow.                   |
| 11  | Use async/await for I/O-bound code                             |        WARN | Prevents blocking and enables concurrency for web apps.                      |
| 12  | Document public functions with type hints and short docstrings |        INFO | Improves discoverability and guarantees clearer APIs.                        |

## Core rules & explanations

1. Formatting & linting
   - Rule: Use Ruff for linting and formatting; use `ruff format --fix` and `ruff check` in CI. Use `isort` for import sorting (or allow Ruff's import sorting where enabled).
   - Example (bad → good):
     Bad: messy imports, inconsistent quotes
     Good: `ruff format --fix` standardizes style automatically.

2. Strict typing for public APIs
   - Rule: Public functions/classes must have full type hints; use `MyPy` in CI and `disallow_untyped_defs` to fail on public functions.
   - Example:

     ```py
     # ✗ Bad
     def compute(data):
         return sum(data)

     # ✓ Good
     def compute(data: list[int]) -> int:
         return sum(data)
     ```

3. No bare except
   - Rule: Always catch specific exceptions and re-raise or handle appropriately.
   - Example:

     ```py
     # ✗ Bad
     try:
         do_work()
     except:
         pass

     # ✓ Good
     try:
         do_work()
     except ValueError as e:
         logger.warn("invalid value: %s", e)
     ```

4. No mutable defaults
   - Rule: Avoid list/dict defaults, use `None` and set in body.
   - Example:

     ```py
     # ✗ Bad
     def append(x, data=[]):
         data.append(x)
         return data

     # ✓ Good
     def append(x, data=None):
         if data is None:
             data = []
         data.append(x)
         return data
     ```

5. Logging & observability
   - Rule: Use structured logs (e.g., `structlog` or JSON logs with metadata). No `print()` for production errors.
   - Example: `logger.info('user.created', user_id=id, plan='pro')`

6. Security
   - Rule: Never store secrets in code or committed files. Use environment variables or a secret manager, and read with `uv` or a config utility. Avoid `eval` for parsing; prefer `json.loads` or `ast.literal_eval` for simple literal parsing.

7. Concurrency & async
   - Rule: Use `async/await` for network or I/O-bound operations. Add timeouts with `asyncio.wait_for`.
   - Example: `await asyncio.wait_for(client.fetch(...), timeout=10)`

8. Exceptions & error mapping
   - Rule: Create typed exceptions in `app.errors` and map them to API responses in a single middleware.

9. Imports
   - Rule: Sort imports by builtin, third-party, local; keep import lines ≤ 88. Use `isort` and configure `pyproject.toml`.

10. Packaging & dependency hygiene

- Rule: Pin direct dependencies for reproducibility. Use `uv` as the recommended project manager. Document `uv sync` and `uv run` usage.

## Tooling & Config snippets

pyproject.toml (Ruff, isort, MyPy)

```toml
[tool.ruff]
line-length = 88
select = ["E", "F", "B", "C", "UP", "ANN"]

[tool.isort]
profile = "black"
known_first_party = ["yourpkg"]

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
```

noxfile.py (example)

```py
import nox

@nox.session(python=["3.11"])
def lint(session):
    session.install("ruff")
    session.run("ruff", "check", ".")

@nox.session(python=["3.11"])
def format(session):
    session.install("ruff")
    session.run("ruff", "format", ".")

@nox.session(python=["3.11"])
def test(session):
    session.install("pytest", "pytest-cov")
    session.run("pytest", "-q")

@nox.session(python=["3.11"])
def typecheck(session):
    session.install("mypy")
    session.run("mypy", "--strict", "yourpkg")
```

MyPy: run via `nox -s typecheck` or `mypy .` in CI.

pre-commit config sample (.pre-commit-config.yaml)

```yaml
repos:
  - repo: https://github.com/charliermarsh/ruff
    rev: 'v0.0.0' # set to pinned
    hooks:
      - id: ruff
  - repo: https://github.com/PyCQA/isort
    rev: '5.12.0'
    hooks:
      - id: isort
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: 'v1.8'
    hooks:
      - id: mypy
```

GitHub Actions (CI snippet)

```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install
        run: |
          python -m pip install -U pip
          pip install uv
          uv sync
      - name: Lint
        run: nox -s lint
      - name: Format check
        run: nox -s format -- --check
      - name: Type check
        run: nox -s typecheck
      - name: Tests
        run: nox -s test
```

## PR reviewer checklist (10 items)

1. `nox -s lint` and `nox -s format -- --check` pass locally.
2. `nox -s typecheck` returns no errors on all changed modules.
3. New public functions/methods have type hints and docstrings.
4. No `any` in public interfaces and no mutable defaults.
5. No `print()` left in production code or unstructured logging.
6. Secrets not committed and config uses `uv` or env secrets.
7. Exceptions are typed and handled (no bare `except`).
8. Tests cover new behaviors and edge cases (CI shows coverage).
9. Files formatted and imports sorted (`isort`/`ruff`).
10. Update the Decision Table if the change introduces a new rule.

## Migration plan

1. Add `pyproject.toml` with Ruff/isort/MyPy settings; add pre-commit hooks.
2. Run `nox -s format` + `nox -s lint` to fix format and easy style errors.
3. Turn on incremental type checking via `nox -s typecheck` with `--strict` toggles per module.
4. Add CI gating: lint → format → typecheck → test.
5. Incrementally enforce `disallow_untyped_defs` with a targeted schedule.

## Examples (common anti-patterns & refactors)

- Mutable default -> `None` pattern
- Bare `except` -> catch specific exceptions
- Missing types -> annotate public function
- No secrets in code -> use environment and `uv` for config

## Appendix: Short guidance for `uv`

- `uv sync` sets up project environment listed in `pyproject` and `requirements-dev.txt`.
- `uv run` used for reproducible scripts. Include these steps in developer onboarding.