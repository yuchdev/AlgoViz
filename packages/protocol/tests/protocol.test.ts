import { describe, expect, it } from "vitest";

import {
  TRACE_SCHEMA_VERSION,
  applyTraceEvent,
  type SequenceSwapEvent,
} from "../src/index.js";

describe("applyTraceEvent", () => {
  it("applies a swap without mutating the input", () => {
    const source = [7, 4, 9];

    const event: SequenceSwapEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 1,
      kind: "sequence.swap",
      objectId: "values-1",
      leftIndex: 0,
      rightIndex: 1,
    };

    expect(applyTraceEvent(source, event)).toEqual([4, 7, 9]);
    expect(source).toEqual([7, 4, 9]);
  });

  it("throws when a swap index is outside the sequence", () => {
    const event: SequenceSwapEvent = {
      schemaVersion: TRACE_SCHEMA_VERSION,
      sequence: 2,
      kind: "sequence.swap",
      objectId: "values-1",
      leftIndex: 0,
      rightIndex: 4,
    };

    expect(() => applyTraceEvent([1, 2, 3], event)).toThrowError(RangeError);
  });
});
