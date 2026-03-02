FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lockb* package-lock.json* yarn.lock* ./
RUN bun install --frozen-lockfile || npm ci

# Build
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build || npm run build

# Production
FROM base AS release
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

# Create data directory for LMDB
RUN mkdir -p /app/data
ENV LMDB_PATH=/app/data/courses.lmdb
ENV PORT=3001

EXPOSE 3001
CMD ["bun", "run", "start"]