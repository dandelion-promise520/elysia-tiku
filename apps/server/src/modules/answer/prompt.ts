import type { AnswerRequest } from "./model";

export interface PromptMessage {
  role: "system" | "user";
  content: string;
}

export function buildPrompt(question: AnswerRequest): PromptMessage[] {
  const systemPrompt =
    "你是教育类客观题答题助手。必须仅返回 JSON，字段包含 answer、confidence、reason，不要返回 markdown 或额外解释。";

  const userPrompt = JSON.stringify({
    title: question.title,
    type: question.type,
    options: question.options,
    instruction: "请返回当前题目的最可能正确答案。",
  });

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}
