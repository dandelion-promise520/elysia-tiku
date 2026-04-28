import { createApp } from "./app";
import { getConfig } from "./plugins/config";

const config = getConfig();
console.log("\n=== Server Configuration ===");
console.log("AI_BASE_URL:", config.aiBaseUrl || "(not set)");
console.log("AI_API_KEY:", config.aiApiKey ? "***" + config.aiApiKey.slice(-4) : "(not set)");
console.log("AI_MODEL:", config.aiModel || "(not set)");
console.log("AI_TIMEOUT_MS:", config.aiTimeoutMs);
console.log("AI_TEMPERATURE:", config.aiTemperature);
console.log("AI_MAX_TOKENS:", config.aiMaxTokens);
console.log("===========================\n");

if (!config.aiBaseUrl || !config.aiApiKey || !config.aiModel) {
  console.warn("⚠️  WARNING: AI configuration is incomplete!");
  console.warn(`Please configure AI settings via the admin panel at http://localhost:${config.port}\n`);
}

const app = createApp().listen({ port: config.port, hostname: "0.0.0.0" });

console.log(
  `Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
