import type { SupportedQuestionType } from "./normalizer";

export interface NormalizedQuestion {
  title: string;
  type: SupportedQuestionType;
  options: string[];
  debug: boolean;
}

export interface AiAnswerPayload {
  answer: string;
  confidence?: number | null;
  reason?: string | null;
}

export interface AnswerSuccessResult {
  code: 1;
  question: string;
  answer: string;
  confidence: number | null;
  reason: string;
}

export interface AnswerFailureResult {
  code: 0;
  question: string;
  answer: "";
  message: string;
}

export type FormattedAnswerResult = AnswerSuccessResult | AnswerFailureResult;

const JUDGEMENT_TRUE_VALUES = new Set(["正确", "对", "true", "yes"]);
const JUDGEMENT_FALSE_VALUES = new Set(["错误", "错", "false", "no"]);

export function formatAnswerResult(
  question: NormalizedQuestion,
  payload: AiAnswerPayload,
): FormattedAnswerResult {
  const answer = formatAnswerByType(question, payload.answer);

  if (!answer) {
    return {
      code: 0,
      question: question.title,
      answer: "",
      message: "AI result could not be validated",
    };
  }

  return {
    code: 1,
    question: question.title,
    answer,
    confidence: payload.confidence ?? null,
    reason: payload.reason?.trim() ?? "",
  };
}

function formatAnswerByType(
  question: NormalizedQuestion,
  answer: string,
): string | null {
  switch (question.type) {
    case "single":
      return formatSingleAnswer(question.options, answer);
    case "multiple":
      return formatMultipleAnswer(question.options, answer);
    case "judgement":
      return formatJudgementAnswer(question.options, answer);
    case "completion":
      return formatCompletionAnswer(answer);
  }
}

function formatSingleAnswer(options: string[], answer: string): string | null {
  const trimmed = answer.trim();
  const label = trimmed.toUpperCase();
  const hasLabeledOptions = options.some((option) => /^[A-Z]\./.test(option));

  if (isOptionLabel(label) && hasOptionForLabel(options, label)) {
    return label;
  }

  const matchedOption = options.find((option) => option.includes(trimmed));
  if (!matchedOption) return null;

  if (!hasLabeledOptions) {
    return matchedOption;
  }

  return matchedOption.charAt(0).toUpperCase();
}

function formatMultipleAnswer(options: string[], answer: string): string | null {
  const labels = answer
    .split("#")
    .map((part) => part.trim().toUpperCase())
    .filter((part) => isOptionLabel(part) && hasOptionForLabel(options, part));

  if (labels.length === 0) return null;

  const uniqueLabels = [...new Set(labels)];

  uniqueLabels.sort(
    (left, right) => getOptionIndex(options, left) - getOptionIndex(options, right),
  );

  return uniqueLabels.join("#");
}

function formatJudgementAnswer(
  options: string[],
  answer: string,
): string | null {
  const normalized = answer.trim().toLowerCase();

  if (JUDGEMENT_TRUE_VALUES.has(normalized)) return "正确";
  if (JUDGEMENT_FALSE_VALUES.has(normalized)) return "错误";

  const label = answer.trim().toUpperCase();
  if (isOptionLabel(label)) {
    const matchedOption = options.find((option) =>
      option.toUpperCase().startsWith(`${label}.`),
    );

    if (matchedOption?.includes("正确")) return "正确";
    if (matchedOption?.includes("错误")) return "错误";
  }

  return null;
}

function formatCompletionAnswer(answer: string): string | null {
  const normalized = answer
    .trim()
    .replace(/^答案是[:：]?\s*/u, "")
    .trim();

  return normalized || null;
}

function isOptionLabel(value: string): boolean {
  return /^[A-Z]$/.test(value);
}

function hasOptionForLabel(options: string[], label: string): boolean {
  return options.some((option) => option.toUpperCase().startsWith(`${label}.`));
}

function getOptionIndex(options: string[], label: string): number {
  return options.findIndex((option) =>
    option.toUpperCase().startsWith(`${label}.`),
  );
}
