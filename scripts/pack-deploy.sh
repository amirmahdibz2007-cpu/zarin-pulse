#!/usr/bin/env bash
# Package standalone Next.js build for VPS deploy from real-problem.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deploy/zarinpulse"
WEB="$ROOT/apps/web"

rm -rf "$OUT"
mkdir -p "$OUT"

# Standalone server bundle (copies node_modules and standalone server)
cp -a "$WEB/.next/standalone/." "$OUT/"

# Static assets required by Next
mkdir -p "$OUT/apps/web/.next"
cp -a "$WEB/.next/static" "$OUT/apps/web/.next/static"
mkdir -p "$OUT/apps/web/public"
cp -a "$WEB/public/." "$OUT/apps/web/public/"

# Runtime data + docs (pages and API routes read these from disk)
mkdir -p "$OUT/data"
cp -a "$ROOT/data/artifacts" "$OUT/data/artifacts"

# Env template
cat > "$OUT/.env" <<'EOF'
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
ARTIFACTS_ROOT=/opt/zarinpulse/data/artifacts
OPENROUTER_API_KEY="${OPENROUTER_API_KEY:-}"
OPENROUTER_HTTP_REFERER="${OPENROUTER_HTTP_REFERER:-http://localhost:3000}"
EOF

cat > "$OUT/start.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
set -a
[ -f .env ] && . ./.env
set +a
export ARTIFACTS_ROOT="${ARTIFACTS_ROOT:-$(pwd)/data/artifacts}"
cd apps/web
exec node server.js
EOF
chmod +x "$OUT/start.sh"

# Tar for transfer
mkdir -p "$ROOT/deploy"
TAR="$ROOT/deploy/zarinpulse-deploy.tar.gz"
rm -f "$TAR"
tar -C "$ROOT/deploy" -czf "$TAR" zarinpulse
echo "Packed: $TAR ($(du -h "$TAR" | awk '{print $1}'))"
