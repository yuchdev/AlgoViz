import { invoke } from "@tauri-apps/api/core";

export interface BackendInformation {
  readonly application: string;
  readonly version: string;
  readonly nativeAnalyzerPath: string | null;
}

export function getBackendInformation(): Promise<BackendInformation> {
  return invoke("get_backend_information");
}

export function pingBackend(message: string): Promise<string> {
  return invoke("ping_backend", { message });
}
