FROM oven/bun:1 AS base
WORKDIR /app

# Install backend dependencies
FROM base AS backend-deps
COPY package.json bun.lockb* package-lock.json* yarn.lock* ./
RUN bun install --frozen-lockfile || npm ci

# Install frontend dependencies and build
FROM base AS frontend-build
COPY frontend/package.json frontend/bun.lockb* frontend/package-lock.json* frontend/yarn.lock* ./frontend/
WORKDIR /app/frontend
RUN bun install --frozen-lockfile || npm ci --legacy-peer-deps
COPY frontend/ ./
RUN bun run build || npm run build

# Production
FROM base AS release
COPY --from=backend-deps /app/node_modules ./node_modules
COPY package.json ./
COPY src/ ./src/
COPY tsconfig.json ./
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Create data directory for LMDB
RUN mkdir -p /app/data
ENV LMDB_PATH=/app/data/courses.lmdb
ENV PORT=3001

EXPOSE 3001
CMD ["bun", "run", "start"]