FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the frontend (using Turborepo or directly)
RUN bun run --filter @elysia-tiku/web build

# Expose the server port
EXPOSE 300

# Start the server
CMD ["bun", "run", "--filter", "@elysia-tiku/server", "start"]
