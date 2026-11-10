#!/usr/bin/env bash
# Deploy manual ke server. Akses dari environment, bukan disimpan di repo:
#   DEPLOY_HOST=user@host DEPLOY_KEY=/path/key.pem [DEPLOY_DIR=/srv/anti-trap-order] [DEPLOY_KNOWN_HOSTS=/path/known_hosts] npm run deploy
# Deploy otomatis (push ke main) ada di .github/workflows/deploy.yml dan memakai langkah yang sama.
set -euo pipefail

: "${DEPLOY_HOST:?Set DEPLOY_HOST (mis. user@host)}"
: "${DEPLOY_KEY:?Set DEPLOY_KEY (path ke SSH key)}"
DEPLOY_DIR="${DEPLOY_DIR:-/srv/anti-trap-order}"
SSH=(ssh -i "$DEPLOY_KEY" -o IdentitiesOnly=yes)
if [ -n "${DEPLOY_KNOWN_HOSTS:-}" ]; then SSH+=(-o "UserKnownHostsFile=$DEPLOY_KNOWN_HOSTS" -o StrictHostKeyChecking=yes); else SSH+=(-o StrictHostKeyChecking=accept-new); fi

echo "==> 1. Sinkronisasi kode ke server..."
rsync -az --delete \
  --exclude 'node_modules' --exclude '.next' --exclude '.next.prev' --exclude '.git' \
  --exclude '.env*' --exclude '*.pem' \
  --exclude 'bin' --exclude 'services' \
  --exclude 'demo' --exclude 'e2e' --exclude 'testdata' --exclude 'deploy' \
  -e "${SSH[*]}" \
  ./ "$DEPLOY_HOST:$DEPLOY_DIR/"

echo "==> 2. Build, restart, dan cek kesehatan di server..."
"${SSH[@]}" "$DEPLOY_HOST" "bash $DEPLOY_DIR/scripts/deploy-remote.sh"
