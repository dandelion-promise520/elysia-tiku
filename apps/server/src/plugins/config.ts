import { DEFAULT_SERVER_PORT } from "@elysia-tiku/constants";
import { db } from "../db";

export interface AppConfig {
  port: number;
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
  adminPassword?: string;
}

export function getConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const getDbConfig = (key: string) => {
    const row = db.query<{ value: string }, [string]>("SELECT value FROM config WHERE key = ?").get(key);
    return row?.value;
  };

  return {
    port: Number(getDbConfig("PORT") ?? env.PORT ?? DEFAULT_SERVER_PORT),
    aiBaseUrl: getDbConfig("AI_BASE_URL") ?? env.AI_BASE_URL ?? "",
    aiApiKey: getDbConfig("AI_API_KEY") ?? env.AI_API_KEY ?? "",
    aiModel: getDbConfig("AI_MODEL") ?? env.AI_MODEL ?? "",
    aiTimeoutMs: Number(getDbConfig("AI_TIMEOUT_MS") ?? env.AI_TIMEOUT_MS ?? 30_000),
    aiTemperature: Number(getDbConfig("AI_TEMPERATURE") ?? env.AI_TEMPERATURE ?? 0.2),
    aiMaxTokens: Number(getDbConfig("AI_MAX_TOKENS") ?? env.AI_MAX_TOKENS ?? 512),
    aiRetryCount: Number(getDbConfig("AI_RETRY_COUNT") ?? env.AI_RETRY_COUNT ?? 1),
    aiSystemPrompt: getDbConfig("AI_SYSTEM_PROMPT") ?? env.AI_SYSTEM_PROMPT ?? "你是一个专业的题库助手，请根据用户提供的题目内容，准确识别题型并给出答案。对于选择题，直接给出选项字母；对于填空题，给出准确的答案内容。请以 JSON 格式返回结果。",
    aiDebugDefault: (getDbConfig("AI_DEBUG_DEFAULT") ?? env.AI_DEBUG_DEFAULT) === "true",
    aiLogDebug: (getDbConfig("AI_LOG_DEBUG") ?? env.AI_LOG_DEBUG) === "true",
    adminPassword: getDbConfig("ADMIN_PASSWORD") ?? env.ADMIN_PASSWORD ?? "",
  };
}
