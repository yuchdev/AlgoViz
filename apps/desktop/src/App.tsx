import { useEffect, useMemo, useState } from "react";

import {
  TRACE_SCHEMA_VERSION,
  applyTraceEvent,
  type SequenceSwapEvent,
} from "@algoviz/protocol";

import { ArrayVisualizer } from "./components/ArrayVisualizer";
import { getBackendInformation, pingBackend } from "./lib/tauri";

const INITIAL_VALUES = [7, 4, 9, 1, 3] as const;
const HIGHLIGHTED_INDICES = [0, 3] as const;

const DEMO_SWAP_EVENT: SequenceSwapEvent = {
  schemaVersion: TRACE_SCHEMA_VERSION,
  sequence: 1,
  kind: "sequence.swap",
  objectId: "values-1",
  leftIndex: 0,
  rightIndex: 3,
  before: INITIAL_VALUES,
  after: [1, 4, 9, 7, 3],
};

export default function App() {
  const [values, setValues] = useState<readonly number[]>(INITIAL_VALUES);
  const [backendStatus, setBackendStatus] = useState(
    "Checking backend status…",
  );
  const [analyzerPath, setAnalyzerPath] = useState<string | null>(null);

  useEffect(() => {
    void getBackendInformation()
      .then((info) => {
        setBackendStatus(
          info.status === "connected"
            ? `Connected to ${info.application} ${info.version}`
            : "Tauri unavailable (browser-only mode)",
        );
        setAnalyzerPath(info.nativeAnalyzerPath);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Backend unavailable";
        setBackendStatus(`Backend unavailable: ${message}`);
        setAnalyzerPath(null);
      });
  }, []);

  const arrayDescription = useMemo(() => values.join(", "), [values]);

  return (
    <main>
      <header className="page-header">
        <div>
          <p className="eyebrow">Desktop scaffold</p>
          <h1>AlgoViz</h1>
        </div>
        <p aria-live="polite" className="status-pill">
          {backendStatus}
        </p>
      </header>

      <section aria-labelledby="array-demo-heading" className="panel">
        <div className="panel__header">
          <div>
            <h2 id="array-demo-heading">Static array demo</h2>
            <p>
              Highlighting indexes {HIGHLIGHTED_INDICES[0]} and{" "}
              {HIGHLIGHTED_INDICES[1]}. Current values: {arrayDescription}
            </p>
          </div>
          <dl className="metadata-list">
            <div>
              <dt>Analyzer path</dt>
              <dd>{analyzerPath ?? "Not discovered"}</dd>
            </div>
          </dl>
        </div>

        <ArrayVisualizer
          highlightedIndices={HIGHLIGHTED_INDICES}
          values={values}
        />

        <div aria-label="Demo actions" className="actions" role="group">
          <button
            onClick={() =>
              setValues((current) => applyTraceEvent(current, DEMO_SWAP_EVENT))
            }
            type="button"
          >
            Apply demo swap
          </button>

          <button onClick={() => setValues(INITIAL_VALUES)} type="button">
            Reset
          </button>

          <button
            onClick={() => {
              void pingBackend("frontend")
                .then(setBackendStatus)
                .catch((error: unknown) => {
                  const message =
                    error instanceof Error ? error.message : "Rust ping failed";
                  setBackendStatus(`Rust ping failed: ${message}`);
                });
            }}
            type="button"
          >
            Ping Rust backend
          </button>
        </div>
      </section>
    </main>
  );
}
