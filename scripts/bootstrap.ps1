param(
  [switch]$RuntimeOnly
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$preset = if ($RuntimeOnly) { "runtime-only" } else { "dev" }

corepack enable
rustup default stable
rustup component add rustfmt clippy
pnpm install --frozen-lockfile
node scripts/doctor.mjs
pnpm build:packages
pnpm test:ts
pnpm test:rust
cmake --preset $preset
cmake --build --preset $preset
ctest --preset $preset

Write-Host ""
Write-Host "Next commands:"
Write-Host "  pnpm dev:web"
Write-Host "  pnpm dev"
if ($RuntimeOnly) {
  Write-Host "  node scripts/verify.mjs --runtime-only"
} else {
  Write-Host "  node scripts/verify.mjs"
}
