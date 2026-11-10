#!/usr/bin/env bash
# Deploy ke server. Akses server diambil dari environment, bukan disimpan di repo:
#   DEPLOY_HOST=user@host DEPLOY_KEY=/path/key.pem DEPLOY_DIR=/srv/anti-trap-order npm run deploy
# Push ke GitHub dilakukan terpisah (lewat PR), bukan oleh script ini.
set -euo pipefail

: "${DEPLOY_HOST:?Set DEPLOY_HOST (mis. user@host)}"
: "${DEPLOY_KEY:?Set DEPLOY_KEY (path ke SSH key)}"
DEPLOY_DIR="${DEPLOY_DIR:-/srv/anti-trap-order}"
SSH=(ssh -i "$DEPLOY_KEY" -o StrictHostKeyChecking=accept-new)

echo "==> 1. Sinkronisasi kode ke server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'demo/video/target' \
  --exclude 'demo/video/out.mp4' \
  --exclude 'e2e/node_modules' \
  --exclude '*.pem' \
  -e "${SSH[*]}" \
  ./ "$DEPLOY_HOST:$DEPLOY_DIR/"

echo "==> 2. Build dan restart di server..."
"${SSH[@]}" "$DEPLOY_HOST" "bash -c '
  set -e
  cd $DEPLOY_DIR
  go test ./...
  go build -o bin/server ./cmd/server
  npm run build
  pm2 delete ato-gemini-web2api > /dev/null 2>&1 || true
  pm2 reload anti-trap-order || pm2 restart anti-trap-order
  pm2 reload ato-backend || pm2 restart ato-backend
  pm2 save
'"

echo "==> Deploy selesai."
