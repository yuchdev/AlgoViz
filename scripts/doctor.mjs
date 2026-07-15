import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const locator = isWindows ? "where" : "which";

const tools = [
  { name: "git", required: true },
  { name: "node", required: true },
  { name: "pnpm", required: true },
  { name: "rustc", required: true },
  { name: "cargo", required: true },
  { name: "cmake", required: true },
  { name: "ninja", required: true },
  { name: "clang++", required: false },
];

let failed = false;

for (const tool of tools) {
  const located = spawnSync(locator, [tool.name], { encoding: "utf8" });
  if (located.status !== 0) {
    const prefix = tool.required ? "ERROR" : "WARN";
    console.log(`${prefix}: ${tool.name} not found`);
    failed ||= tool.required;
    continue;
  }

  const version = spawnSync(tool.name, ["--version"], { encoding: "utf8" });
  const line =
    `${version.stdout}${version.stderr}`.split(/\r?\n/, 1)[0] ??
    "version unavailable";
  console.log(`${tool.name}: ${line}`);
}

console.log(`LLVM_DIR: ${process.env.LLVM_DIR ?? "(not set)"}`);
console.log(`Clang_DIR: ${process.env.Clang_DIR ?? "(not set)"}`);

if (failed) {
  process.exitCode = 1;
}
