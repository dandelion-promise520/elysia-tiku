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
const OPTION_LABEL_PATTERN = /^([A-Z])(?:[.\u3001\uFF0E:：\)）]|\s)/i;
const ANSWER_CLEANUP_PATTERN = /^(?:答案是?|正确答案是?|正确选项是?|答案[是为]?)[:：]?\s*/iu;

function cleanAnswer(raw: string): string {
  return raw.trim().replace(ANSWER_CLEANUP_PATTERN, "").trim();
}

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
  const cleaned = cleanAnswer(answer);
  const upper = cleaned.toUpperCase();
  const hasLabeledOptions = options.some((option) => getOptionLabel(option) !== null);

  // 带标签的选项：AI 返回了有效标签
  if (isOptionLabel(upper) && hasOptionForLabel(options, upper)) {
    return upper;
  }

  // AI 可能对无标签选项返回了字母（如 "B"），转为序号匹配
  if (isOptionLabel(upper) && !hasLabeledOptions) {
    const index = upper.charCodeAt(0) - 65;
    if (index >= 0 && index < options.length) {
      return options[index];
    }
  }

  // 模糊匹配：选项文本包含答案
  const matchedOption = options.find((option) => option.includes(cleaned));
  if (!matchedOption) return null;

  if (!hasLabeledOptions) {
    return matchedOption;
  }

  return getOptionLabel(matchedOption);
}

function formatMultipleAnswer(options: string[], answer: string): string | null {
  const cleaned = cleanAnswer(answer);
  const parts = cleaned.split("#").map((p) => p.trim().toUpperCase()).filter(Boolean);
  const hasLabeledOptions = options.some((option) => getOptionLabel(option) !== null);

  // 收集所有有效的标签
  const labels: string[] = [];
  for (const part of parts) {
    if (isOptionLabel(part) && hasOptionForLabel(options, part)) {
      labels.push(part);
    } else if (isOptionLabel(part) && !hasLabeledOptions) {
      // 无标签选项的字母 → 序号映射
      const index = part.charCodeAt(0) - 65;
      if (index >= 0 && index < options.length) {
        labels.push(options[index]);
      }
    }
  }

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
  const cleaned = cleanAnswer(answer);
  const normalized = cleaned.toLowerCase();

  if (JUDGEMENT_TRUE_VALUES.has(normalized)) return "正确";
  if (JUDGEMENT_FALSE_VALUES.has(normalized)) return "错误";

  const label = cleaned.toUpperCase();
  if (isOptionLabel(label)) {
    const matchedOption = options.find((option) => hasOptionLabel(option, label));

    if (matchedOption?.includes("正确")) return "正确";
    if (matchedOption?.includes("错误")) return "错误";
  }

  return null;
}

function formatCompletionAnswer(answer: string): string {
  const cleaned = cleanAnswer(answer);
  return cleaned || null;
}

function isOptionLabel(value: string): boolean {
  return /^[A-Z]$/.test(value);
}

function hasOptionForLabel(options: string[], label: string): boolean {
  return options.some((option) => hasOptionLabel(option, label));
}

function getOptionIndex(options: string[], label: string): number {
  const byLabel = options.findIndex((option) => hasOptionLabel(option, label));
  if (byLabel !== -1) return byLabel;
  return options.findIndex((option) => option === label);
}

function hasOptionLabel(option: string, label: string): boolean {
  return getOptionLabel(option) === label;
}

function getOptionLabel(option: string): string | null {
  const matched = option.trim().match(OPTION_LABEL_PATTERN);
  return matched ? matched[1].toUpperCase() : null;
}
