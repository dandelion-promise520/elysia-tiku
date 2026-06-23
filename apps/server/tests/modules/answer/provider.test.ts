import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { createOpenAiCompatibleProvider } from "../../../src/modules/answer/provider";
import type { AppConfig } from "../../../src/plugins/config";

const originalFetch = globalThis.fetch;

describe("createOpenAiCompatibleProvider", () => {
  let requestUrls: string[] = [];

  beforeAll(() => {
    globalThis.fetch = (async (input: string | Request | URL) => {
      const url = typeof input === "string" ? input : (input instanceof URL ? input.toString() : input.url);
      requestUrls.push(url);
      
      return new Response(JSON.stringify({
        choices: [{
          message: {
            content: "```json\n{\n  \"answer\": \"D\"\n}\n```"
          }
        }]
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }) as any;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  test("normalizes baseURL and parses markdown JSON response", async () => {
    requestUrls = [];
    const config: AppConfig = {
      port: 3000,
      aiBaseUrl: "https://example.com/v1", // No /chat/completions suffix
      aiApiKey: "test-key",
      aiModel: "test-model",
      aiTimeoutMs: 10000,
      aiTemperature: 0.2,
      aiMaxTokens: 512,
      aiRetryCount: 1,
      aiSystemPrompt: "test-prompt",
      aiDebugDefault: false,
      aiLogDebug: false,
    };

    const provider = createOpenAiCompatibleProvider(config);
    const result = await provider.answerQuestion([{ role: "user", content: "test" }]);

    expect(requestUrls).toEqual(["https://example.com/v1/chat/completions"]);
    expect(result.payload).toEqual({ answer: "D" });
  });

  test("does not duplicate /chat/completions if already present", async () => {
    requestUrls = [];
    const config: AppConfig = {
      port: 3000,
      aiBaseUrl: "https://example.com/v1/chat/completions",
      aiApiKey: "test-key",
      aiModel: "test-model",
      aiTimeoutMs: 10000,
      aiTemperature: 0.2,
      aiMaxTokens: 512,
      aiRetryCount: 1,
      aiSystemPrompt: "test-prompt",
      aiDebugDefault: false,
      aiLogDebug: false,
    };

    const provider = createOpenAiCompatibleProvider(config);
    await provider.answerQuestion([{ role: "user", content: "test" }]);

    expect(requestUrls).toEqual(["https://example.com/v1/chat/completions"]);
  });
});
