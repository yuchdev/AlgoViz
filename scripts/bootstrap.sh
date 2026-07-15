#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

corepack enable
rustup default stable
rustup component add rustfmt clippy
pnpm install
pnpm run doctor
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
pnpm build:packages
pnpm test:ts
pnpm test:rust
