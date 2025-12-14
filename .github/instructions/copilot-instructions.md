---
applyTo: '**'
---

# AI Coding Agent Instructions - D&D Dice Roller

## Project Overview

**Real-time multiplayer D&D dice roller** using FastAPI + React + Socket.io + Redis. Core feature: ephemeral game rooms with DM modes, cryptographically secure server-side rolls, and 30-day shareable roll permalinks.

**Critical Architecture Patterns:**

- WebSocket-first design: Socket.io with native room concepts (see `backend/src/sdd_process_example/socket_manager.py`)
- State stored in Redis as single hash per room (see `RoomState` model)
- Server-side roll generation only (never client-side for security)
- Pydantic models for all Socket.io event payloads

## Development Workflow

### Quick Start Commands

```bash
# Backend development
uv sync --group dev                    # Install dependencies
uv run nox -s test                     # Run tests
uv run nox -s lint                     # Lint + security scan
uv run nox -s security                 # Bandit security checks only

# Frontend development
pnpm install                           # Install dependencies
pnpm run dev                           # Start dev server
pnpm run test                          # Run vitest tests
pnpm run lint                          # ESLint

# Full stack (Docker)
docker-compose up                      # Starts backend:8000 + frontend:80
```

**Critical:** Always use `uv` (not pip) for Python dependencies. Always use `pnpm` (not npm/yarn) for Node.

## Project-Specific Conventions

### Python Backend (`backend/src/sdd_process_example/`)

**Socket.io Event Pattern:**

```python
@sio.event
async def event_name(sid: str, data: dict[str, Any]) -> None:
    # 1. Validate with Pydantic model
    request = EventRequest(**data)

    # 2. Process business logic
    result = await service.method(request)

    # 3. Emit response to room or client
    await sio.emit("response_event", result.model_dump(), room=room_code)

    # 4. Structured logging (see logging_config.py)
    logger.info("[EVENT_NAME] Action completed",
                event_type="event_name",
                session_id=sid,
                room_code=room_code)
```

**Redis Room State Pattern:**

```python
# Single hash per room: room:{ROOM_CODE}
# Fields: mode, created_at, creator_player_id, players (JSON), roll_history (JSON)
# Example: redis.hset(f"room:{room_code}", "players", json.dumps(players))
```

**Service Layer Convention:**

- All business logic in `services/` directory (e.g., `room_manager.py`)
- Socket handlers call services, never contain business logic
- Services return Pydantic models, not raw dicts

**Testing Convention:**

- File naming: `test_*.py` in `backend/tests/`
- Use `pytest-asyncio` for async tests
- Mock Redis with `fakeredis` or test fixtures
- Target: 80% coverage on services, 100% on critical roll generation

### Frontend (`frontend/src/`)

**State Management Pattern (Zustand):**

```typescript
// store/roomStore.ts - Single source of truth for room state
// Socket.io integration: listeners update store, components read from store
// Never store WebSocket state in component state

import { create } from 'zustand';

export const useRoomStore = create<RoomStore>((set) => ({
  roomCode: null,
  players: [],
  rollHistory: [],
  updateRoomState: (state) => set(state),
}));
```

**Socket.io Client Pattern:**

```typescript
// hooks/useSocket.ts - Custom hook wraps socket connection
// Automatic reconnection, event listeners, cleanup on unmount
// Components use hook, never import socket directly

const socket = io('ws://localhost:8000');
socket.on('player_joined', (data) => {
  useRoomStore.getState().updatePlayers(data.players);
});
```

**Component Structure:**

```
src/
├── pages/          # Route components (Home, Room, Permalink)
├── components/     # Reusable UI (DiceRoller, PlayerList, RollHistory)
├── hooks/          # Custom hooks (useSocket, useRoom)
├── store/          # Zustand stores (roomStore, uiStore)
└── services/       # API/Socket abstractions
```

**Styling:** Tailwind CSS utility-first. No CSS modules, no styled-components. Mobile-first responsive design.

## Critical Files & Integration Points

**Backend Entry:** `backend/src/sdd_process_example/main.py` - FastAPI + Socket.io ASGI integration
**Socket Events:** `backend/src/sdd_process_example/socket_manager.py` - All WebSocket handlers
**Models:** `backend/src/sdd_process_example/models.py` - Pydantic schemas for validation
**Services:** `backend/src/sdd_process_example/services/room_manager.py` - Room state management

