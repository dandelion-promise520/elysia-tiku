import { describe, it, expect } from "vitest";
import { generateOcsConfig, ocsConfigToJson } from "../src/ocs";

describe("generateOcsConfig", () => {
  it("should generate valid OCS config array", () => {
    const config = generateOcsConfig("http://localhost:3000");
    expect(config).toHaveLength(1);
    expect(config[0].name).toBe("Elysia Tiku AI");
    expect(config[0].method).toBe("post");
    expect(config[0].contentType).toBe("json");
    expect(config[0].type).toBe("GM_xmlhttpRequest");
  });

  it("should use the provided server URL", () => {
    const config = generateOcsConfig("https://my-server.com");
    expect(config[0].url).toBe("https://my-server.com/api/answer");
    expect(config[0].homepage).toBe("https://my-server.com");
  });

  it("should strip trailing slashes from server URL", () => {
    const config = generateOcsConfig("http://example.com/");
    expect(config[0].url).toBe("http://example.com/api/answer");
    expect(config[0].homepage).toBe("http://example.com");
  });

  it("should include OCS variable placeholders in data", () => {
    const config = generateOcsConfig("http://localhost:3000");
    expect(config[0].data.title).toBe("${title}");
    expect(config[0].data.type).toBe("${type}");
    expect(config[0].data.options).toBe("${options}");
  });

  it("should include a valid handler string", () => {
    const config = generateOcsConfig("http://localhost:3000");
    expect(config[0].handler).toContain("return");
    expect(config[0].handler).toContain("res.code === 1");
    expect(config[0].handler).toContain("res.question");
    expect(config[0].handler).toContain("res.answer");
  });

  it("should surface backend failure messages in the OCS handler", () => {
    const config = generateOcsConfig("http://localhost:3000");
    expect(config[0].handler).toContain("res.message");
    expect(config[0].handler).toContain("undefined");
  });
});

describe("ocsConfigToJson", () => {
  it("should produce valid JSON string", () => {
    const config = generateOcsConfig("http://localhost:3000");
    const json = ocsConfigToJson(config);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it("should be pretty-printed with 2-space indent", () => {
    const config = generateOcsConfig("http://localhost:3000");
    const json = ocsConfigToJson(config);
    expect(json).toContain("  ");
    expect(json.startsWith("[")).toBe(true);
  });

  it("should roundtrip correctly", () => {
    const config = generateOcsConfig("http://localhost:3000");
    const json = ocsConfigToJson(config);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(config);
  });
});
