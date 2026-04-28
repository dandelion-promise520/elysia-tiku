import { describe, expect, test } from "bun:test";

import { createApp } from "../src/app";
import { db } from "../src/db";
import type { AiProviderResult } from "../src/modules/answer/provider";

const providerResult: AiProviderResult = {
  rawText: '{"answer":"D","confidence":0.91,"reason":"题干与选项共同指向完整表述。"}',
  payload: {
    answer: "D",
    confidence: 0.91,
    reason: "题干与选项共同指向完整表述。",
  },
};

describe("createApp", () => {
  test("returns a formatted answer for a valid OCS request", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "单选题 中国梦是什么？",
          type: "single",
          options: "A. 国家富强\nB. 民族振兴\nC. 人民幸福\nD. 以上都是",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      code: 1,
      question: "中国梦是什么？",
      answer: "D",
      confidence: 0.91,
      reason: "题干与选项共同指向完整表述。",
    });
  });

  test("returns a validation failure for unsupported question types", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "这是一道问答题",
          type: "essay",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      code: 0,
      question: "这是一道问答题",
      answer: "",
      message: "Unsupported question type",
    });
  });

  test("accepts online-search style requests that only provide a title", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => ({
          rawText:
            '{"answer":"2","confidence":1,"reason":"1+1 在基础算术中等于 2。"}',
          payload: {
            answer: "2",
            confidence: 1,
            reason: "1+1 在基础算术中等于 2。",
          },
        }),
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "1+1等于几",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      code: 1,
      question: "1+1等于几",
      answer: "2",
      confidence: 1,
      reason: "1+1 在基础算术中等于 2。",
    });
  });

  test("includes debug metadata when debug mode is enabled", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "单选题 中国梦是什么？",
          type: "single",
          options: "A. 国家富强\nB. 民族振兴\nC. 人民幸福\nD. 以上都是",
          debug: true,
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.debug).toEqual({
      normalizedInput: {
        title: "中国梦是什么？",
        type: "single",
        options: ["A. 国家富强", "B. 民族振兴", "C. 人民幸福", "D. 以上都是"],
      },
      provider: "openai-compatible",
      model: "test-model",
      rawModelOutput:
        '{"answer":"D","confidence":0.91,"reason":"题干与选项共同指向完整表述。"}',
    });
  });

  test("returns a provider failure response when the AI request throws", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => {
          throw new Error("network down");
        },
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "单选题 中国梦是什么？",
          type: "single",
          options: "A. 国家富强\nB. 民族振兴\nC. 人民幸福\nD. 以上都是",
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      code: 0,
      question: "中国梦是什么？",
      answer: "",
      message: "AI provider request failed after retries",
    });
  });

  test("writes debug logs when debug mode is enabled", async () => {
    const logs: string[] = [];
    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
      logger: {
        info(message, payload) {
          logs.push(`${message} ${JSON.stringify(payload)}`);
        },
      },
    });

    await app.handle(
      new Request("http://localhost/api/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "单选题 中国梦是什么？",
          type: "single",
          options: "A. 国家富强\nB. 民族振兴\nC. 人民幸福\nD. 以上都是",
          debug: true,
        }),
      }),
    );

    expect(logs.length).toBe(1);
    expect(logs[0]).toContain("answer-service debug");
    expect(logs[0]).toContain('"rawModelOutput"');
    expect(logs[0]).toContain('"formattedResult"');
  });

  test("allows browser preflight requests for cross-origin fetches", async () => {
    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(
      new Request("http://localhost/api/answer", {
        method: "OPTIONS",
        headers: {
          origin: "chrome-extension://test-extension",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "chrome-extension://test-extension",
    );
  });

  test("returns log ids with the logs list", async () => {
    db.run("DELETE FROM logs");
    db.query(
      "INSERT INTO logs (timestamp, message, payload) VALUES (?, ?, ?)",
    ).run("2026-04-24T10:00:00.000Z", "first log", JSON.stringify({ ok: true }));

    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const response = await app.handle(new Request("http://localhost/api/logs"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual([
      {
        id: expect.any(Number),
        timestamp: "2026-04-24T10:00:00.000Z",
        message: "first log",
        payload: {
          ok: true,
        },
      },
    ]);
  });

  test("deletes selected logs and can clear all logs", async () => {
    db.run("DELETE FROM logs");
    const insert = db.query(
      "INSERT INTO logs (timestamp, message, payload) VALUES (?, ?, ?)",
    );
    const first = insert.run(
      "2026-04-24T10:00:00.000Z",
      "first log",
      JSON.stringify({ index: 1 }),
    );
    const second = insert.run(
      "2026-04-24T10:01:00.000Z",
      "second log",
      JSON.stringify({ index: 2 }),
    );

    const app = createApp({
      provider: {
        answerQuestion: async () => providerResult,
      },
      config: {
        aiBaseUrl: "https://example.com/v1",
        aiApiKey: "test-key",
        aiModel: "test-model",
        aiTimeoutMs: 10_000,
        aiTemperature: 0.2,
        aiMaxTokens: 512,
        aiDebugDefault: false,
        aiLogDebug: false,
      },
    });

    const deleteSelectedResponse = await app.handle(
      new Request("http://localhost/api/logs/batch", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ids: [Number(first.lastInsertRowid)],
        }),
      }),
    );

    expect(deleteSelectedResponse.status).toBe(200);

    const afterBatchDelete = await app.handle(
      new Request("http://localhost/api/logs"),
    );
    const afterBatchDeletePayload = await afterBatchDelete.json();

    expect(afterBatchDeletePayload).toEqual([
      {
        id: Number(second.lastInsertRowid),
        timestamp: "2026-04-24T10:01:00.000Z",
        message: "second log",
        payload: {
          index: 2,
        },
      },
    ]);

    const clearResponse = await app.handle(
      new Request("http://localhost/api/logs", {
        method: "DELETE",
      }),
    );

    expect(clearResponse.status).toBe(200);

    const afterClearResponse = await app.handle(
      new Request("http://localhost/api/logs"),
    );
    const afterClearPayload = await afterClearResponse.json();

    expect(afterClearPayload).toEqual([]);
  });
});
