# OCS AI Answer Service Design

## Summary

This project will add an OCS-compatible answer service to the existing Elysia app. The service will accept question requests from OCS, normalize the incoming payload, call an OpenAI-compatible model API, validate and format the returned answer, and respond with a stable JSON structure that OCS can parse through `AnswererWrapper`.

The first version is accuracy-first. It will support `single`, `multiple`, `judgement`, and `completion` question types. It will not implement a local question bank, admin UI, user accounts, billing, or subjective-answer workflows.

## Goals

- Expose a single HTTP API that can be called from OCS `AnswererWrapper`
- Normalize noisy question input before sending it to AI
- Use an OpenAI-compatible provider configured by environment variables
- Return stable, machine-friendly JSON for OCS handlers
- Favor answer correctness and output consistency over minimum latency
- Include an optional debug mode for troubleshooting prompt and parsing issues

## Non-Goals

- Building a local question bank or CRUD backend
- Building a web dashboard or management UI
- Supporting essay or long-form subjective questions in v1
- Multi-model voting, ensemble verification, or provider failover in v1
- Authentication, quotas, billing, or tenant isolation in v1
- Long-term conversational memory across requests

## Recommended Approach

Three approaches were considered:

1. Direct pass-through: map request to prompt, call AI, return result
2. Structured pipeline: normalize input, build prompt, call AI, validate output, format response
3. Multi-strategy aggregator: multiple prompts or multiple models with cross-checking

The recommended approach is the structured pipeline. It preserves a simple external API while keeping internal boundaries clear enough to improve answer quality later. This fits the current minimal Elysia codebase and keeps the first release focused.

## Architecture

The service will remain externally simple and internally modular.

### External Shape

- One main API endpoint exposed by Elysia, for example `POST /api/answer`
- Request body contains the question text, question type, and optional options
- Response returns normalized question text, final answer, and optional debug metadata

### Internal Flow

1. Receive OCS-compatible request
2. Validate required fields and normalize the input payload
3. Convert normalized input into a prompt payload for the AI provider
4. Call the OpenAI-compatible chat completion endpoint
5. Parse model output into a strict internal answer structure
6. Post-process and validate the answer against the requested question type
7. Return stable JSON for OCS consumption

### Suggested Project Structure

Following the Elysia feature-oriented pattern:

```text
src/
  index.ts
  modules/
    answer/
      index.ts
      model.ts
      service.ts
      prompt.ts
      normalizer.ts
      formatter.ts
      provider.ts
  plugins/
    config.ts
```

Responsibilities:

- `modules/answer/index.ts`: Elysia routes and schema binding
- `modules/answer/model.ts`: request, response, and internal validation models
- `modules/answer/service.ts`: orchestration of the answer pipeline
- `modules/answer/prompt.ts`: prompt construction rules by question type
- `modules/answer/normalizer.ts`: input cleaning and type mapping
- `modules/answer/formatter.ts`: output validation and response formatting
- `modules/answer/provider.ts`: OpenAI-compatible HTTP client wrapper
- `plugins/config.ts`: environment loading and typed config access

## Request Contract

The API should accept an OCS-oriented payload with these core fields:

- `title`: string, required, the question text
- `type`: string, required, one of `single`, `multiple`, `judgement`, `completion`
- `options`: optional, either a newline-separated string or an array of option strings
- `debug`: optional boolean for returning troubleshooting metadata

### Request Examples

Single choice:

```json
{
  "title": "中国梦是什么？",
  "type": "single",
  "options": "A. 国家富强\nB. 民族振兴\nC. 人民幸福\nD. 以上都是"
}
```

Completion:

```json
{
  "title": "中国梦的本质是国家富强、民族振兴、____。",
  "type": "completion"
}
```

## Response Contract

The API should always return structured JSON. This keeps the OCS-side `handler` simple and gives the backend full control over formatting.

### Success Response

```json
{
  "code": 1,
  "question": "中国梦是什么？",
  "answer": "D",
  "confidence": 0.91,
  "reason": "题干与选项共同指向完整表述。"
}
```

### Success Response With Debug

```json
{
  "code": 1,
  "question": "中国梦是什么？",
  "answer": "D",
  "confidence": 0.91,
  "reason": "题干与选项共同指向完整表述。",
  "debug": {
    "normalizedInput": {
      "title": "中国梦是什么？",
      "type": "single",
      "options": ["A. 国家富强", "B. 民族振兴", "C. 人民幸福", "D. 以上都是"]
    },
    "provider": "openai-compatible",
    "model": "configured-model",
    "rawModelOutput": "{\"answer\":\"D\",\"confidence\":0.91,\"reason\":\"...\"}"
  }
}
```

### Failure Response

```json
{
  "code": 0,
  "question": "中国梦是什么？",
  "answer": "",
  "message": "AI result could not be validated"
}
```

### OCS Integration Shape

The OCS `handler` can remain very small:

```js
return (res) => res.code === 1 ? [res.question, res.answer] : [res.message, undefined]
```

## Input Normalization Rules

Because the system is accuracy-first, the server must clean and structure input before prompting the model.

### Title Normalization

- Trim leading and trailing whitespace
- Collapse repeated blank lines and repeated spaces
- Remove common leading question labels when they are obvious noise, such as `单选题`, `多选题`, `判断题`, `填空题`
- Preserve the semantic text of the question

### Option Normalization

- Accept either a newline-separated string or a string array
- Split newline-separated input into an array
- Trim each option
- Drop empty options
- Preserve labels such as `A.`, `B.`, `C.`, `D.`

### Type Normalization

Allowed types in v1:

- `single`
- `multiple`
- `judgement`
- `completion`

Any other value returns a validation failure and does not call the AI provider.

## AI Provider Design

