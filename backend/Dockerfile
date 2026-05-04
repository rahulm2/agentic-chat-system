# Stage 1: Install dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN bun install --frozen-lockfile

# Stage 2: Generate Prisma client
FROM deps AS build
WORKDIR /app
COPY . .
RUN bunx prisma generate --schema=prisma/schema.prisma

# Stage 3: Production image
FROM oven/bun:1-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy only what's needed
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

USER appuser

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
