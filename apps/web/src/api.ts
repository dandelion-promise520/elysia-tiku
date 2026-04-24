export interface AppConfig {
  aiBaseUrl: string;
  aiApiKey: string;
  aiModel: string;
  aiTimeoutMs: number;
  aiTemperature: number;
  aiMaxTokens: number;
  aiDebugDefault: boolean;
  aiLogDebug: boolean;
  hasPassword?: boolean;
}

export interface AnswerResponse {
  code: 0 | 1;
  question: string;
  answer: string;
  confidence?: number | null;
  reason?: string;
  message?: string;
}

const BASE = "";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("admin_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    throw new AuthError();
  }
  return res;
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await apiFetch(`${BASE}/api/config`);
  if (!res.ok) throw new Error(`Failed to fetch config: ${res.status}`);
  return res.json();
}

export async function updateConfig(updates: Partial<AppConfig & { adminPassword?: string }>): Promise<void> {
  const res = await apiFetch(`${BASE}/api/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update config: ${res.status}`);
}

export async function submitAnswer(body: {
  title: string;
  type?: string;
  options?: string[];
  debug?: boolean;
}): Promise<AnswerResponse> {
  const res = await fetch(`${BASE}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  payload?: any;
}

export async function fetchLogs(): Promise<LogEntry[]> {
  const res = await apiFetch(`${BASE}/api/logs`);
  if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
  return res.json();
}

export async function deleteLogs(ids: number[]): Promise<void> {
  const res = await apiFetch(`${BASE}/api/logs/batch`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`Failed to delete logs: ${res.status}`);
}

export async function clearLogs(): Promise<void> {
  const res = await apiFetch(`${BASE}/api/logs`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to clear logs: ${res.status}`);
}
