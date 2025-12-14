---
applyTo: '**/*.{ts,tsx}'
---

# TypeScript Coding Standards Instructions

## Overview

All TypeScript code must follow these standards, enforced by ESLint, Prettier, and TypeScript strict mode.

## Quick Reference - Top 12 Rules

| #   | Rule                       | Enforcement | Why                           |
| --- | -------------------------- | ----------- | ----------------------------- |
| 1   | Use ESLint + Prettier      | FAIL        | Consistent formatting/linting |
| 2   | Strict type checking       | FAIL        | Prevents runtime errors       |
| 3   | No `any` in new code       | FAIL        | Maintain type safety          |
| 4   | Named exports only         | FAIL        | Avoid naming collisions       |
| 5   | Structured logging         | WARN        | Better observability          |
| 6   | Secure secrets handling    | FAIL        | No credentials in code        |
| 7   | Use `for...of` for arrays  | INFO        | More readable iteration       |
| 8   | Use pnpm + Node 24         | INFO        | Standardized tooling          |
| 9   | Avoid global mutable state | WARN        | Easier testing                |
| 10  | Catch explicit errors      | FAIL        | Proper error handling         |
| 11  | Use async/await for I/O    | WARN        | Non-blocking operations       |
| 12  | Document with JSDoc        | INFO        | Clear APIs                    |

## Code Examples

### ✅ Good Examples

```typescript
// Named exports
export function DiceInput({ onRoll, isRolling }: DiceInputProps): JSX.Element {
  // Component implementation
}

// Type annotations
interface DiceInputProps {
  onRoll: (formula: string) => void;
  isRolling: boolean;
}

// No any - use unknown + type guards
function processData(data: unknown): number {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: number }).value;
  }
  throw new Error('Invalid data structure');
}

// Async/await
async function fetchRoomState(roomCode: string): Promise<RoomState> {
  const response = await fetch(`/api/rooms/${roomCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch room: ${response.statusText}`);
  }
  return response.json();
}

// Proper error handling
try {
  const result = await rollDice(formula);
} catch (error) {
  if (error instanceof Error) {
    logger.error('Roll failed', { error: error.message });
  }
  throw error;
}

// const and let (no var)
const playerName = 'Alice';
let rollCount = 0;
```

### ❌ Bad Examples (Anti-Patterns)

```typescript
// Default export
export default function DiceInput() {} // DON'T

// Using any
function processData(data: any): number {
  // DON'T
  return data.value;
}

// Using var
var playerName = 'Alice'; // DON'T

// Bare catch
try {
  await rollDice(formula);
} catch {
  // DON'T - handle error
  console.log('error');
}

// Throwing non-Error
throw 'Error occurred'; // DON'T - throw new Error()
```

## File Structure

```typescript
/**
 * DiceInput Component
 *
 * Provides input field and button for rolling dice.
 */

// 1. Imports - external libraries
import { useState } from 'react';

// 2. Imports - internal components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 3. Imports - hooks and stores
import { useSocketStore } from '@/store/socketStore';

// 4. Type definitions
interface DiceInputProps {
  onRoll: (formula: string) => void;
  isRolling: boolean;
}

// 5. Component implementation
export function DiceInput({ onRoll, isRolling }: DiceInputProps): JSX.Element {
  const [formula, setFormula] = useState('');

  const handleRoll = () => {
    if (formula.trim()) {
      onRoll(formula);
      setFormula('');
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        placeholder="1d20+5"
        disabled={isRolling}
      />
      <Button onClick={handleRoll} disabled={isRolling}>
        {isRolling ? 'Rolling...' : 'Roll'}
      </Button>
    </div>
  );
}
```

## React Patterns

### Component Props

```typescript
// Use interface for props
interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
}

// Destructure props
export function PlayerList({
  players,
  currentPlayerId,
}: PlayerListProps): JSX.Element {
  // Implementation
}
```

### State Management (Zustand)

```typescript
// Store definition
interface SocketState {
  roomCode: string | null;
  players: Player[];
  setRoomState: (roomState: RoomState) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  roomCode: null,
  players: [],
  setRoomState: (roomState) =>
    set({
      roomCode: roomState.room_code,
      players: roomState.players,
    }),
}));

// Usage in component
function RoomView() {
  const players = useSocketStore((state) => state.players);
  const setRoomState = useSocketStore((state) => state.setRoomState);

  // Component logic
}
```

### Custom Hooks

```typescript
// hooks/useSocket.ts
export const useSocket = () => {
  const navigate = useNavigate();
  const { setRoomState, setConnected } = useSocketStore();

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    };

    socket.on('connect', onConnect);

    return () => {
      socket.off('connect', onConnect);
    };
  }, [setConnected]);

  return useSocketStore();
};
```

## Socket.io Integration

```typescript
// Socket client setup
import { io } from 'socket.io-client';

export const socket = io(
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  {
    transports: ['websocket'],
    autoConnect: true,
  },
);

// Event handlers in hooks
useEffect(() => {
  const handleRollResult = (data: RollResult) => {
    addRollToHistory(data);

    window.dispatchEvent(
      new CustomEvent('toast:show', {
        detail: {
          type: 'info',
          message: `${data.player_name} rolled ${data.total}`,
        },
      }),
    );
  };

  socket.on('roll_result', handleRollResult);

  return () => {
    socket.off('roll_result', handleRollResult);
  };
}, [addRollToHistory]);
```

## Testing Patterns

### Component Tests (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiceInput } from './DiceInput';

describe('DiceInput', () => {
  it('calls onRoll with formula and clears input', async () => {
    const onRoll = vi.fn();
    render(<DiceInput onRoll={onRoll} isRolling={false} />);

    const input = screen.getByPlaceholder('1d20+5');
    await userEvent.type(input, '2d6');
    await userEvent.click(screen.getByRole('button', { name: /roll/i }));

    expect(onRoll).toHaveBeenCalledWith('2d6');
    expect(input).toHaveValue('');
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('should roll dice and see result', async ({ page }) => {
  await page.goto('/');

  await page.fill('[name="playerName"]', 'TestPlayer');
  await page.click('text=Create Room');

  await page.waitForURL(/\/room\/.+/);

  await page.fill('[placeholder="1d20+5"]', '1d20+5');
  await page.click('text=Roll');

  await expect(page.getByText('TestPlayer')).toBeVisible();
  await expect(page.getByText(/1d20\+5/i)).toBeVisible();
});
```

## Tooling Commands

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run all checks
pnpm lint && pnpm typecheck && pnpm test
```

## AI Agent Checklist

Before committing TypeScript code:

- [ ] No `any` types (use `unknown` + type guards)
- [ ] All exports are named (no default exports)
- [ ] Strict type checking passes
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] All tests pass (unit + E2E)
- [ ] No `console.log` in production code
- [ ] Environment variables used for config
- [ ] Proper error handling (no bare catch)
- [ ] JSDoc comments on public functions

## Common Patterns

### Conditional Rendering

```typescript
{isLoading ? (
  <div>Loading...</div>
) : (
  <div>{content}</div>
)}

{error && <div className="text-red-500">{error}</div>}
```

### Event Handlers

```typescript
// Arrow function for inline handlers
<button onClick={() => handleClick(id)}>

// Direct reference when no args
<button onClick={handleSubmit}>
```

### Styling with Tailwind

```typescript
// Use className prop
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

// Conditional classes
<div className={`flex gap-2 ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`}>

// Or use clsx/cn utility
<div className={cn('flex gap-2', isActive && 'bg-blue-500')}>
```
