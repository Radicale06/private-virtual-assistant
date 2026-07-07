# Musaed — nginx + SSL deployment

Host-level nginx reverse-proxies HTTPS traffic to the Docker containers
(`docker-compose.yml`), and Let's Encrypt provides the certificates.

```
deploy/nginx/
├── sites-available/
│   ├── musaed.pro       # frontend → 127.0.0.1:13000  (+ www → apex)
│   └── api.musaed.pro   # backend   → 127.0.0.1:18000  (+ Twilio webhook)
├── setup.sh             # installs + enables everything, issues certs
└── README.md
```

Each site file is self-contained (TLS, headers and proxy settings inlined — no
shared snippets).

## 1. DNS (do this first)

At your registrar for **musaed.pro**, create these records pointing at the
server's public IP. Certs can't be issued until they resolve.

| Type | Name  | Value        |
|------|-------|--------------|
| A    | `@`   | `SERVER_IP`  |
| A    | `www` | `SERVER_IP`  |
| A    | `api` | `SERVER_IP`  |

(Add matching `AAAA` records if the server has IPv6.)

## 2. Run it

```bash
cd deploy/nginx
chmod +x setup.sh
sudo CERTBOT_EMAIL=you@musaed.pro ./setup.sh
```

The script: installs nginx/certbot → copies the site configs to
`/etc/nginx/sites-available` → creates temporary self-signed certs so nginx can
start → symlinks `sites-available → sites-enabled` → obtains real Let's Encrypt
certs over HTTP-01 → reloads → installs a renewal hook that reloads nginx.

It's **idempotent** — re-run any time to push config changes; certs already
issued are left to certbot's auto-renew timer.

Test while iterating (avoids Let's Encrypt rate limits — certs won't be
browser-trusted): `sudo STAGING=1 ./setup.sh`.

Verify renewal: `sudo certbot renew --dry-run`.

## 3. Required app changes for production

These live outside nginx but the deployment won't be correct without them.

**a) Container ports (already configured).** `docker-compose.yml` publishes on
`127.0.0.1` using a project-specific port range chosen to avoid collisions with
other services on the VPS, so nothing is exposed to the public internet —
host-nginx reaches them on localhost:

```
postgres  127.0.0.1:15432 → 5432
redis     127.0.0.1:16379 → 6379
backend   127.0.0.1:18000 → 8000    # nginx api.musaed.pro proxies here
frontend  127.0.0.1:13000 → 3000    # nginx musaed.pro proxies here
adminer   127.0.0.1:18080 → 8080    # localhost only; reach via SSH tunnel
```

Container-internal ports are unchanged, so `DATABASE_URL` (`postgres:5432`) and
`REDIS_URL` (`redis:6379`) stay the same.

**b) Point the frontend at the real API.** Set
`VITE_API_BASE_URL=https://api.musaed.pro` and rebuild the frontend. The current
`frontend` service runs the Vite dev server; for production build the static
bundle (`npm run build`) and either serve it from a prod image or point nginx's
`root` at `dist/` (commented alternative in `musaed.pro`).

**c) Trust the proxy in uvicorn (already configured).** The backend command in
`docker-compose.yml` runs uvicorn with `--proxy-headers --forwarded-allow-ips='*'`
so FastAPI sees the original HTTPS scheme/host — needed for correct redirects and
Twilio webhook signature validation.

**d) CORS.** Ensure the backend allows origin `https://musaed.pro`.

**e) Twilio.** Set the WhatsApp webhook to `https://api.musaed.pro/api/webhook`.

**f) Firewall.** Only 80/443 (and SSH) should be open:
`sudo ufw allow 22,80,443/tcp && sudo ufw enable`.
