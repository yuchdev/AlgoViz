import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const locatorCommand = isWindows ? "where" : "which";

const tools = [
  {
    label: "Git",
    required: true,
    minimumVersion: null,
    commands: [{ executable: "git", versionArgs: ["--version"] }],
  },
  {
    label: "Node",
    required: true,
    minimumVersion: "22.0.0",
    commands: [{ executable: "node", versionArgs: ["--version"] }],
  },
  {
    label: "pnpm",
    required: true,
    minimumVersion: "10.0.0",
    commands: [{ executable: "pnpm", versionArgs: ["--version"] }],
  },
  {
    label: "rustc",
    required: true,
    minimumVersion: null,
    commands: [{ executable: "rustc", versionArgs: ["--version"] }],
  },
  {
    label: "cargo",
    required: true,
    minimumVersion: null,
    commands: [{ executable: "cargo", versionArgs: ["--version"] }],
  },
  {
    label: "CMake",
    required: true,
    minimumVersion: "3.28.0",
    commands: [{ executable: "cmake", versionArgs: ["--version"] }],
  },
  {
    label: "Ninja",
    required: true,
    minimumVersion: null,
    commands: [{ executable: "ninja", versionArgs: ["--version"] }],
  },
  {
    label: "Clang",
    required: false,
    minimumVersion: null,
    commands: [
      { executable: "clang++", versionArgs: ["--version"] },
      { executable: "clang", versionArgs: ["--version"] },
      { executable: "clang-cl", versionArgs: ["--version"] },
    ],
  },
  {
    label: "clang-format",
    required: false,
    minimumVersion: null,
    commands: [{ executable: "clang-format", versionArgs: ["--version"] }],
  },
];

function parseVersion(text) {
  const match = text.match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) {
    return null;
  }

  return match.slice(1).map((part) => Number(part ?? "0"));
}

function compareVersions(left, right) {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

function locateExecutable(executable) {
  const result = spawnSync(locatorCommand, [executable], { encoding: "utf8" });
  return result.status === 0;
}

function runVersionCommand(executable, versionArgs) {
  return spawnSync(executable, versionArgs, { encoding: "utf8" });
}

let failed = false;
let optionalLlvmFound = false;

for (const tool of tools) {
  const command = tool.commands.find((candidate) =>
    locateExecutable(candidate.executable),
  );

  if (!command) {
    const prefix = tool.required ? "ERROR" : "WARN";
    console.log(`${prefix}: ${tool.label} not found`);
    failed ||= tool.required;
    continue;
  }

  const versionResult = runVersionCommand(
    command.executable,
    command.versionArgs,
  );
  const versionLine =
    `${versionResult.stdout}${versionResult.stderr}`
      .split(/\r?\n/, 1)[0]
      ?.trim() || "version unavailable";
  console.log(`${tool.label}: ${versionLine}`);

  if (tool.label === "Clang") {
    optionalLlvmFound = true;
  }

  if (tool.minimumVersion !== null) {
    const detectedVersion = parseVersion(versionLine);
    const minimumVersion = parseVersion(tool.minimumVersion);

    if (
      detectedVersion === null ||
      minimumVersion === null ||
      compareVersions(detectedVersion, minimumVersion) < 0
    ) {
      console.log(
        `ERROR: ${tool.label} ${tool.minimumVersion}+ is required (detected: ${versionLine})`,
      );
      failed = true;
    }
  }
}

console.log(`LLVM_DIR: ${process.env.LLVM_DIR ?? "(not set)"}`);
console.log(`Clang_DIR: ${process.env.Clang_DIR ?? "(not set)"}`);
console.log(
  optionalLlvmFound
    ? "INFO: LLVM/Clang tooling detected; analyzer builds should be available when CMake package paths are configured."
    : "INFO: LLVM/Clang tooling is optional for runtime-only development but required to build the analyzer.",
);

if (failed) {
  process.exitCode = 1;
}
