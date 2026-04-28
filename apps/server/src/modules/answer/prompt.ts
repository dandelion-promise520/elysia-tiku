import type { AnswerRequest } from "./model";

export interface PromptMessage {
  role: "system" | "user";
  content: string;
}

const TYPE_INSTRUCTIONS: Record<string, string> = {
  single: "单选题：answer 字段只需返回选项字母（如有A/B/C/D标签）或完整选项文本。",
  multiple: "多选题：answer 字段返回所有正确选项的字母或文本，用 # 分隔（如 A#C 或 选项1#选项3）。",
  judgement: "判断题：answer 字段返回 正确 或 错误。",
  completion: "填空题：answer 字段直接返回答案文本。",
};

const DEFAULT_SYSTEM_PROMPT = "你是教育类客观题答题助手。必须仅返回 JSON，字段包含 answer、confidence、reason。不要返回 markdown 代码块或任何额外解释。";

export function buildPrompt(question: AnswerRequest, customSystemPrompt?: string): PromptMessage[] {
  const systemPrompt = customSystemPrompt || DEFAULT_SYSTEM_PROMPT;
  const typeHint = TYPE_INSTRUCTIONS[question.type] || "";

  const userPrompt = JSON.stringify({
    title: question.title,
    type: question.type,
    options: question.options,
    instruction: `请返回当前题目的最可能正确答案。${typeHint}`,
  });

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}
