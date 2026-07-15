import { describe, expect, it } from "vitest";

import {
  formatTauriError,
  getBackendInformation,
  isTauriEnvironment,
  pingBackend,
} from "./tauri";

describe("tauri adapter", () => {
  it("detects browser-only mode when Tauri internals are absent", () => {
    expect(isTauriEnvironment()).toBe(false);
  });

  it("returns a mock backend status outside Tauri", async () => {
    await expect(getBackendInformation()).resolves.toEqual({
      application: "AlgoViz",
      version: "browser-only",
      nativeAnalyzerPath: null,
      status: "browser-only",
    });
    await expect(pingBackend("frontend")).resolves.toContain(
      "browser-only mode",
    );
  });

  it("formats readable Tauri errors", () => {
    expect(formatTauriError(new Error("boom"))).toBe("boom");
    expect(formatTauriError("failed")).toBe("failed");
    expect(formatTauriError({})).toBe("Unknown Tauri IPC error");
  });
});
