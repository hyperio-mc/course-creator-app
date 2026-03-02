FROM oven/bun:1 AS base
WORKDIR /app

# Install backend dependencies
FROM base AS backend-deps
COPY package.json bun.lock* package-lock.json* ./
RUN bun install --frozen-lockfile

# Install frontend dependencies and build
FROM base AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/bun.lock* frontend/package-lock.json* ./frontend_temp/
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* frontend/package-lock.json* ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# Production
FROM base AS release
WORKDIR /app
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