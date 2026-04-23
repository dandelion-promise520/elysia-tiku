import { db } from "../db";

export interface AppConfig {
  aiBaseUrl: string;
  aiApiKey: string;
  aiModel: string;
  aiTimeoutMs: number;
  aiTemperature: number;
  aiMaxTokens: number;
  aiDebugDefault: boolean;
  aiLogDebug: boolean;
  adminPassword?: string;
}

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const getDbConfig = (key: string) => {
    const row = db.query<{ value: string }, [string]>("SELECT value FROM config WHERE key = ?").get(key);
    return row?.value;
  };

  return {
    aiBaseUrl: getDbConfig("AI_BASE_URL") ?? env.AI_BASE_URL ?? "",
    aiApiKey: getDbConfig("AI_API_KEY") ?? env.AI_API_KEY ?? "",
    aiModel: getDbConfig("AI_MODEL") ?? env.AI_MODEL ?? "",
    aiTimeoutMs: Number(getDbConfig("AI_TIMEOUT_MS") ?? env.AI_TIMEOUT_MS ?? 30_000),
    aiTemperature: Number(getDbConfig("AI_TEMPERATURE") ?? env.AI_TEMPERATURE ?? 0.2),
    aiMaxTokens: Number(getDbConfig("AI_MAX_TOKENS") ?? env.AI_MAX_TOKENS ?? 512),
    aiDebugDefault: (getDbConfig("AI_DEBUG_DEFAULT") ?? env.AI_DEBUG_DEFAULT) === "true",
    aiLogDebug: (getDbConfig("AI_LOG_DEBUG") ?? env.AI_LOG_DEBUG) === "true",
    adminPassword: getDbConfig("ADMIN_PASSWORD") ?? env.ADMIN_PASSWORD ?? "",
  };
}
