---
applyTo: '**/*.py'
---

# Python Coding Standards Instructions

## Overview

All Python code must follow these standards, enforced by Ruff, MyPy, isort, and nox.

## Quick Reference - Top 12 Rules

| #   | Rule                                  | Enforcement | Why                              |
| --- | ------------------------------------- | ----------- | -------------------------------- |
| 1   | Use pyproject.toml + Ruff             | FAIL        | Single-source formatting/linting |
| 2   | Type hints for public APIs            | FAIL        | Prevents runtime errors          |
| 3   | No bare `except`                      | FAIL        | Avoids swallowing errors         |
| 4   | No mutable defaults                   | FAIL        | Prevents shared state bugs       |
| 5   | Use structured logging                | WARN        | Better observability             |
| 6   | Secure secrets storage                | FAIL        | Prevents credential exposure     |
| 7   | Use isort import ordering             | INFO        | Consistent imports               |
| 8   | Use nox for lint/test/format          | INFO        | Standardized tooling             |
| 9   | Avoid global mutable state            | WARN        | Easier testing                   |
| 10  | Catch explicit exceptions only        | FAIL        | Proper error handling            |
| 11  | Use async/await for I/O               | WARN        | Non-blocking operations          |
| 12  | Document with type hints + docstrings | INFO        | Clear APIs                       |

## Code Examples

### ✅ Good Examples

```python
# Type hints on public functions
def compute(data: list[int]) -> int:
    """Calculate sum of integer list."""
    return sum(data)

# Specific exception handling
try:
    result = do_work()
except ValueError as e:
    logger.warning("invalid value: %s", e)

# No mutable defaults
def append(x: int, data: list[int] | None = None) -> list[int]:
    if data is None:
        data = []
    data.append(x)
    return data

# Structured logging
logger.info(
    "user.created",
    user_id=user_id,
    plan="pro",
    timestamp=datetime.now()
)

# Async for I/O operations
async def fetch_data(url: str) -> dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
```

### ❌ Bad Examples (Anti-Patterns)

```python
# No type hints
def compute(data):
    return sum(data)

# Bare except
try:
    do_work()
except:
    pass

# Mutable default
def append(x, data=[]):
    data.append(x)
    return data

# Print instead of logging
print("User created:", user_id)

# Blocking I/O
def fetch_data(url):
    return requests.get(url).json()
```

## Tooling Configuration

### pyproject.toml

```toml
[tool.ruff]
line-length = 88
select = ["E", "F", "B", "C", "UP", "ANN"]

[tool.isort]
profile = "black"
known_first_party = ["sdd_process_example"]

[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
```

### Running Checks

```bash
# Format code
uv run nox -s format

# Lint code
uv run nox -s lint

# Type check
uv run nox -s typecheck

# Run tests
uv run nox -s test

# Run all checks
uv run nox
```

## Import Organization

```python
# 1. Standard library
import json
import secrets
from typing import Any

# 2. Third-party packages
from fastapi import FastAPI
from pydantic import BaseModel
import redis

# 3. Local application
from sdd_process_example.models import RoomState
from sdd_process_example.services import DiceEngine
```

## Type Hinting Guidelines

```python
# Primitive types (lowercase)
def process(text: str, count: int, enabled: bool) -> None:
    pass

# Collections with type parameters
def get_items() -> list[str]:
    return ["a", "b", "c"]

def get_mapping() -> dict[str, int]:
    return {"key": 42}

# Optional types
def find_user(user_id: str) -> User | None:
    return user_repo.get(user_id)

# Any vs unknown - prefer specific types
def process_data(data: dict[str, Any]) -> int:  # Use when truly dynamic
    pass
```

## Async/Await Patterns

```python
# Socket.io event handlers
@sio.event
async def roll_dice(sid: str, data: dict[str, Any]) -> None:
    """Handle roll_dice event with async operations."""
    request = RollRequest(**data)

    # Async Redis operations
    room_data = await redis.get(f"room:{request.room_code}")

    # Process roll
    result = await dice_engine.roll_async(request.formula)

    # Broadcast to room
    await sio.emit("roll_result", result.model_dump(), room=request.room_code)
```

## Security Best Practices

```python
# ✅ Environment variables for secrets
import os
redis_password = os.getenv("REDIS_PASSWORD")

# ✅ Secure random for dice rolls
import secrets
roll = secrets.SystemRandom().randint(1, 20)

# ❌ Never hardcode secrets
redis_password = "my-secret-password"  # DON'T DO THIS

# ❌ Never use insecure random for game mechanics
import random
roll = random.randint(1, 20)  # Predictable, can be exploited
```

## Error Handling

```python
# Custom exceptions
class DiceRollError(Exception):
    """Raised when dice roll operation fails."""
    pass

# Specific exception handling
try:
    result = dice_engine.roll(formula)
except ValueError as e:
    logger.error("Invalid formula", formula=formula, error=str(e))
    raise DiceRollError(f"Cannot parse formula: {formula}") from e
except DiceRollError:
    logger.error("Roll failed", formula=formula)
    raise
```

## AI Agent Checklist

Before committing Python code:

- [ ] All public functions have type hints
- [ ] No bare `except` blocks
- [ ] No mutable default arguments
- [ ] Imports sorted with isort
- [ ] Code formatted with ruff
- [ ] Type checking passes with mypy
- [ ] All tests pass
- [ ] Structured logging used (not print)
- [ ] No hardcoded secrets
- [ ] Async/await for I/O operations

## Running Pre-Commit Checks

```bash
# Auto-fix formatting and imports
uv run nox -s format

# Check for issues
uv run nox -s lint
uv run nox -s typecheck

# Run all checks before committing
uv run nox
```
