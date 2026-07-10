#!/usr/bin/env bash
# =============================================================================
# Musaed — build & start the whole stack (backend + frontend), each its own
# compose project. Run from anywhere:  ./start-all.sh
#
#   Backend  → backend/docker-compose.yml   (postgres, redis, adminer, api, worker, beat)
#   Frontend → frontend/docker-compose.yml  (vite dev server)
#
# Detached (-d) so both stacks come up. Tail logs with:
#   docker compose -f backend/docker-compose.yml logs -f
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend/docker-compose.yml"
FRONTEND="$ROOT/frontend/docker-compose.yml"

[ -f "$ROOT/backend/.env" ] || {
  echo "[error] backend/.env is missing — copy backend/.env.example and fill in secrets." >&2
  exit 1
}

echo "==> Backend stack (postgres, redis, adminer, api, worker, beat)…"
docker compose -f "$BACKEND" up -d --build

echo "==> Frontend stack…"
docker compose -f "$FRONTEND" up -d --build

echo
echo "==> Status:"
docker compose -f "$BACKEND" ps
docker compose -f "$FRONTEND" ps
echo
echo "Done. Local ports (bound to 127.0.0.1): api 18000 · frontend 13000 · adminer 18080 · pg 15432 · redis 16379"
