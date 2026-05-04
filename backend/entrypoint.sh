#!/bin/sh
set -e

echo "Running database migrations..."
bunx prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting server..."
exec bun run src/index.ts
