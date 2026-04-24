import { Elysia } from "elysia";

import type { AnswerService } from "./service";

export function createAnswerModule(answerService: AnswerService) {
  return new Elysia({ prefix: "/api" })
    .onParse(async ({ request, contentType }) => {
      // 处理 text/plain 的 JSON 数据
      if (contentType === "text/plain" || contentType?.startsWith("text/plain")) {
        const text = await request.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    })
    .post("/answer", async ({ body, set }) => {
      console.log("[REQUEST] New answer request");
      const bodyObj = body as Record<string, unknown>;
      console.log("[REQUEST] Title:", bodyObj.title);
      console.log("[REQUEST] Type:", bodyObj.type);

      const result = await answerService.answer(bodyObj);
      console.log("[RESPONSE] Code:", result.body.code);
      if (result.body.code === 0) {
        console.log("[RESPONSE] Error:", (result.body as any).message);
      } else {
        console.log("[RESPONSE] Answer:", (result.body as any).answer);
      }

      set.status = result.status;
      return result.body;
    });
}
