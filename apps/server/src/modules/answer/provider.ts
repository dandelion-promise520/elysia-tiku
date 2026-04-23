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

export function createOpenAiCompatibleProvider(config: AppConfig): AiProvider {
  return {
    async answerQuestion(messages) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.aiTimeoutMs);

      try {
        const response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
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

        if (!response.ok) {
          throw new Error(`Provider request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ChatCompletionResponse;
        const rawText = data.choices?.[0]?.message?.content ?? "";
        const payload = JSON.parse(rawText) as AiAnswerPayload;

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
