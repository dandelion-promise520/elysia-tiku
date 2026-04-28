export interface AppConfig {
  aiBaseUrl: string;
  aiApiKey: string;
  aiModel: string;
  aiTimeoutMs: number;
  aiTemperature: number;
  aiMaxTokens: number;
  aiRetryCount: number;
  aiSystemPrompt: string;
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

async function apiFetch(url: string, options: RequestInit = {}, retries = 0) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("admin_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers,
        // 移除硬编码的超时，让后端配置生效
      });

      if (res.status === 401) {
        throw new AuthError();
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    } catch (error) {
      // 最后一次重试或认证错误时直接抛出
      if (attempt === retries || error instanceof AuthError) {
        throw error;
      }

      // 指数退避重试
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

      console.warn(`API 请求失败，${retries - attempt} 次重试后重试:`, error);
    }
  }

  throw new Error('请求失败，已达到最大重试次数');
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await apiFetch(`${BASE}/api/config`);
  return res.json();
}

export async function updateConfig(updates: Partial<AppConfig & { adminPassword?: string }>): Promise<void> {
  await apiFetch(`${BASE}/api/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function submitAnswer(body: {
  title: string;
  type?: string;
  options?: string[];
  debug?: boolean;
}): Promise<AnswerResponse> {
  const res = await apiFetch(`${BASE}/api/answer`, {
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
  return res.json();
}

export async function deleteLogs(ids: number[]): Promise<void> {
  await apiFetch(`${BASE}/api/logs/batch`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
}

export async function clearLogs(): Promise<void> {
  await apiFetch(`${BASE}/api/logs`, {
    method: "DELETE",
  });
}
