export const TRACE_SCHEMA_VERSION = 1 as const;

export interface SequenceCreatedEvent {
  readonly schemaVersion: typeof TRACE_SCHEMA_VERSION;
  readonly sequence: number;
  readonly kind: "sequence.created";
  readonly objectId: string;
  readonly displayName: string;
  readonly values: readonly number[];
}

export interface SequenceSwapEvent {
  readonly schemaVersion: typeof TRACE_SCHEMA_VERSION;
  readonly sequence: number;
  readonly kind: "sequence.swap";
  readonly objectId: string;
  readonly leftIndex: number;
  readonly rightIndex: number;
}

export type TraceEvent = SequenceCreatedEvent | SequenceSwapEvent;

export interface DiscoveredObject {
  readonly id: string;
  readonly name: string;
  readonly kind: "sequence";
  readonly cppType: string;
}

export interface AnalysisResult {
  readonly supported: boolean;
  readonly diagnostics: readonly string[];
  readonly objects: readonly DiscoveredObject[];
}

export function applyTraceEvent(
  values: readonly number[],
  event: TraceEvent,
): readonly number[] {
  if (event.kind === "sequence.created") {
    return [...event.values];
  }

  const next = [...values];

  if (
    event.leftIndex < 0 ||
    event.rightIndex < 0 ||
    event.leftIndex >= next.length ||
    event.rightIndex >= next.length
  ) {
    throw new RangeError("Swap index is outside the sequence");
  }

  [next[event.leftIndex], next[event.rightIndex]] = [
    next[event.rightIndex]!,
    next[event.leftIndex]!,
  ];

  return next;
}
