import { describe, expect, test } from "bun:test";

import {
  normalizeOptions,
  normalizeQuestionTitle,
  normalizeQuestionType,
} from "../../../src/modules/answer/normalizer";

describe("normalizeQuestionTitle", () => {
  test("removes common question-type prefixes and trims whitespace", () => {
    expect(normalizeQuestionTitle("  单选题 中国梦是什么？  ")).toBe(
      "中国梦是什么？",
    );
  });
});

describe("normalizeOptions", () => {
  test("splits newline-separated options into a clean array", () => {
    expect(normalizeOptions("A. 甲\nB. 乙\n\nC. 丙  ")).toEqual([
      "A. 甲",
      "B. 乙",
      "C. 丙",
    ]);
  });
});

describe("normalizeQuestionType", () => {
  test("accepts supported question types", () => {
    expect(normalizeQuestionType("multiple")).toBe("multiple");
  });

  test("returns null for unsupported question types", () => {
    expect(normalizeQuestionType("essay")).toBeNull();
  });
});
