import { Elysia } from "elysia";

import type { AnswerService } from "./service";

export function createAnswerModule(answerService: AnswerService) {
  return new Elysia({ prefix: "/api" }).post("/answer", async ({ body, set }) => {
    const result = await answerService.answer(body as Record<string, unknown>);
    set.status = result.status;
    return result.body;
  });
}
