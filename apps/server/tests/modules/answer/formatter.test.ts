import { describe, expect, test } from "bun:test";

import {
  formatAnswerResult,
  type AiAnswerPayload,
  type NormalizedQuestion,
} from "../../../src/modules/answer/formatter";

function createQuestion(
  overrides: Partial<NormalizedQuestion> = {},
): NormalizedQuestion {
  return {
    title: "中国梦是什么？",
    type: "single",
    options: ["A. 国家富强", "B. 民族振兴", "C. 人民幸福", "D. 以上都是"],
    debug: false,
    ...overrides,
  };
}

function createPayload(overrides: Partial<AiAnswerPayload> = {}): AiAnswerPayload {
  return {
    answer: "D",
    confidence: 0.91,
    reason: "题干与选项共同指向完整表述。",
    ...overrides,
  };
}

describe("formatAnswerResult", () => {
  test("keeps a valid single-choice label", () => {
    const result = formatAnswerResult(createQuestion(), createPayload());

    expect(result.code).toBe(1);
    expect(result.answer).toBe("D");
  });

  test("maps a single-choice option text back to its label", () => {
    const result = formatAnswerResult(
      createQuestion(),
      createPayload({ answer: "以上都是" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("D");
  });

  test("keeps full single-choice text when options do not include labels", () => {
    const result = formatAnswerResult(
      createQuestion({
        title: "公共关系的对象是()。",
        options: ["个人", "群体", "公众", "学生"],
      }),
      createPayload({ answer: "公众" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("公众");
  });

  test("keeps full single-choice text for unlabelled long options", () => {
    const result = formatAnswerResult(
      createQuestion({
        options: [
          "做事情不必过于在意别人的议论,关键是要襟怀坦白,无愧于心,只要认准了,就要义无反顾得去做",
          "做事情果断",
          "做事情多听取别人的意见",
          "做人做事要谦虚",
        ],
      }),
      createPayload({
        answer:
          "做事情不必过于在意别人的议论,关键是要襟怀坦白,无愧于心,只要认准了,就要义无反顾得去做",
      }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe(
      "做事情不必过于在意别人的议论,关键是要襟怀坦白,无愧于心,只要认准了,就要义无反顾得去做",
    );
  });

  test("normalizes multiple-choice answers, de-duplicates them, and sorts by option order", () => {
    const result = formatAnswerResult(
      createQuestion({
        type: "multiple",
      }),
      createPayload({ answer: "C#A#C" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("A#C");
  });

  test("normalizes judgement synonyms", () => {
    const result = formatAnswerResult(
      createQuestion({
        type: "judgement",
        options: [],
      }),
      createPayload({ answer: "true" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("正确");
  });

  test("maps judgement option labels back to correct or wrong", () => {
    const result = formatAnswerResult(
      createQuestion({
        type: "judgement",
        options: ["A. 正确", "B. 错误"],
      }),
      createPayload({ answer: "A" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("正确");
  });

  test("removes explanatory prefixes from completion answers", () => {
    const result = formatAnswerResult(
      createQuestion({
        title: "中国梦的本质是国家富强、民族振兴、____。",
        type: "completion",
        options: [],
      }),
      createPayload({ answer: "答案是：人民幸福" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("人民幸福");
  });
});
