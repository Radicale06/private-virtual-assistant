#!/usr/bin/env bash
# =============================================================================
# Musaed — nginx + Let's Encrypt bootstrap.
#
# Copies the site configs into /etc/nginx, enables them, and issues SSL certs
# for every domain. Idempotent: safe to re-run (re-copies config, skips certs
# that already exist — renewal is handled by certbot's own timer).
#
#   sudo ./setup.sh
#
# Env overrides:
#   CERTBOT_EMAIL=you@musaed.pro   # where Let's Encrypt sends expiry notices
#   STAGING=1                      # use LE staging (no rate limits) while testing
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------- config -----
EMAIL="${CERTBOT_EMAIL:-admin@musaed.pro}"
STAGING="${STAGING:-0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
WEBROOT="/var/www/certbot"
DHPARAM="/etc/nginx/dhparam.pem"

# Site config files (in ./sites-available) to install + enable.
SITES=(musaed.pro api.musaed.pro)

# Certificate groups — "live-name:comma,separated,domains".
# musaed.pro's cert covers www as a SAN, so both share one live dir.
CERTS=(
  "musaed.pro:musaed.pro,www.musaed.pro"
  "api.musaed.pro:api.musaed.pro"
)

# -------------------------------------------------------------- helpers ------
log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Run as root:  sudo ./setup.sh"

# create/refresh a temporary self-signed cert so nginx can start before the
# real Let's Encrypt cert exists (otherwise `nginx -t` fails on a missing file).
make_dummy() {
  local name="$1" dir="/etc/letsencrypt/live/$1"
  [ -f "$dir/fullchain.pem" ] && return 0
  log "Temporary self-signed cert for $name (until Let's Encrypt issues)…"
  mkdir -p "$dir"
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$dir/privkey.pem" -out "$dir/fullchain.pem" \
    -subj "/CN=$name" >/dev/null 2>&1
}

# ------------------------------------------------------------- 1. deps -------
if command -v apt-get >/dev/null 2>&1; then
  log "Installing nginx, certbot, openssl…"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq nginx certbot openssl
else
  warn "Non-apt system: ensure nginx, certbot and openssl are installed."
fi

# ------------------------------------------------------------- 2. dirs -------
mkdir -p "$WEBROOT" "$NGINX_AVAILABLE" "$NGINX_ENABLED"

# --------------------------------------------------------- 3. dhparam --------
# Validate, don't just check existence — an interrupted run can leave a
# truncated file. Generate to a temp path and move it into place atomically, so
# a Ctrl-C never leaves a broken dhparam.pem that nginx refuses to load.
if ! openssl dhparam -in "$DHPARAM" -check -noout >/dev/null 2>&1; then
  log "Generating DH parameters (2048-bit, one-time, ~30s — do not interrupt)…"
  openssl dhparam -out "$DHPARAM.tmp" 2048 >/dev/null 2>&1
  mv -f "$DHPARAM.tmp" "$DHPARAM"
fi

# ----------------------------------------------------- 4. copy configs -------
log "Installing site configs…"
for s in "${SITES[@]}"; do
  cp -f "$SCRIPT_DIR/sites-available/$s" "$NGINX_AVAILABLE/$s"
done

# ------------------------------------------- 5. dummy certs (bootstrap) ------
for entry in "${CERTS[@]}"; do make_dummy "${entry%%:*}"; done

# ------------------------------------------------- 6. enable the sites -------
rm -f "$NGINX_ENABLED/default"
for s in "${SITES[@]}"; do
  ln -sf "$NGINX_AVAILABLE/$s" "$NGINX_ENABLED/$s"
done

# ------------------------------------------------- 7. start nginx ------------
log "Validating nginx config…"
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx

# ------------------------------------------- 8. issue real certificates ------
CB_FLAGS=(--webroot -w "$WEBROOT" --email "$EMAIL" --agree-tos --no-eff-email --non-interactive)
[ "$STAGING" = "1" ] && { warn "STAGING mode: certs will NOT be trusted by browsers."; CB_FLAGS+=(--staging); }

for entry in "${CERTS[@]}"; do
  name="${entry%%:*}"; domains="${entry#*:}"

  if [ -f "/etc/letsencrypt/renewal/$name.conf" ]; then
    log "Certificate for $name already managed by certbot — skipping."
    continue
  fi

  log "Requesting Let's Encrypt certificate: $domains"
  # remove the self-signed placeholder so certbot writes the canonical live dir
  rm -rf "/etc/letsencrypt/live/$name" "/etc/letsencrypt/archive/$name" "/etc/letsencrypt/renewal/$name.conf"

  d_args=(); IFS=',' read -ra parts <<< "$domains"
  for d in "${parts[@]}"; do d_args+=(-d "$d"); done

  if certbot certonly "${CB_FLAGS[@]}" "${d_args[@]}"; then
    :
  else
    warn "certbot failed for $name — is the DNS A record pointing at this server?"
    make_dummy "$name"   # restore placeholder so nginx keeps serving
  fi
done

# ---------------------------------------------- 9. reload with real certs ----
log "Reloading nginx with issued certificates…"
nginx -t && systemctl reload nginx

# ---------------------------------- 10. reload nginx after future renewals ---
HOOK="/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh"
mkdir -p "$(dirname "$HOOK")"
printf '#!/usr/bin/env bash\nsystemctl reload nginx\n' > "$HOOK"
chmod +x "$HOOK"

log "Done. Live endpoints:"
echo "    https://musaed.pro"
echo "    https://www.musaed.pro   (→ apex)"
echo "    https://api.musaed.pro"
echo
warn "Renewal test:  sudo certbot renew --dry-run"