**Frontend Entry:** `frontend/src/main.tsx` - React app root
**Socket Integration:** `frontend/src/hooks/useSocket.ts` - WebSocket connection management
**Router:** `frontend/src/App.tsx` - React Router v7 with route definitions

**Configuration:**

- `pyproject.toml` - Python dependencies, Ruff/MyPy/Bandit config
- `noxfile.py` - Task runner for lint/test/format/security
- `package.json` - Node dependencies, pnpm scripts

## Testing Strategy

**Backend:** TDD for business logic (services), integration tests for Socket.io events
**Frontend:** Vitest for components, Playwright E2E for critical flows (room creation → roll → history)
**Security:** Bandit runs on every push (see `.github/workflows/security.yml`)

## Common Pitfalls to Avoid

1. **Never generate rolls client-side** - Always emit `roll_dice` event to server
2. **Never store room state in component state** - Use Zustand store with Socket.io sync
3. **Never use bare `except` in Python** - Catch specific exceptions (enforced by Ruff B101)
4. **Never use `any` in TypeScript** - Use `unknown` and type guards (enforced by tsconfig)
5. **Never commit without running security scan** - `uv run nox -s security` before push

## Specification-Driven Development (SDD)

This project uses the **BMad Method** (Agile SDD workflow):

- **PRD:** `docs/PRD.md` - Product requirements and user stories
- **Architecture:** `docs/architecture.md` - Technical decisions (ADRs in `docs/architecture/adrs/`)
- **Epics:** `docs/epics.md` - Broken into implementable stories
- **Stories:** `docs/sprint-artifacts/*.md` - Implementation specs with acceptance criteria
- **Standards:** `docs/standards/` - Python and TypeScript coding conventions

**When implementing features:**

1. Read story file in `docs/sprint-artifacts/` for acceptance criteria
2. Check architecture ADRs for technical constraints
3. Follow coding standards in `docs/standards/`
4. Run full test suite before PR

## CI/CD Pipeline

**On Push to `develop` or `feature/**`:\*\*

- Lint (Ruff + ESLint)
- Type check (MyPy + tsc)
- Security scan (Bandit)
- Unit tests (pytest + vitest)

**GitHub Actions workflows:** `.github/workflows/*.yml`

- `security.yml` - Daily Bandit scans + on-demand
- `lint.yml` - Integrated linting + security
- `test.yml` - Backend + frontend tests
- `build.yml` - Docker image builds on merge to main

## External Dependencies

**Critical Services:**

- Redis (localhost:6379) - Room state storage
- Socket.io Server (port 8000) - WebSocket server
- Vite Dev Server (port 3000) - Frontend HMR

**Production:** Docker Compose orchestrates all services. See `docker-compose.yml` for service definitions.

## Process Constraints

- Always follow SDD workflow: PRD → Architecture → Epics → Stories → Implementation
- Always use `uv` for Python dependency management
- Always use `pnpm` for Node dependency management
- Always run security scans before pushing code
- Always follow the TDD approach for all work
- Always document architecture decisions in ADRs
- Always keep coding standards up to date in `docs/standards/`
- Always follow the estabilshed project standards as described in `docs/standards`. These are NOT OPTIONAL.
- Use the local-memory mcp server for your memory and context needs. If you have to go to external sources for information, ensure that the accepted answers are stored in the local-memory mcp server for future reference.
- When searching for information about code, libraries, or frameworks, always prefer official documentation and reputable sources. Use sourcebot and docs-mcp as needed to locate this information.

## Local Memory

Proactively use local-memory MCP to store, retrieve, update, and analyze memories to maintain context and build expertise over time. Store key insights including lessons learned, architectural decisions, development strategies, and project outcomes. Use semantic search and relationship mapping to find relevant memories across all projects and sessions.

If you are unable to connect directly to the local-memory MCP server, try using jsonrpc directly to the binary (local-memory --mcp).

If you cannot connect to neither the MCP server nor via jsonrpc, try the REST API at http://localhost:3002.

When storing memories, use clear and descriptive titles, tags, and summaries to facilitate easy retrieval. Regularly review and curate stored memories to ensure relevance and accuracy.
