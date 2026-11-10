# Auto-deploy (belum aktif)

`.github/workflows/deploy.yml` men-deploy ke VPS setiap CI di `main` hijau. Workflow ini **inert** sampai diaktifkan.

## Yang diperlukan (sekali saja)

1. **Kunci deploy khusus** (jangan pakai kunci pribadi): `ssh-keygen -t ed25519 -N "" -f ato-deploy`.
2. **Server**: salin `scripts/deploy-gate.sh` ke `~/bin/ato-deploy-gate.sh` (chmod 755), lalu tambahkan ke `~/.ssh/authorized_keys`:
   `command="/home/ubuntu/bin/ato-deploy-gate.sh",restrict ssh-ed25519 AAAA… github-actions-ato-deploy`
   Kunci ini hanya bisa rsync ke `/srv/anti-trap-order/` dan menjalankan `deploy-remote.sh` (perintah `ato-deploy`); tidak ada shell.
3. **GitHub** (repo fk0u/anti-trap-order → Settings → Secrets and variables → Actions):
   - secret `DEPLOY_SSH_KEY` = isi kunci privat `ato-deploy`
   - secret `DEPLOY_HOST` = `ubuntu@13.228.178.42`
   - secret `DEPLOY_KNOWN_HOSTS` = `13.228.178.42 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP6RmRhQqp08iI7ZqzrwktldvDwPdiIzvtDdrplyWTue`
   - variable `AUTO_DEPLOY` = `true`
4. Workflow baru aktif setelah file ini ada di `main` (merge PR).

## Deploy manual (sudah berfungsi)

```bash
DEPLOY_HOST=ubuntu@13.228.178.42 DEPLOY_KEY=/path/key.pem DEPLOY_KNOWN_HOSTS=/path/known_hosts npm run deploy
```

Server menjalankan `scripts/deploy-remote.sh`: build Go dan Next, restart pm2, cek `/api/v1/health` dan port 3120; bila gagal, kembali ke build sebelumnya (`bin/server.prev`, `.next.prev`).
