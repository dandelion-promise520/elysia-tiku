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
    title: "What is the correct answer?",
    type: "single",
    options: ["A. Alpha", "B. Beta", "C. Gamma", "D. Delta"],
    debug: false,
    ...overrides,
  };
}

function createPayload(
  overrides: Partial<AiAnswerPayload> = {},
): AiAnswerPayload {
  return {
    answer: "D",
    confidence: 0.91,
    reason: "Matched against the available options.",
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
      createPayload({ answer: "Delta" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("D");
  });

  test("accepts single-choice options labeled with Chinese punctuation", () => {
    const result = formatAnswerResult(
      createQuestion({
        options: ["A、Alpha", "B、Beta", "C、Gamma", "D、Delta"],
      }),
      createPayload({ answer: "D" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("D");
  });

  test("keeps full single-choice text when options do not include labels", () => {
    const result = formatAnswerResult(
      createQuestion({
        title: "Who is the target audience?",
        options: ["Individuals", "Groups", "Public", "Students"],
      }),
      createPayload({ answer: "Public" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("Public");
  });

  test("keeps full single-choice text for unlabelled long options", () => {
    const longOption =
      "Stay honest and focus on doing the right thing without overreacting to outside criticism.";

    const result = formatAnswerResult(
      createQuestion({
        options: [
          longOption,
          "Act decisively.",
          "Listen to more opinions.",
          "Be humble.",
        ],
      }),
      createPayload({ answer: longOption }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe(longOption);
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

  test("normalizes multiple-choice answers for Chinese-punctuation labels", () => {
    const result = formatAnswerResult(
      createQuestion({
        type: "multiple",
        options: ["A、Alpha", "B、Beta", "C、Gamma", "D、Delta"],
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
  });

  test("removes explanatory prefixes from completion answers", () => {
    const result = formatAnswerResult(
      createQuestion({
        title: "The answer is ___",
        type: "completion",
        options: [],
      }),
      createPayload({ answer: "Final answer: happiness" }),
    );

    expect(result.code).toBe(1);
    expect(result.answer).toBe("Final answer: happiness");
  });
});
