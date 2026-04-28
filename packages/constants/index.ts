/**
 * 共享常量配置
 */

// 默认后端端口
export const DEFAULT_SERVER_PORT = 300;

// 默认前端开发端口
export const DEFAULT_WEB_PORT = 5173;

// 题目类型
export const QUESTION_TYPES = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judgement", label: "判断题" },
  { value: "completion", label: "填空题" },
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]["value"];
