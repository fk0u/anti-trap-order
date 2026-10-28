#!/usr/bin/env bash
set -euo pipefail

SERVER="ubuntu@13.228.178.42"
KEY="EC2 Instance Key.pem"
APP_DIR="/srv/anti-trap-order"

echo "==> 1. Pushing local changes to GitHub (Private Repo)..."
git push origin main || true

echo "==> 2. Syncing codebase to EC2 via rsync..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude '*.pem' \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '.pytest_cache' \
  -e "ssh -i '$KEY' -o StrictHostKeyChecking=accept-new" \
  ./ "$SERVER:$APP_DIR/"

echo "==> 3. Rebuilding Go backend & Next.js frontend on EC2..."
ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$SERVER" "bash -c '
  cd $APP_DIR
  go build -o bin/server ./cmd/server
  go test ./...
  npm run build

  # Manage gemini-web2api AI Service
  cd $APP_DIR/services/gemini-web2api
  if [ ! -d \"venv\" ]; then
    python3 -m venv venv
    venv/bin/pip install --upgrade pip httpx
  fi
  pm2 describe ato-gemini-web2api > /dev/null 2>&1 && pm2 reload ato-gemini-web2api || pm2 start gemini_web2api.py --name ato-gemini-web2api --interpreter ./venv/bin/python3 -- --config config.json
  cd $APP_DIR

  pm2 reload anti-trap-order || pm2 restart anti-trap-order
  pm2 reload ato-backend || pm2 restart ato-backend
  pm2 save
'"

echo "==> Deployment complete! Live at: https://ato.kousozo.tech"
