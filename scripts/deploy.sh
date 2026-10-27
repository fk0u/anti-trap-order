#!/usr/bin/env bash
set -euo pipefail

SERVER="ubuntu@13.228.178.42"
KEY="EC2 Instance Key.pem"
APP_DIR="/srv/anti-trap-order"

echo "==> Pushing local changes to GitHub..."
git push origin main

echo "==> Pulling and rebuilding on EC2..."
ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$SERVER" "bash -c '
  cd $APP_DIR
  git pull origin main
  npm install
  npm run build
  pm2 reload anti-trap-order || pm2 restart anti-trap-order
'"

echo "==> Deployment complete! Live at: https://ato.kousozo.tech"
