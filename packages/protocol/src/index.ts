export const TRACE_SCHEMA_VERSION = 1 as const;

export interface SourcePosition {
  readonly line: number;
  readonly column: number;
}

export interface SourceLocation {
  readonly path: string;
  readonly start: SourcePosition;
  readonly end?: SourcePosition;
}

export interface TraceEventBase {
  readonly schemaVersion: typeof TRACE_SCHEMA_VERSION;
  readonly sequence: number;
  readonly source?: SourceLocation;
}

export interface SequenceCreatedEvent extends TraceEventBase {
  readonly kind: "sequence.created";
  readonly objectId: string;
  readonly displayName: string;
  readonly values: readonly number[];
}

export interface SequenceSwapEvent extends TraceEventBase {
  readonly kind: "sequence.swap";
  readonly objectId: string;
  readonly leftIndex: number;
  readonly rightIndex: number;
  readonly before: readonly number[];
  readonly after: readonly number[];
}

export type TraceEvent = SequenceCreatedEvent | SequenceSwapEvent;

export interface DiscoveredObject {
  readonly id: string;
  readonly name: string;
  readonly kind: "sequence";
  readonly cppType: string;
}

export interface AnalysisDiagnostic {
  readonly severity: "info" | "warning" | "error";
  readonly code: string;
  readonly message: string;
  readonly source?: SourceLocation;
}

export interface AnalysisResult {
  readonly supported: boolean;
  readonly diagnostics: readonly AnalysisDiagnostic[];
  readonly objects: readonly DiscoveredObject[];
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled trace event: ${JSON.stringify(value)}`);
}

function assertSwapIndex(length: number, index: number, label: string): void {
  if (index < 0) {
    throw new RangeError(`${label} must not be negative`);
  }

  if (index >= length) {
    throw new RangeError(`${label} is outside the sequence`);
  }
}

export function applyTraceEvent(
  values: readonly number[],
  event: TraceEvent,
): readonly number[] {
  switch (event.kind) {
    case "sequence.created":
      return [...event.values];
    case "sequence.swap": {
      const next = [...values];
      assertSwapIndex(next.length, event.leftIndex, "leftIndex");
      assertSwapIndex(next.length, event.rightIndex, "rightIndex");
      [next[event.leftIndex], next[event.rightIndex]] = [
        next[event.rightIndex]!,
        next[event.leftIndex]!,
      ];
      return next;
    }
    default:
      return assertNever(event);
  }
}
