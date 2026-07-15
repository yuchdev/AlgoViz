import { rmSync } from "node:fs";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const pathsToRemove = [
  "build",
  "coverage",
  "apps/desktop/dist",
  "packages/protocol/dist",
  "target",
];

for (const relativePath of pathsToRemove) {
  rmSync(resolve(rootDir, relativePath), { force: true, recursive: true });
}
