---
applyTo: '**'
---

# Design System Integration Rules for Figma MCP

## Project Context

This is a real-time multiplayer D&D dice roller using:

- **Backend:** FastAPI + Socket.io + Redis
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **State:** Zustand stores synced with Socket.io events
- **UI Components:** Figma-generated React components (Radix UI + shadcn/ui style)

## 1. Token Definitions

### Location

- **CSS Variables:** `frontend/src/styles/globals.css`
- **Tailwind Config:** `frontend/tailwind.config.js`

### Token Structure

```css
:root {
  /* Colors - Dark theme for gaming */
  --primary: #030213; /* Dark blue/black */
  --secondary: oklch(0.95 0.0058 264.53); /* Light purple-gray */
  --destructive: #d4183d; /* Red for danger */
  --muted: #ececf0; /* Light gray */
  --accent: #e9ebef; /* Subtle highlight */

  /* Spacing & Layout */
  --radius: 0.625rem; /* 10px border radius */

  /* Typography */
  --font-size: 16px; /* Base font size */
  --font-weight-medium: 500;
  --font-weight-normal: 400;
}
```

### Usage Pattern

```typescript
// In Tailwind classes
<button className="bg-primary text-primary-foreground rounded-[--radius]" />

// Via Tailwind config (preferred)
<button className="bg-primary text-primary-foreground rounded-lg" />
```

## 2. Component Library

### Location

- **UI Primitives:** `frontend/src/components/ui/` (Radix UI wrappers)
- **Feature Components:** `frontend/src/components/` (DiceRoller, RollHistory, etc.)
- **Pages:** `frontend/src/pages/` (Home, Room, Permalink)

### Component Architecture

```
frontend/src/components/
├── ui/                    # Radix UI + shadcn/ui primitives
│   ├── button.tsx         # Button variants
│   ├── input.tsx          # Input field
│   ├── dialog.tsx         # Modal dialogs
│   ├── badge.tsx          # Room code badges
│   └── ...
├── DiceRoller.tsx         # Dice rolling interface
├── RollHistory.tsx        # Roll feed
├── PlayerList.tsx         # Player drawer
└── RoomSettings.tsx       # Room configuration
```

### Component Pattern (from Figma)

```typescript
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/hooks/useSocket';
import { useRoomStore } from '@/store/roomStore';

export function DiceRoller() {
  const { socket } = useSocket();
  const { roomCode } = useRoomStore();

  const handleRoll = () => {
    // ✅ ALWAYS emit to server, never generate client-side
    socket.emit('roll_dice', {
      room_code: roomCode,
      dice_type: 20,
      quantity: 1,
      modifier: 0
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={handleRoll} size="lg">
        Roll 1d20
      </Button>
    </div>
  );
}
```

### Component Naming Convention

- **UI Primitives:** PascalCase, generic names (`Button`, `Input`)
- **Feature Components:** PascalCase, descriptive (`DiceRoller`, `RollHistory`)
- **Files:** Match component name (`DiceRoller.tsx`)

## 3. Frameworks & Libraries

### UI Framework

- **React 18** with TypeScript
- **Vite** for build tooling and HMR
- **React Router v7** for navigation

### Styling

- **Tailwind CSS** (utility-first)
- **class-variance-authority** for variant management
- **clsx** + **tailwind-merge** for conditional classes

### Component Library

- **Radix UI** primitives (accessible, unstyled)
- **shadcn/ui** style components (Radix + Tailwind)
- **Lucide React** for icons

### State Management

- **Zustand** for global state
- **Socket.io Client** for real-time sync

### Build System

```json
// package.json scripts
{
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx",
  "test": "vitest"
}
```

## 4. Asset Management

### Image Assets

- **Location:** `frontend/public/` for static assets
- **SVG Icons:** Lucide React library (no local SVGs needed)
- **Format:** WebP for images (with fallback)

### Usage Pattern

