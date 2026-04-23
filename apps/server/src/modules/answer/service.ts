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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
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

    const requestedType =
      typeof body.type === "string" ? normalizeQuestionType(body.type) : "completion";
    if (!requestedType) {
      return {
        status: 400,
        body: {
          code: 0,
          question: title,
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

    let providerResult;
    try {
      providerResult = await this.provider.answerQuestion(
        buildPrompt(normalizedInput),
      );
    } catch {
      return {
        status: 502,
        body: {
          code: 0,
          question: normalizedInput.title,
          answer: "",
          message: "AI provider request failed",
        },
      };
    }

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
        status: formattedResult.code === 1 ? 200 : 422,
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
