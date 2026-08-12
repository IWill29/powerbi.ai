export type BackendStatus = "Connected" | "Not connected";

export async function getBackendStatus(): Promise<BackendStatus> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    if (!res.ok) return "Not connected";
    const data = (await res.json()) as { status?: string };
    return data.status === "ok" ? "Connected" : "Not connected";
  } catch {
    return "Not connected";
  }
}
