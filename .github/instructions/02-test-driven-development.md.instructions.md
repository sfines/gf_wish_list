---
applyTo: '**'
---

# Test-Driven Development (TDD) Instructions

## Overview

All code in this project must be developed using Test-Driven Development methodology. Tests are written BEFORE implementation code.

## TDD Red-Green-Refactor Cycle

### 1. RED - Write Failing Test

```python
# Example: backend/tests/test_dice_engine.py
def test_roll_returns_valid_total():
    engine = DiceEngine()
    result = engine.roll(formula="1d20", player_id="test", player_name="Test")
    assert 1 <= result.total <= 20  # Test will fail initially
```

### 2. GREEN - Write Minimal Code

```python
# Example: backend/src/sdd_process_example/services/dice_engine.py
def roll(self, formula: str, player_id: str, player_name: str) -> DiceResult:
    # Write ONLY enough code to make test pass
    total = random.randint(1, 20)
    return DiceResult(total=total, ...)
```

### 3. REFACTOR - Improve Design

```python
# Refactor for better structure while keeping tests green
def roll(self, formula: str, player_id: str, player_name: str) -> DiceResult:
    parser = DiceParser()
    total, rolls = parser.parse(formula)
    return DiceResult(
        total=total,
        individual_results=rolls,
        ...
    )
```

## Test Coverage Requirements

### Backend (Python)

- **Unit Tests:** All business logic functions
- **Integration Tests:** Socket.io event handlers, Redis operations
- **Coverage Target:** 80% minimum
- **Location:** `backend/tests/`
- **Runner:** `pytest` via `uv run nox -s test`

### Frontend (TypeScript)

- **Unit Tests:** Components, hooks, stores
- **Integration Tests:** Socket.io client integration
- **E2E Tests:** Critical user flows (Playwright)
- **Location:** `frontend/src/tests/`, `frontend/e2e/`
- **Runner:** `vitest` and `playwright`

## Behavior-Driven Development (BDD)

### Given-When-Then Format

```typescript
// frontend/e2e/dice-roll.spec.ts
test('should create room and roll dice', async ({ page }) => {
  // GIVEN: User is on home page
  await page.goto('/');

  // WHEN: User creates room and rolls dice
  await page.fill('[name="playerName"]', 'TestPlayer');
  await page.click('text=Create Room');
  await page.fill('[placeholder="1d20+5"]', '1d20+5');
  await page.click('text=Roll');

  // THEN: Roll appears in history
  await expect(page.getByText('TestPlayer')).toBeVisible();
  await expect(page.getByText(/1d20\+5/i)).toBeVisible();
});
```

## Testing Integrity Rules

### Critical Requirements

- ❌ **NO SKIPPING TESTS** without explicit human approval
- ❌ Tests must not pass if framework is broken
- ✅ All tests must pass before code review
- ✅ New features require new tests
- ✅ Bug fixes require regression tests

### Test Organization

```
backend/tests/
  ├── test_dice_engine.py        # Unit tests
  ├── test_room_manager.py       # Unit tests
  ├── test_roll_dice_event.py    # Integration tests
  └── conftest.py                # Shared fixtures

frontend/
  ├── src/tests/                 # Unit tests
  │   ├── DiceInput.test.tsx
  │   └── useSocket.test.tsx
  └── e2e/                       # E2E tests
      ├── dice-roll.spec.ts
      └── join-room.spec.ts
```

## AI Agent TDD Workflow

### Before Writing ANY Code:

1. **Identify the requirement** from story acceptance criteria
2. **Write the test first** that defines expected behavior
3. **Run test to confirm it fails** (RED)
4. **Write minimal implementation** to pass test (GREEN)
5. **Refactor if needed** while keeping test green
6. **Run full test suite** to ensure no regressions
7. **Commit** with test and implementation together

### Test-First Examples

#### Backend Feature

```python
# Step 1: Write test
def test_advantage_roll_takes_higher():
    engine = DiceEngine()
    result = engine.roll_advantage("1d20")
    assert len(result.individual_results) == 2
    assert result.total == max(result.individual_results)

# Step 2: Run test (should fail)
# Step 3: Implement
# Step 4: Verify test passes
# Step 5: Refactor
```

#### Frontend Component

```typescript
// Step 1: Write test
test('DiceInput clears after roll', async () => {
  const onRoll = vi.fn();
  render(<DiceInput onRoll={onRoll} isRolling={false} />);

  const input = screen.getByPlaceholder('1d20+5');
  await userEvent.type(input, '2d6');
  await userEvent.click(screen.getByRole('button', { name: /roll/i }));

  expect(input).toHaveValue('');
});

// Step 2: Run test (should fail)
// Step 3: Implement clearing logic
// Step 4: Verify test passes
```

## Red-Green-Refactor Checklist

- [ ] Write failing test that defines requirement
- [ ] Run test suite - confirm new test fails (RED)
- [ ] Write minimal code to pass test (GREEN)
- [ ] Run test suite - confirm new test passes
- [ ] Refactor code for clarity/maintainability
- [ ] Run test suite - confirm all tests still pass
- [ ] Commit test and implementation together

## Common Anti-Patterns to Avoid

❌ Writing implementation before tests
❌ Skipping tests "just this once"
❌ Writing tests after implementation
❌ Testing implementation details instead of behavior
❌ Large test files without clear organization
❌ Tests that depend on execution order
❌ Tests without clear Given-When-Then structure
