# AlgoViz

AlgoViz is a monorepo scaffold for a future desktop application that analyzes C++ algorithms and visualizes their execution without running user code inside the Tauri process.

## Current scope

This repository currently provides reliable development scaffolding only:

- React/Vite frontend stub
- shared TypeScript protocol package
- Tauri 2 Rust host stub
- standalone C++ runtime stub
- standalone Clang LibTooling analyzer stub
- workspace scripts, CMake presets, and CI

Milestone 1 instrumentation, compilation, sandboxing, Monaco integration, and real playback are intentionally out of scope.

## Architecture

```text
apps/desktop (React + Vite UI)
  -> packages/protocol (shared TS types and reducer)
  -> apps/desktop/src-tauri (Rust Tauri commands)
  -> native/clang-tool (standalone analyzer executable)
  -> native/runtime (standalone C++ runtime library)
```

## Repository map

```text
apps/desktop
packages/protocol
packages/tsconfig
native/runtime
native/clang-tool
samples/arrays
samples/invalid
scripts
.github/workflows
.vscode
```

## Prerequisites

### All platforms

Required:

- Git
- Node.js 22+
- Corepack enabled
- pnpm 10+
- stable Rust with `rustfmt` and `clippy`
- CMake 3.28+
- Ninja
- a C++20 compiler

Optional for the analyzer:

- LLVM/Clang development packages discoverable by CMake

### Linux

For Tauri development on Ubuntu/Debian-like systems, install packages such as:

```bash
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

### LLVM path examples

- Apple Silicon Homebrew: `export LLVM_DIR=/opt/homebrew/opt/llvm/lib/cmake/llvm`
- Intel Homebrew: `export LLVM_DIR=/usr/local/opt/llvm/lib/cmake/llvm`
- Windows LLVM default install: `C:\Program Files\LLVM\lib\cmake\llvm`
- Linux packages often install to `/usr/lib/llvm-18/lib/cmake/llvm` and `/usr/lib/llvm-18/lib/cmake/clang`

Set both when needed:

```bash
export LLVM_DIR=/path/to/llvm/lib/cmake/llvm
export Clang_DIR=/path/to/llvm/lib/cmake/clang
```

## Corepack and pnpm setup

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm doctor
```

## Runtime-only quick start

```bash
./scripts/bootstrap.sh --runtime-only
pnpm dev:web
```

PowerShell:

```powershell
./scripts/bootstrap.ps1 -RuntimeOnly
pnpm dev:web
```

## Full LLVM quick start

```bash
./scripts/bootstrap.sh
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
```

## Development commands

### Browser-only frontend

```bash
pnpm dev:web
```

### Tauri desktop app

```bash
pnpm dev
```

### Shared packages and web build

```bash
pnpm build:packages
pnpm build:web
```

### Verification commands

```bash
node scripts/verify.mjs --runtime-only
node scripts/verify.mjs
```

The runtime-only validation path from a clean checkout is:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm doctor
pnpm build:packages
pnpm typecheck
pnpm test:ts
pnpm test:rust
cmake --preset runtime-only
cmake --build --preset runtime-only
ctest --preset runtime-only
pnpm build:web
```

The full native path is:

```bash
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
```

## Analyzer sample command

Unix:

```bash
./build/dev/native/clang-tool/algoviz-analyzer samples/arrays/selection-sort.cpp -- -std=c++20
```

Windows:

```powershell
.\build\dev\native\clang-tool\algoviz-analyzer.exe samples\arrays\selection-sort.cpp -- -std=c++20
```

Expected result: valid JSON with an object named `values`.

## Local CMakeUserPresets.json example

Do not commit this file. Create it locally when LLVM lives outside a default search path:

```json
{
  "version": 6,
  "configurePresets": [
    {
      "name": "local-dev",
      "inherits": "dev",
      "environment": {
        "LLVM_DIR": "/path/to/llvm/lib/cmake/llvm",
        "Clang_DIR": "/path/to/llvm/lib/cmake/clang"
      }
    }
  ]
}
```

## VS Code notes

Use CMake presets and point clangd at the selected build directory's `compile_commands.json`. Create a local symlink or copy at the repository root if your editor requires it; do not commit that file.

## Troubleshooting

- **CMake cannot find LLVM**: set `LLVM_DIR` to the directory containing `LLVMConfig.cmake`.
- **CMake cannot find Clang**: set `Clang_DIR` to the directory containing `ClangConfig.cmake`.
- **Tauri Linux WebKit dependencies missing**: install the GTK/WebKit packages listed above before running Rust tests or `pnpm dev`.
- **pnpm version mismatch**: run `corepack enable` and reinstall with the repository's pinned pnpm version.
- **Rust command not found after rustup install**: restart the shell or source Cargo's environment setup.
- **`clang-cpp` target unavailable**: the CMake build falls back to explicit Clang libraries when exported `clang-cpp` is missing.
- **Browser mode cannot call Tauri**: `pnpm dev:web` intentionally reports browser-only backend status and does not invoke Tauri IPC.
- **Analyzer binary not discovered by the desktop stub**: build the `dev` or `release` native preset from the repository root so the Rust host can find `build/*/native/clang-tool/algoviz-analyzer`.

## Current limitations

- no source rewriting
- no instrumented `std::vector`
- no user-code compilation pipeline
- no execution sandbox
- no JSON Lines trace streaming UI
- no Monaco editor integration
- no real diagnostics UI
- no timeline or playback engine
- no non-sequence data structure support
- no release signing or notarization

## Milestone 1 boundary

Milestone 1 begins when repository scaffolding is already stable. It will add real editor, analysis, execution, and playback features, but this change does not implement any of that functionality.

## License

Apache-2.0. See [LICENSE](./LICENSE).
