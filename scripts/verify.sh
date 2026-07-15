#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

pnpm run doctor
pnpm format:check
pnpm typecheck
pnpm test:ts
pnpm lint:rust
pnpm test:rust
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
