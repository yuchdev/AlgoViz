import { describe, expect, expectTypeOf, it } from "vitest";

import {
  TRACE_SCHEMA_VERSION,
  applyTraceEvent,
  type AnalysisDiagnostic,
  type SequenceCreatedEvent,
  type SequenceSwapEvent,
  type TraceEvent,
} from "../src/index.js";

describe("applyTraceEvent", () => {
  it("copies values for sequence creation", () => {
    const values = [99];
    const event: SequenceCreatedEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 1,
      kind: "sequence.created",
      objectId: "values-1",
      displayName: "values",
      values: [7, 4, 9, 1, 3],
    };

    const next = applyTraceEvent(values, event);

    expect(next).toEqual([7, 4, 9, 1, 3]);
    expect(next).not.toBe(event.values);
  });

  it("applies a valid swap without mutating the input", () => {
    const source = [7, 4, 9, 1, 3];
    const event: SequenceSwapEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 2,
      kind: "sequence.swap",
      objectId: "values-1",
      leftIndex: 0,
      rightIndex: 3,
      before: [7, 4, 9, 1, 3],
      after: [1, 4, 9, 7, 3],
    };

    const next = applyTraceEvent(source, event);

    expect(next).toEqual([1, 4, 9, 7, 3]);
    expect(source).toEqual([7, 4, 9, 1, 3]);
    expect(next).not.toBe(source);
  });

  it("rejects negative indexes", () => {
    const event: SequenceSwapEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 3,
      kind: "sequence.swap",
      objectId: "values-1",
      leftIndex: -1,
      rightIndex: 1,
      before: [1, 2, 3],
      after: [2, 1, 3],
    };

    expect(() => applyTraceEvent([1, 2, 3], event)).toThrowError(
      /must not be negative/,
    );
  });

  it("rejects out-of-range indexes", () => {
    const event: SequenceSwapEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 4,
      kind: "sequence.swap",
      objectId: "values-1",
      leftIndex: 0,
      rightIndex: 4,
      before: [1, 2, 3],
      after: [3, 2, 1],
    };

    expect(() => applyTraceEvent([1, 2, 3], event)).toThrowError(
      /outside the sequence/,
    );
  });

  it("retains schema typing for trace events and diagnostics", () => {
    const event: TraceEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 1,
      kind: "sequence.created",
      objectId: "values-1",
      displayName: "values",
      values: [1, 2, 3],
    };
    const diagnostic = {
      severity: "error",
      code: "clang.parse_failed",
      message: "Unable to analyze source",
    } satisfies AnalysisDiagnostic;

    expectTypeOf(event.schemaVersion).toEqualTypeOf<1>();
    expectTypeOf(diagnostic.severity).toEqualTypeOf<"error">();
  });
});
