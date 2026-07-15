import { useEffect, useState } from "react";

import {
  TRACE_SCHEMA_VERSION,
  applyTraceEvent,
  type SequenceSwapEvent
} from "@algoviz/protocol";

import { ArrayVisualizer } from "./components/ArrayVisualizer";
import { getBackendInformation, pingBackend } from "./lib/tauri";

const initial = [7, 4, 9, 1, 3] as const;

const swap: SequenceSwapEvent = {
  schemaVersion: TRACE_SCHEMA_VERSION,
  sequence: 1,
  kind: "sequence.swap",
  objectId: "values-1",
  leftIndex: 0,
  rightIndex: 3
};

export default function App() {
  const [values, setValues] = useState<readonly number[]>(initial);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    void getBackendInformation()
      .then((info) => setStatus(`${info.application} ${info.version}`))
      .catch(() => setStatus("Backend unavailable"));
  }, []);

  return (
    <main>
      <header>
        <h1>AlgoViz</h1>
        <span>{status}</span>
      </header>

      <section>
        <h2>Array renderer stub</h2>

        <ArrayVisualizer values={values} highlightedIndices={[0, 3]} />

        <div className="actions">
          <button
            onClick={() => setValues((current) => applyTraceEvent(current, swap))}
            type="button"
          >
            Apply demo swap
          </button>

          <button onClick={() => setValues(initial)} type="button">
            Reset
          </button>

          <button
            onClick={() => {
              void pingBackend("frontend")
                .then(setStatus)
                .catch(() => setStatus("Rust ping failed"));
            }}
            type="button"
          >
            Ping Rust
          </button>
        </div>
      </section>
    </main>
  );
}
