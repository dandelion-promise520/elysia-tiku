import { Elysia } from "elysia";
import { db } from "./db";
import { getConfig, type AppConfig } from "./plugins/config";
import { createAnswerModule } from "./modules/answer";
import {
  createOpenAiCompatibleProvider,
  type AiProvider,
} from "./modules/answer/provider";
import { AnswerService } from "./modules/answer/service";
import type { AnswerServiceLogger } from "./modules/answer/service";

interface CreateAppOptions {
  config?: AppConfig;
  provider?: AiProvider;
  logger?: AnswerServiceLogger;
}

export function createApp(options: CreateAppOptions = {}) {
  const config = options.config ?? getConfig();
  const provider = options.provider ?? createOpenAiCompatibleProvider(config);
  const logger =
    options.logger ??
    ({
      info(message: string, payload?: unknown) {
        console.log(message, payload);
        try {
          db.query(
            "INSERT INTO logs (timestamp, message, payload) VALUES (?, ?, ?)"
          ).run(
            new Date().toISOString(),
            message,
            payload ? JSON.stringify(payload) : null
          );
        } catch (err) {
          console.error("Failed to insert log into DB", err);
        }
      },
    } satisfies AnswerServiceLogger);
  const answerService = new AnswerService(provider, config, logger);

  return new Elysia()
    .onAfterHandle(({ request, set }) => {
      const origin = request.headers.get("origin");
      if (!origin) return;

      set.headers["access-control-allow-origin"] = origin;
      set.headers["access-control-allow-methods"] = "GET,POST,PUT,OPTIONS";
      set.headers["access-control-allow-headers"] = "content-type,authorization";
    })
    .options("/*", ({ request, set }) => {
      const origin = request.headers.get("origin");

      if (origin) {
        set.headers["access-control-allow-origin"] = origin;
        set.headers["access-control-allow-methods"] = "GET,POST,PUT,OPTIONS";
        set.headers["access-control-allow-headers"] =
          request.headers.get("access-control-request-headers") ??
          "content-type,authorization";
      }

      set.status = 204;
      return "";
    })
    .get("/", () => ({ name: "elysia-tiku", version: "1.0.50", status: "running" }))
    .group("/api", (app) =>
      app
        .onBeforeHandle(({ request, set }) => {
          // Exempt /api/answer from auth
          if (new URL(request.url).pathname === "/api/answer") return;

          const c = getConfig();
          if (!c.adminPassword) return; // Auth disabled if no password set

          const auth = request.headers.get("authorization");
          if (auth !== `Bearer ${c.adminPassword}`) {
            set.status = 401;
            return { error: "Unauthorized" };
          }
        })
        .get("/config", () => {
          const c = getConfig();
          return {
            aiBaseUrl: c.aiBaseUrl,
            aiApiKey: c.aiApiKey ? maskKey(c.aiApiKey) : "",
            aiModel: c.aiModel,
            aiTimeoutMs: c.aiTimeoutMs,
            aiTemperature: c.aiTemperature,
            aiMaxTokens: c.aiMaxTokens,
            aiDebugDefault: c.aiDebugDefault,
            aiLogDebug: c.aiLogDebug,
            hasPassword: !!c.adminPassword,
          };
        })
        .put("/config", async ({ body, set }) => {
          const updates = body as Record<string, unknown>;
          const env = process.env;

          const updateDb = (key: string, val: string | number | boolean) => {
            db.query(
              "INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
            ).run(key, String(val));
          };

          if (typeof updates.aiBaseUrl === "string") { env.AI_BASE_URL = updates.aiBaseUrl; updateDb("AI_BASE_URL", updates.aiBaseUrl); }
          if (typeof updates.aiApiKey === "string") { env.AI_API_KEY = updates.aiApiKey; updateDb("AI_API_KEY", updates.aiApiKey); }
          if (typeof updates.aiModel === "string") { env.AI_MODEL = updates.aiModel; updateDb("AI_MODEL", updates.aiModel); }
          if (updates.aiTimeoutMs !== undefined) { env.AI_TIMEOUT_MS = String(updates.aiTimeoutMs); updateDb("AI_TIMEOUT_MS", updates.aiTimeoutMs); }
          if (updates.aiTemperature !== undefined) { env.AI_TEMPERATURE = String(updates.aiTemperature); updateDb("AI_TEMPERATURE", updates.aiTemperature); }
          if (updates.aiMaxTokens !== undefined) { env.AI_MAX_TOKENS = String(updates.aiMaxTokens); updateDb("AI_MAX_TOKENS", updates.aiMaxTokens); }
          if (typeof updates.aiDebugDefault === "boolean") { env.AI_DEBUG_DEFAULT = String(updates.aiDebugDefault); updateDb("AI_DEBUG_DEFAULT", updates.aiDebugDefault); }
          if (typeof updates.aiLogDebug === "boolean") { env.AI_LOG_DEBUG = String(updates.aiLogDebug); updateDb("AI_LOG_DEBUG", updates.aiLogDebug); }
          
          if (typeof updates.adminPassword === "string") {
            env.ADMIN_PASSWORD = updates.adminPassword;
            updateDb("ADMIN_PASSWORD", updates.adminPassword);
          }

          set.status = 200;
          return { message: "Config updated (runtime and SQLite)" };
        })
        .get("/logs", () => {
          const rows = db.query("SELECT * FROM logs ORDER BY id DESC LIMIT 100").all() as any[];
          return rows.map((row) => ({
            timestamp: row.timestamp,
            message: row.message,
            payload: row.payload ? JSON.parse(row.payload) : undefined,
          }));
        })
        .use(createAnswerModule(answerService))
    );
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
