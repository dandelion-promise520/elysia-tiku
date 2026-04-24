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
        status: 200,
        body: {
          code: 0,
          question: "",
          answer: "",
          message: "Question title is required",
        },
      };
    }

    console.log("[SERVICE] Normalizing input");
    const requestedType =
      (typeof body.type === "string" ? normalizeQuestionType(body.type) : null) ?? "completion";

    const normalizedInput = {
      title: normalizeQuestionTitle(title),
      type: requestedType,
      options: normalizeOptions(body.options),
      debug: body.debug ?? this.config.aiDebugDefault,
    };

    console.log("[SERVICE] Calling AI provider");
    let providerResult;
    try {
      providerResult = await this.provider.answerQuestion(
        buildPrompt(normalizedInput),
      );
      console.log("[SERVICE] AI provider returned successfully");
    } catch (error) {
      console.error("[SERVICE] AI provider request failed");
      console.error("[SERVICE] Error type:", error?.constructor?.name);
      console.error("[SERVICE] Error message:", error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error("[SERVICE] Error stack:", error.stack.split('\n').slice(0, 5).join('\n'));
      }
      return {
        status: 200,
        body: {
          code: 0,
          question: normalizedInput.title,
          answer: "",
          message: "AI provider request failed",
        },
      };
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