```typescript
// For public assets
<img src="/logo.png" alt="D&D Dice Roller" />

// For imported assets (processed by Vite)
import logo from '@/assets/logo.png';
<img src={logo} alt="Logo" />
```

### Optimization

- Vite automatically optimizes imported assets
- SVGs inlined via Vite plugin
- No CDN configured (development only)

## 5. Icon System

### Library

**Lucide React** - https://lucide.dev/

### Import Pattern

```typescript
import {
  Dices, // Dice roller icon
  Copy, // Copy to clipboard
  Settings, // Room settings
  Users, // Player list
  Wifi, // Connection status (online)
  WifiOff, // Connection status (offline)
  Eye, // Show hidden roll (DM)
  EyeOff, // Hide roll (DM)
  ChevronDown, // Expand/collapse
  ChevronUp, // Expand/collapse
  Plus, // Add preset
  X, // Close modal
} from 'lucide-react';
```

### Usage Pattern

```typescript
<Button>
  <Dices className="size-4" />
  Roll Dice
</Button>
```

### Icon Sizing Convention

- **Small (sm):** `size-3` (12px)
- **Default:** `size-4` (16px)
- **Large (lg):** `size-6` (24px)
- **Extra Large (xl):** `size-8` (32px)

### Icon Colors

Icons inherit text color by default:

```typescript
<Wifi className="text-green-500" />  // Online indicator
<WifiOff className="text-red-500" /> // Offline indicator
```

## 6. Styling Approach

### Methodology

**Tailwind Utility-First CSS**

### Base Styles

```typescript
// frontend/src/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### Component Style Pattern

```typescript
import { cn } from '@/components/ui/utils';

// Using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
);

// In component
<Button
  variant="destructive"
  size="lg"
  className={cn("custom-class", conditionalClass && "extra-class")}
/>
```

### Responsive Design

Mobile-first breakpoints:

```typescript
// Tailwind breakpoints
<div className="w-full md:w-1/2 lg:w-1/3">
  // 100% width on mobile
  // 50% on tablet (768px+)
  // 33% on desktop (1024px+)
</div>
```

### Dark Mode

Class-based dark mode:

```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content
</div>
```

Toggled via root element:

```typescript
document.documentElement.classList.toggle('dark');
```

## 7. Project Structure

```
frontend/
├── src/
│   ├── components/          # Feature components
│   │   ├── ui/              # UI primitives (Radix + Tailwind)
│   │   ├── DiceRoller.tsx
│   │   ├── RollHistory.tsx
│   │   ├── PlayerList.tsx
│   │   └── RoomSettings.tsx
│   ├── pages/               # Route components
│   │   ├── Home.tsx
│   │   ├── Room.tsx
│   │   └── Permalink.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useSocket.ts     # Socket.io connection
│   │   └── useRoom.ts       # Room state management
│   ├── store/               # Zustand stores
│   │   ├── roomStore.ts     # Room state
│   │   └── socketStore.ts   # Socket connection state
│   ├── services/            # API/Socket abstractions
│   │   └── socket.ts        # Socket.io client setup
│   ├── styles/              # Global styles
│   │   └── globals.css      # Tailwind + design tokens
│   ├── utils/               # Utility functions
│   │   └── cn.ts            # Class name utility
│   ├── App.tsx              # Router setup
│   └── main.tsx             # React entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 8. Integration Rules for Figma Components

### Rule 1: Never Generate Rolls Client-Side

```typescript
// ❌ WRONG - From Figma generated code
const rollDice = (sides: number) => {
  return Math.floor(Math.random() * sides) + 1;
};

// ✅ CORRECT - Always use Socket.io
socket.emit('roll_dice', {
  room_code,
  dice_type: 20,
  quantity: 1,
  modifier: 0,
});
```

### Rule 2: Use Zustand Store, Not Local State

