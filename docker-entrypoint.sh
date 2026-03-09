#!/bin/sh
set -e

echo "🚀 Starting Fique Ryco application..."

# Wait a bit for postgres to be fully ready
echo "⏳ Waiting for database to be ready..."
sleep 2

# Run migrations (reads from prisma.config.ts)
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Start the application
echo "🎯 Starting NestJS application..."
exec node dist/src/main
