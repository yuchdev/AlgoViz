import { spawnSync } from "node:child_process";

const [, , analyzerPath, samplePath, expectation] = process.argv;

if (!analyzerPath || !samplePath || !expectation) {
  console.error(
    "Usage: node verify-analysis.mjs <analyzer> <sample> <expectation>",
  );
  process.exit(1);
}

const result = spawnSync(analyzerPath, [samplePath, "--", "-std=c++20"], {
  encoding: "utf8",
});

if (expectation === "invalid") {
  if (result.status === 0) {
    console.error("Expected analyzer to fail for invalid input");
    process.exit(1);
  }

  const parsed = JSON.parse(result.stdout);
  if (parsed.supported !== false) {
    console.error("Expected supported=false for invalid input");
    process.exit(1);
  }

  if (!Array.isArray(parsed.diagnostics) || parsed.diagnostics.length === 0) {
    console.error("Expected diagnostics for invalid input");
    process.exit(1);
  }

  process.exit(0);
}

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const parsed = JSON.parse(result.stdout);
if (parsed.supported !== true) {
  console.error("Expected supported=true");
  process.exit(1);
}

if (!Array.isArray(parsed.objects)) {
  console.error("Expected objects array");
  process.exit(1);
}

if (expectation === "one-vector") {
  if (parsed.objects.length !== 1) {
    console.error(`Expected 1 object, received ${parsed.objects.length}`);
    process.exit(1);
  }

  const [object] = parsed.objects;
  if (
    object.id !== "object-1" ||
    object.name !== "values" ||
    object.kind !== "sequence"
  ) {
    console.error("Unexpected object metadata for one-vector case");
    process.exit(1);
  }

  if (
    typeof object.cppType !== "string" ||
    !object.cppType.includes("vector")
  ) {
    console.error("Expected cppType to describe a vector");
    process.exit(1);
  }
}

if (expectation === "two-vectors") {
  if (parsed.objects.length !== 2) {
    console.error(`Expected 2 objects, received ${parsed.objects.length}`);
    process.exit(1);
  }

  const names = parsed.objects.map((object) => object.name).sort();
  if (names.join(",") !== "scratch,values") {
    console.error(`Unexpected object names: ${names.join(",")}`);
    process.exit(1);
  }
}

if (expectation === "no-vector" && parsed.objects.length !== 0) {
  console.error(`Expected no objects, received ${parsed.objects.length}`);
  process.exit(1);
}
