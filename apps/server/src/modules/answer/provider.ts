import type { AppConfig } from "../../plugins/config";
import type { PromptMessage } from "./prompt";
import type { AiAnswerPayload } from "./formatter";

export interface AiProviderResult {
  rawText: string;
  payload: AiAnswerPayload;
}

export interface AiProvider {
  answerQuestion(messages: PromptMessage[]): Promise<AiProviderResult>;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const markdownMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.substring(start, end + 1);
  }
  return trimmed;
}

export function createOpenAiCompatibleProvider(config: AppConfig): AiProvider {
  return {
    async answerQuestion(messages) {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        console.log("[PROVIDER] Request timeout after", config.aiTimeoutMs, "ms");
        controller.abort();
      }, config.aiTimeoutMs);

      try {
        let url = config.aiBaseUrl.trim();
        if (url && !url.endsWith("/chat/completions")) {
          url = url.endsWith("/") ? `${url}chat/completions` : `${url}/chat/completions`;
        }
        console.log("[PROVIDER] Sending request to:", url);
        console.log("[PROVIDER] Model:", config.aiModel);

        const startTime = Date.now();
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${config.aiApiKey}`,
          },
          body: JSON.stringify({
            model: config.aiModel,
            temperature: config.aiTemperature,
            max_tokens: config.aiMaxTokens,
            messages,
          }),
          signal: controller.signal,
        });

        const elapsed = Date.now() - startTime;
        console.log("[PROVIDER] Response received in", elapsed, "ms");
        console.log("[PROVIDER] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[PROVIDER] Error response:", errorText.substring(0, 200));
          throw new Error(`Provider request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ChatCompletionResponse;
        const rawText = data.choices?.[0]?.message?.content ?? "";
        console.log("[PROVIDER] Raw response length:", rawText.length);

        const cleanedText = extractJson(rawText);
        const payload = JSON.parse(cleanedText) as AiAnswerPayload;

        return {
          rawText,
          payload,
        };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
