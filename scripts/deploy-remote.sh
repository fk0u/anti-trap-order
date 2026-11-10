#!/usr/bin/env bash
# Dijalankan DI SERVER setelah kode tersinkron ke /srv/anti-trap-order (oleh GitHub Actions atau scripts/deploy.sh).
# Membangun backend Go dan frontend Next, restart pm2, cek kesehatan, dan rollback otomatis bila gagal.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$PATH:/usr/local/go/bin:$HOME/go/bin"

log() { echo "==> $*"; }

log "Build backend (Go)"
go build -o bin/server.new ./cmd/server

log "Cadangkan build lama"
[ -f bin/server ] && cp -f bin/server bin/server.prev
rm -rf .next.prev
[ -d .next ] && cp -a .next .next.prev

log "Pasang dependensi dan build frontend (Next)"
npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=1024 npm run build

log "Ganti binary dan restart pm2"
mv -f bin/server.new bin/server
pm2 restart ato-backend anti-trap-order --update-env >/dev/null

healthy() {
  for _ in $(seq 1 20); do
    if curl -fsS -o /dev/null http://127.0.0.1:8080/api/v1/health && curl -fsS -o /dev/null http://127.0.0.1:3120/; then return 0; fi
    sleep 2
  done
  return 1
}

if healthy; then
  pm2 save >/dev/null
  log "Deploy selesai dan sehat: $(curl -fsS http://127.0.0.1:8080/api/v1/health)"
else
  log "GAGAL sehat, rollback ke build sebelumnya"
  [ -f bin/server.prev ] && mv -f bin/server.prev bin/server
  if [ -d .next.prev ]; then rm -rf .next && mv .next.prev .next; fi
  pm2 restart ato-backend anti-trap-order >/dev/null
  exit 1
fi
