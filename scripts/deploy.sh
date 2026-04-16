#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "[deploy] Pulling latest..."
git pull origin main

echo "[deploy] Installing pipeline deps..."
cd pipeline && npm install --production && npx tsc && cd ..

echo "[deploy] Installing renderer deps..."
cd renderer && npm install --production && npx tsc && cd ..

echo "[deploy] Restarting PM2..."
pm2 restart ecosystem.config.cjs

echo "[deploy] Done!"
