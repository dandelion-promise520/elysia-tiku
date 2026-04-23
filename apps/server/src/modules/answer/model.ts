import type { SupportedQuestionType } from "./normalizer";

export interface AnswerRequestBody {
  title?: string;
  type?: string;
  options?: string | string[];
  debug?: boolean;
}

export interface AnswerRequest {
  title: string;
  type: SupportedQuestionType;
  options: string[];
  debug: boolean;
}

export interface AnswerDebugMetadata {
  normalizedInput: {
    title: string;
    type: SupportedQuestionType;
    options: string[];
  };
  provider: "openai-compatible";
  model: string;
  rawModelOutput: string;
}
