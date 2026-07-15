#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

preset="dev"
verify_args=()
if [[ "${1:-}" == "--runtime-only" ]]; then
  preset="runtime-only"
  verify_args=(--runtime-only)
elif [[ $# -gt 0 ]]; then
  echo "Usage: ./scripts/bootstrap.sh [--runtime-only]" >&2
  exit 1
fi

corepack enable
rustup default stable
rustup component add rustfmt clippy
pnpm install --frozen-lockfile
node scripts/doctor.mjs
pnpm build:packages
pnpm test:ts
pnpm test:rust
cmake --preset "$preset"
cmake --build --preset "$preset"
ctest --preset "$preset"

echo
echo "Next commands:"
echo "  pnpm dev:web"
echo "  pnpm dev"
echo "  node scripts/verify.mjs ${verify_args[*]}"
