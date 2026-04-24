import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import * as path from "path";
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
    .onAfterHandle(({ set }) => {
      set.headers["access-control-allow-origin"] = "*";
      set.headers["access-control-allow-methods"] = "GET,POST,PUT,OPTIONS";
      set.headers["access-control-allow-headers"] = "content-type,authorization";
    })
    .options("/*", ({ set }) => {
      set.headers["access-control-allow-origin"] = "*";
      set.headers["access-control-allow-methods"] = "GET,POST,PUT,OPTIONS";
      set.headers["access-control-allow-headers"] = "content-type,authorization";
      set.status = 204;
      return "";
    })
    .get("/api/health", () => ({ name: "elysia-tiku", version: "1.0.50", status: "running" }))
    .group("/api", (app) =>
      app
        .onBeforeHandle(({ request, set }) => {
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

          if (typeof updates.aiBaseUrl === "string") { config.aiBaseUrl = updates.aiBaseUrl; env.AI_BASE_URL = updates.aiBaseUrl; updateDb("AI_BASE_URL", updates.aiBaseUrl); }
          if (typeof updates.aiApiKey === "string") { config.aiApiKey = updates.aiApiKey; env.AI_API_KEY = updates.aiApiKey; updateDb("AI_API_KEY", updates.aiApiKey); }
          if (typeof updates.aiModel === "string") { config.aiModel = updates.aiModel; env.AI_MODEL = updates.aiModel; updateDb("AI_MODEL", updates.aiModel); }
          if (typeof updates.aiTimeoutMs === "number") { config.aiTimeoutMs = updates.aiTimeoutMs; env.AI_TIMEOUT_MS = String(updates.aiTimeoutMs); updateDb("AI_TIMEOUT_MS", updates.aiTimeoutMs); }
          if (typeof updates.aiTemperature === "number") { config.aiTemperature = updates.aiTemperature; env.AI_TEMPERATURE = String(updates.aiTemperature); updateDb("AI_TEMPERATURE", updates.aiTemperature); }
          if (typeof updates.aiMaxTokens === "number") { config.aiMaxTokens = updates.aiMaxTokens; env.AI_MAX_TOKENS = String(updates.aiMaxTokens); updateDb("AI_MAX_TOKENS", updates.aiMaxTokens); }
          if (typeof updates.aiDebugDefault === "boolean") { config.aiDebugDefault = updates.aiDebugDefault; env.AI_DEBUG_DEFAULT = String(updates.aiDebugDefault); updateDb("AI_DEBUG_DEFAULT", updates.aiDebugDefault); }
          if (typeof updates.aiLogDebug === "boolean") { config.aiLogDebug = updates.aiLogDebug; env.AI_LOG_DEBUG = String(updates.aiLogDebug); updateDb("AI_LOG_DEBUG", updates.aiLogDebug); }
          
          if (typeof updates.adminPassword === "string") {
            config.adminPassword = updates.adminPassword;
            env.ADMIN_PASSWORD = updates.adminPassword;
            updateDb("ADMIN_PASSWORD", updates.adminPassword);
          }

          set.status = 200;
          return { message: "Config updated (runtime and SQLite)" };
        })
        .get("/logs", () => {
          const rows = db.query("SELECT * FROM logs ORDER BY id DESC LIMIT 100").all() as any[];
          return rows.map((row) => ({
            id: row.id,
            timestamp: row.timestamp,
            message: row.message,
            payload: row.payload ? JSON.parse(row.payload) : undefined,
          }));
        })
        .delete("/logs", ({ set }) => {
          db.run("DELETE FROM logs");
          set.status = 200;
          return { message: "Logs cleared" };
        })
        .delete("/logs/batch", ({ body, set }) => {
          const ids = Array.isArray((body as { ids?: unknown[] })?.ids)
            ? (body as { ids: unknown[] }).ids
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)
            : [];

          if (ids.length === 0) {
            set.status = 400;
            return { message: "Log ids are required" };
          }

          const placeholders = ids.map(() => "?").join(", ");
          db.query(`DELETE FROM logs WHERE id IN (${placeholders})`).run(...ids);

          set.status = 200;
          return { message: "Selected logs deleted", deletedCount: ids.length };
        })
    )
    .use(createAnswerModule(answerService))
    // Static file serving and SPA fallback
    .get("/*", ({ request, set }) => {
      const url = new URL(request.url);
      const filePath = path.resolve(import.meta.dir, "../../web/dist", url.pathname.slice(1));
      
      const file = Bun.file(filePath);
      if (url.pathname !== "/" && !url.pathname.startsWith("/api") && file.size > 0) {
        return file;
      }
      
      // SPA Fallback
      set.headers["Content-Type"] = "text/html; charset=utf-8";
      return Bun.file(path.resolve(import.meta.dir, "../../web/dist/index.html"));
    });
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
