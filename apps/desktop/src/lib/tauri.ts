export interface BackendInformation {
  readonly application: string;
  readonly version: string;
  readonly nativeAnalyzerPath: string | null;
  readonly status: "connected" | "browser-only";
}

type TauriCommand = "get_backend_information" | "ping_backend";

type BackendInformationResponse = Omit<BackendInformation, "status">;

const BROWSER_ONLY_MESSAGE = "Tauri IPC unavailable (browser-only mode).";

export function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window === "object" &&
    "__TAURI_INTERNALS__" in window
  );
}

export function formatTauriError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return "Unknown Tauri IPC error";
}

async function invokeTauri<T>(
  command: TauriCommand,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export async function getBackendInformation(): Promise<BackendInformation> {
  if (!isTauriEnvironment()) {
    return {
      application: "AlgoViz",
      version: "browser-only",
      nativeAnalyzerPath: null,
      status: "browser-only",
    };
  }

  try {
    const info = await invokeTauri<BackendInformationResponse>(
      "get_backend_information",
    );

    return {
      ...info,
      status: "connected",
    };
  } catch (error) {
    throw new Error(formatTauriError(error));
  }
}

export async function pingBackend(message: string): Promise<string> {
  if (!isTauriEnvironment()) {
    return BROWSER_ONLY_MESSAGE;
  }

  try {
    return await invokeTauri<string>("ping_backend", { message });
  } catch (error) {
    throw new Error(formatTauriError(error));
  }
}
