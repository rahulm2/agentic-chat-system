FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy prisma schema, config, and generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN bunx prisma generate

# Copy source
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

# Entrypoint: push schema then start server
CMD ["sh", "-c", "bunx prisma db push && bun run src/index.ts"]
