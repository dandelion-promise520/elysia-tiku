import type { AppConfig } from "../../plugins/config";
import {
  formatAnswerResult,
  type AnswerFailureResult,
  type AnswerSuccessResult,
} from "./formatter";
import type { AnswerDebugMetadata, AnswerRequestBody } from "./model";
import {
  normalizeOptions,
  normalizeQuestionTitle,
  normalizeQuestionType,
  type SupportedQuestionType,
} from "./normalizer";
import type { AiProvider } from "./provider";
import { buildPrompt } from "./prompt";

export type AnswerServiceResponse =
  | AnswerFailureResult
  | (AnswerSuccessResult & { debug?: AnswerDebugMetadata });

export interface AnswerServiceLogger {
  info(message: string, payload?: unknown): void;
}

export class AnswerService {
  constructor(
    private readonly provider: AiProvider,
    private readonly config: AppConfig,
    private readonly logger?: AnswerServiceLogger,
  ) {}

  async answer(body: AnswerRequestBody): Promise<{
    status: number;
    body: AnswerServiceResponse;
  }> {
    console.log("[SERVICE] Starting answer processing");
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      console.log("[SERVICE] Title is empty, returning error");
      return {
        status: 400,
        body: {
          code: 0,
          question: "",
          answer: "",
          message: "Question title is required",
        },
      };
    }

    console.log("[SERVICE] Normalizing input");
    
    // Validate question type
    let requestedType: SupportedQuestionType | null = null;
    if (body.type === undefined) {
      requestedType = "completion";
    } else if (typeof body.type === "string") {
      requestedType = normalizeQuestionType(body.type);
    }

    if (!requestedType) {
      console.log("[SERVICE] Unsupported question type:", body.type);
      return {
        status: 400,
        body: {
          code: 0,
          question: normalizeQuestionTitle(title),
          answer: "",
          message: "Unsupported question type",
        },
      };
    }

    const normalizedInput = {
      title: normalizeQuestionTitle(title),
      type: requestedType,
      options: normalizeOptions(body.options),
      debug: body.debug ?? this.config.aiDebugDefault,
    };

    console.log("[SERVICE] Calling AI provider");
    let providerResult;
    let attempts = 0;
    const maxAttempts = (this.config.aiRetryCount ?? 1) + 1; // 尝试次数 = 重试次数 + 1

    while (attempts < maxAttempts) {
      try {
        attempts++;
        providerResult = await this.provider.answerQuestion(
          buildPrompt(normalizedInput, this.config.aiSystemPrompt),
        );
        console.log(`[SERVICE] AI provider returned successfully on attempt ${attempts}`);
        break; // 成功则跳出循环
      } catch (error) {
        console.error(`[SERVICE] AI provider request failed (Attempt ${attempts}/${maxAttempts})`);
        if (attempts >= maxAttempts) {
          return {
            status: 502,
            body: {
              code: 0,
              question: normalizedInput.title,
              answer: "",
              message: "AI provider request failed after retries",
            },
          };
        }
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }

    console.log("[SERVICE] Formatting result");
    const formattedResult = formatAnswerResult(
      normalizedInput,
      providerResult.payload,
    );

    if (formattedResult.code === 0 || !normalizedInput.debug) {
      if (normalizedInput.debug || this.config.aiLogDebug) {
        this.logger?.info("answer-service debug", {
          normalizedInput: {
            title: normalizedInput.title,
            type: normalizedInput.type,
            options: normalizedInput.options,
          },
          rawModelOutput: providerResult.rawText,
          formattedResult,
        });
      }
      return {
        status: 200,
        body: formattedResult,
      };
    }

    this.logger?.info("answer-service debug", {
      normalizedInput: {
        title: normalizedInput.title,
        type: normalizedInput.type,
        options: normalizedInput.options,
      },
      rawModelOutput: providerResult.rawText,
      formattedResult,
    });

    return {
      status: 200,
      body: {
        ...formattedResult,
        debug: {
          normalizedInput: {
            title: normalizedInput.title,
            type: normalizedInput.type,
            options: normalizedInput.options,
          },
          provider: "openai-compatible",
          model: this.config.aiModel,
          rawModelOutput: providerResult.rawText,
        },
      },
    };
  }
}
