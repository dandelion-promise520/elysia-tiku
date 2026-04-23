const QUESTION_TYPE_PREFIXES = [
  "单选题",
  "多选题",
  "判断题",
  "填空题",
] as const;

const SUPPORTED_QUESTION_TYPES = [
  "single",
  "multiple",
  "judgement",
  "completion",
] as const;

export type SupportedQuestionType = (typeof SUPPORTED_QUESTION_TYPES)[number];

export function normalizeQuestionTitle(title: string): string {
  const trimmed = title.trim().replace(/\s+/g, " ");

  for (const prefix of QUESTION_TYPE_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }

  return trimmed;
}

export function normalizeOptions(options?: string | string[]): string[] {
  if (!options) return [];

  const values = Array.isArray(options) ? options : options.split("\n");

  return values.map((option) => option.trim()).filter(Boolean);
}

export function normalizeQuestionType(
  type: string,
): SupportedQuestionType | null {
  if ((SUPPORTED_QUESTION_TYPES as readonly string[]).includes(type)) {
    return type as SupportedQuestionType;
  }

  return null;
}
