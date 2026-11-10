#!/bin/sh
# Pintu masuk kunci deploy GitHub Actions di server (dipasang sebagai `command=` di authorized_keys).
# Kunci itu HANYA boleh: (1) rsync ke /srv/anti-trap-order/, (2) menjalankan scripts/deploy-remote.sh. Tidak ada shell.
# Salin ke ~/bin/ato-deploy-gate.sh di server (di luar folder yang di-sync, supaya tidak bisa diubah lewat rsync).
set -f # tanpa glob saat memecah perintah
case "$SSH_ORIGINAL_COMMAND" in
  "rsync --server "*" . /srv/anti-trap-order/")
    # Tanpa eval: kata dipisah spasi, tanpa interpretasi shell.
    case "$SSH_ORIGINAL_COMMAND" in *";"*|*"|"*|*"&"*|*"\`"*|*'$'*|*">"*|*"<"*) echo "ditolak" >&2; exit 1;; esac
    exec $SSH_ORIGINAL_COMMAND ;;
  "ato-deploy")
    exec /bin/bash /srv/anti-trap-order/scripts/deploy-remote.sh ;;
  *)
    echo "ditolak" >&2; exit 1 ;;
esac
