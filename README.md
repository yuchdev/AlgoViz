# AlgoViz

AlgoViz is a GitHub-ready monorepo for a desktop application that will analyze C++ algorithms and visualize their execution. This bootstrap initializes the repository with runnable stubs, shared contracts, native build entry points, and CI workflows without implementing the Milestone 1 feature set.

## Purpose

The repository establishes the boundaries needed for future work:

```text
React frontend
    ↓
TypeScript protocol
    ↓
Tauri commands
    ↓
Rust orchestration
    ↓
Clang analyzer sidecar
```

## Architecture

- `apps/desktop`: React + Vite + Tauri desktop shell with a static array demo and Rust command bridge.
- `packages/protocol`: framework-free trace and analysis types shared by frontend and future tooling.
- `native/runtime`: standalone C++20 runtime stub for schema-versioned JSON Lines output.
- `native/clang-tool`: standalone Clang-based analyzer sidecar that discovers explicit `std::vector` declarations.
- `samples/arrays`: sample C++ algorithms for analyzer and runtime validation.

## Prerequisites

Required:

- Node.js 22+
- pnpm 10+
- stable Rust with `rustfmt` and `clippy`
- CMake 3.28+
- Ninja
- C++20 compiler

Optional for the full analyzer build:

- LLVM/Clang 18+ development packages

## Platform notes

- The browser frontend and runtime-only native build work without LLVM.
- The Tauri host uses Rust and never links LLVM into the application process.
- The analyzer is built as a standalone native executable.
- Linux Tauri development typically requires GTK/WebKit packages such as `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, and `patchelf`.
- Machine-specific `LLVM_DIR` and `Clang_DIR` values should be provided through the environment instead of being committed.

## Quick start

```bash
corepack enable
pnpm install
cmake --preset runtime-only
cmake --build --preset runtime-only
ctest --preset runtime-only
pnpm dev
```

## Full LLVM build

```bash
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
```

## Bootstrap commands

```bash
./scripts/bootstrap.sh
```

PowerShell:

```powershell
./scripts/bootstrap.ps1
```

## Development commands

```bash
pnpm run doctor
pnpm dev
pnpm dev:web
pnpm build:web
pnpm build:packages
pnpm native:configure
pnpm native:build
```

## Runtime-only build

```bash
cmake --preset runtime-only
cmake --build --preset runtime-only
ctest --preset runtime-only
```

## Full native build

```bash
cmake --preset dev
cmake --build --preset dev
ctest --preset dev
```

## Test commands

```bash
pnpm format:check
pnpm typecheck
pnpm test:ts
pnpm lint:rust
pnpm test:rust
ctest --preset runtime-only
ctest --preset dev
```

## Analyzer sample command

```bash
./build/dev/native/clang-tool/algoviz-analyzer samples/arrays/selection-sort.cpp -- -std=c++20
```

The output should contain `"name":"values"`.

## Current limitations

This bootstrap intentionally does not implement real instrumentation, sandboxed execution, reversible playback, Monaco integration, or dynamic algorithm visualization beyond a static array demo.

## Roadmap

Milestone 1 will add Monaco editing, analysis and run commands, diagnostics, array/vector detection expansion, trace streaming, playback controls, and constrained execution for supported samples. It explicitly excludes advanced data structures, threading, networking, multiple translation units, and unrestricted template/pointer support.

## License

Apache-2.0. See [LICENSE](./LICENSE).
