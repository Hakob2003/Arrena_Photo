#!/usr/bin/env bash

# Exit on error
set -o errexit

echo "==> Starting Frontend Build with Cache..."

# Define paths
RENDER_CACHE_DIR="/opt/render/project/.render/cache/next"
LOCAL_CACHE_DIR="apps/frontend/.next/cache"

# 1. Restore the cache if it exists
if [ -d "$RENDER_CACHE_DIR" ]; then
  echo "==> Restoring Next.js cache from previous build..."
  mkdir -p "apps/frontend/.next"
  cp -r "$RENDER_CACHE_DIR" "$LOCAL_CACHE_DIR" || echo "Failed to restore cache"
else
  echo "==> No existing cache found. A new one will be created."
fi

# 2. Install dependencies
echo "==> Installing dependencies..."
NODE_ENV=development pnpm install --no-frozen-lockfile

# 3. Build the frontend
echo "==> Building Next.js application..."
pnpm --filter @arrena-photo/frontend run build

# 4. Save the new cache for future builds
echo "==> Saving Next.js cache for future builds..."
mkdir -p "/opt/render/project/.render/cache"
rm -rf "$RENDER_CACHE_DIR"
cp -r "$LOCAL_CACHE_DIR" "$RENDER_CACHE_DIR" || echo "Failed to save cache"

echo "==> Frontend Build Completed Successfully!"