The service will integrate with an OpenAI-compatible API. Configuration should come from environment variables.

### Required Configuration

- `AI_BASE_URL`
- `AI_API_KEY`
- `AI_MODEL`

### Optional Configuration

- `AI_TIMEOUT_MS`
- `AI_TEMPERATURE`
- `AI_MAX_TOKENS`
- `AI_DEBUG_DEFAULT`

### Provider Behavior

- Use a single provider abstraction even though only one provider family is supported in v1
- Send one request per incoming question
- Use a low temperature by default to reduce answer drift
- Expect JSON-only content from the model
- Treat transport errors, timeout errors, and invalid model output as distinct failure cases

## Prompt Strategy

Prompting should be explicitly constrained for predictable parsing.

### System Prompt Requirements

The system instruction should:

- Tell the model it is answering educational objective questions
- Require JSON-only output
- Forbid markdown, extra commentary, or chain-of-thought style explanations
- Require fields: `answer`, `confidence`, and `reason`
- State the expected answer shape by question type

### User Prompt Contents

The user prompt should include:

- Normalized question title
- Normalized question type
- Normalized options array when present
- A direct instruction to choose the most likely correct answer

### Type-Specific Output Constraints

- `single`: one option label or one exact short answer if labels are unavailable
- `multiple`: multiple option labels joined into a single string using a stable separator chosen by the backend
- `judgement`: only `正确` or `错误`
- `completion`: a concise fill-in answer without extra explanation

## Answer Parsing And Validation

Model output must never be trusted directly. The backend is responsible for validating and correcting it where safe.

### Expected Internal AI Payload

```json
{
  "answer": "D",
  "confidence": 0.91,
  "reason": "题干与选项共同指向完整表述。"
}
```

### Post-Processing Rules

- Parse JSON strictly
- If confidence is missing, set it to `null`
- Normalize reason to a short plain-text string
- Remove surrounding explanation from completion answers
- Normalize punctuation and spacing

### Type-Specific Validation

For `single`:

- Accept one option label when options are present
- If the model returns option text instead of label, try to match it back to the closest option
- Reject multi-answer output

For `multiple`:

- Accept multiple labels
- Deduplicate labels
- Normalize order by option order
- Convert the final output into a single separator-joined string compatible with OCS expectations

For `judgement`:

- Normalize synonyms such as `对`, `错`, `true`, `false`, `yes`, `no` into `正确` or `错误`
- Reject ambiguous responses

For `completion`:

- Return a concise answer string only
- Strip leading phrases such as `答案是`
- Reject empty output

## Error Handling

The API should distinguish failure sources internally while keeping the outward contract simple.

### Validation Failures

Cases:

- Missing `title`
- Missing `type`
- Unsupported `type`
- Malformed `options`

Response behavior:

- Return `code: 0`
- Include a short `message`
- Do not call the AI provider

### Provider Failures

Cases:

- Network failure
- Timeout
- Unauthorized provider response
- Non-2xx provider status

Response behavior:

- Return `code: 0`
- Include a generic provider failure `message`
- Optionally expose more detail only in debug mode

### Parsing Failures

Cases:

- AI returns non-JSON output
- JSON is missing required fields
- Answer cannot be mapped to the requested question type

Response behavior:

- Return `code: 0`
- Include a short validation-related `message`

## Debug Mode

Debug mode should help diagnose prompt and mapping issues without changing the success contract.

### Debug Contents

When enabled, the response may include:

- Normalized input payload
- Provider name and model
- Raw AI output
- Parsed AI output
- Post-processing notes when answer repair logic is applied

### Debug Controls

- A per-request `debug` flag can enable debug output
- An environment default can enable debug output globally during development
- Production deployments should default debug mode to off

## Testing Strategy

Testing is essential because the service depends on an AI provider but must still behave deterministically at the API boundary.

### Unit Tests

Cover:

- Title normalization
- Option parsing
- Type mapping
- Single-answer formatting
- Multiple-answer normalization and separator handling
- Judgement answer normalization
- Completion answer cleanup

### Route And Contract Tests

Cover:

- Valid request returns stable JSON
- Missing fields return validation failure
- Unsupported type returns validation failure
- Debug mode includes additional metadata

### Provider Adaptation Tests

Cover:

- OpenAI-compatible request generation
- Response parsing
- Timeout and non-2xx handling
- Invalid JSON returned by the model

These tests should mock the provider rather than depend on a live AI endpoint.

## Security And Operational Notes

The first version is intentionally simple, but a few guardrails should still be designed in:

- Do not log raw API keys
- Apply reasonable request body limits
- Apply request timeouts to provider calls
- Keep prompt construction server-side only
- Avoid returning raw provider errors unless debug mode is enabled

Rate limiting and authentication are intentionally out of scope for v1, but the route structure should leave room to add them later.

## Deployment And Configuration Notes

The project currently runs as a Bun-based Elysia app. The answer service should stay compatible with that setup.

Expected runtime assumptions:

- Bun runtime
- Environment variables loaded at startup
- One HTTP server process
- Outbound HTTPS access to the configured AI provider

## Implementation Sequence

The implementation should proceed in this order:

1. Add typed config loading for AI provider settings
2. Add answer module schemas and internal types
3. Implement input normalization helpers
4. Implement prompt builder and provider client
5. Implement answer parsing and formatter logic
6. Expose the Elysia route
7. Add unit and route tests
8. Verify the final JSON shape against a sample OCS `AnswererWrapper` configuration

## Open Questions Resolved For V1

- Priority: accuracy over speed
- Supported question types: `single`, `multiple`, `judgement`, `completion`
- Provider family: OpenAI-compatible APIs only
- Response style: dual-mode JSON with optional debug metadata

No unresolved product decisions remain for the first implementation slice.
