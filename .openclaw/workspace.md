# OpenClaw Workspace

This folder contains project-specific configuration and context.

## Course Creator App

A web application for creating interactive video courses from transcripts.

### Quick Status

- **Status**: In Development
- **Stack**: Svelte + Hono + LMDB + ScoutOS
- **Deployment**: Railway (backend) + OnHyper (frontend)

### Key Files

- `PLAN.md` - Implementation plan
- `package.json` - Backend dependencies
- `frontend/` - Svelte frontend
- `src/` - Hono backend

### Commands

```bash
# Install dependencies
npm install && cd frontend && npm install && cd ..

# Run backend
npm run dev

# Run frontend
npm run frontend:dev
```