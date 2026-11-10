# DNS antitraporder.web.id (NSD di VPS)

Nameserver sendiri di VPS `13.228.178.42` (EC2, IP privat `172.31.20.128`).

- `nsd.conf` → `/etc/nsd/nsd.conf` (bind ke IP privat; `systemd-resolved` memakai 127.0.0.53 sehingga tidak bentrok).
- `antitraporder.web.id.zone` → `/etc/nsd/antitraporder.web.id.zone`. Naikkan serial tiap perubahan, lalu `sudo nsd-checkzone antitraporder.web.id /etc/nsd/antitraporder.web.id.zone && sudo systemctl reload nsd`.
- Nameserver bernama `ns1.kousozo.tech` dan `ns2.kousozo.tech` (A record keduanya di DNS kousozo.tech → 13.228.178.42).
- Wajib terbuka: ufw `53/udp`, `53/tcp` (sudah) dan **Security Group EC2** inbound UDP+TCP 53.
- Catatan: satu VPS = satu titik gagal untuk seluruh domain; kedua NS menunjuk IP yang sama.
