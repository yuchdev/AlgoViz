$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$llvmRoot = "C:\Program Files\LLVM"
if (Test-Path $llvmRoot) {
  $llvmBin = Join-Path $llvmRoot "bin"
  $env:PATH = "$llvmBin;$env:PATH"
  $env:LLVM_DIR = Join-Path $llvmRoot "lib\cmake\llvm"
  $env:Clang_DIR = Join-Path $llvmRoot "lib\cmake\clang"
}

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
