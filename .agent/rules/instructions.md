---
trigger: always_on
---

# AI Coding Agent Instructions - Wishlist Instructions

**Production:** Docker Compose orchestrates all services. See `docker-compose.yml` for service definitions.

** REQUIREMENTS **
- Always use `uv` for Python dependency management
- Always use `pnpm` for Node dependency management
- Always run security scans before pushing code
- Always follow the TDD approach for all work
- Always document architecture decisions in ADRs

- Proactively use the local-memory mcp server for your memory and context needs. If you have to go to external sources for information, ensure that the accepted answers are stored in the local-memory mcp server for future reference.

- When searching for information about code, libraries, or frameworks, always prefer official documentation and reputable sources. Use sourcebot and docs-mcp as needed to locate this information.

