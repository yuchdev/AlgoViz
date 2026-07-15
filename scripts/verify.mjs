import { spawnSync } from "node:child_process";

const runtimeOnly = process.argv.includes("--runtime-only");
const preset = runtimeOnly ? "runtime-only" : "dev";
const commands = [
  ["pnpm", ["format:check"]],
  ["pnpm", ["typecheck"]],
  ["pnpm", ["test:ts"]],
  ["cargo", ["fmt", "--all", "--", "--check"]],
  [
    "cargo",
    [
      "clippy",
      "--workspace",
      "--all-targets",
      "--all-features",
      "--",
      "-D",
      "warnings",
    ],
  ],
  ["cargo", ["test", "--workspace"]],
  ["cmake", ["--preset", preset]],
  ["cmake", ["--build", "--preset", preset]],
  ["ctest", ["--preset", preset]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