```typescript
// ❌ WRONG
const [rolls, setRolls] = useState<Roll[]>([]);

// ✅ CORRECT
import { useRoomStore } from '@/store/roomStore';
const { rolls } = useRoomStore();
```

### Rule 3: Socket.io Events Over REST API

```typescript
// ❌ WRONG - Figma uses Supabase REST
fetch(`https://api.../rooms/${roomCode}/rolls`);

// ✅ CORRECT - Socket.io events
socket.emit('get_roll_history', { room_code: roomCode });
socket.on('roll_history', (data) => {
  useRoomStore.getState().setRolls(data.rolls);
});
```

### Rule 4: Preserve UI, Replace Logic

When migrating Figma components:

1. ✅ Keep: JSX structure, Tailwind classes, Radix UI components
2. ❌ Replace: API calls, random number generation, polling
3. ✅ Add: Socket.io event emitters/listeners
4. ✅ Connect: Zustand stores instead of local state

### Rule 5: Mobile-First Responsive

```typescript
// All components must work on 320px viewport
<div className="
  flex flex-col          // Stack on mobile
  md:flex-row            // Side-by-side on tablet
  gap-4                  // Consistent spacing
  p-4                    // Touch-friendly padding
">
```

### Rule 6: Accessibility Requirements

```typescript
// All interactive elements need ARIA labels
<Button
  onClick={handleRoll}
  aria-label="Roll 1d20 dice"
>
  <Dices className="size-4" />
  Roll
</Button>

// Live region for roll announcements (screen readers)
<div aria-live="polite" aria-atomic="true">
  {latestRoll && `${playerName} rolled ${latestRoll.total}`}
</div>
```

## 9. Code Style Conventions

### TypeScript

- **Interfaces:** PascalCase, descriptive names
- **Props:** Component name + "Props" suffix
- **Hooks:** "use" prefix (useSocket, useRoom)
- **Constants:** UPPER_SNAKE_CASE (for config values)

### React Patterns

```typescript
// Prop destructuring
interface DiceRollerProps {
  roomCode: string;
  isDM: boolean;
}

export function DiceRoller({ roomCode, isDM }: DiceRollerProps) {
  // Component logic
}

// Custom hooks for logic extraction
function useDiceRoller(roomCode: string) {
  const { socket } = useSocket();

  const handleRoll = (diceType: number) => {
    socket.emit('roll_dice', { room_code: roomCode, dice_type: diceType });
  };

  return { handleRoll };
}
```

### Import Order

```typescript
// 1. React/external libraries
import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';

// 2. UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 3. Custom hooks/stores
import { useSocket } from '@/hooks/useSocket';
import { useRoomStore } from '@/store/roomStore';

// 4. Types
import type { Roll, Player } from '@/types';

// 5. Utilities
import { cn } from '@/utils/cn';
```

## 10. Testing Patterns

### Component Tests

```typescript
// vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { DiceRoller } from './DiceRoller';

test('renders roll button', () => {
  render(<DiceRoller roomCode="TEST-1234" isDM={false} />);
  expect(screen.getByRole('button', { name: /roll/i })).toBeInTheDocument();
});
```

### E2E Tests (Playwright)

```typescript
// Test user flow
test('create room and roll dice', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="playerName"]', 'TestPlayer');
  await page.click('text=Create Room');
  await page.click('text=Roll');
  await expect(page.locator('.roll-result')).toBeVisible();
});
```

---

**When integrating Figma designs:**

1. Copy UI primitives from `docs/uex/figma-design/src/components/ui/` → `frontend/src/components/ui/`
2. Migrate feature components, replacing API logic with Socket.io
3. Connect to Zustand stores for state management
4. Test on mobile viewport (320px minimum)
5. Verify accessibility with keyboard navigation
6. Run security audit (no client-side randomness)

**References:**

- Architecture: `docs/architecture.md`
- Socket.io Events: `backend/src/sdd_process_example/socket_manager.py`
- TypeScript Standards: `docs/standards/03-typescript-standards.md`
