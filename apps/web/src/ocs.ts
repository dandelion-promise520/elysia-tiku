export interface OcsConfig {
  name: string;
  homepage: string;
  url: string;
  method: string;
  contentType: string;
  type: string;
  data: Record<string, string>;
  handler: string;
}

export function generateOcsConfig(serverUrl: string): OcsConfig[] {
  const base = serverUrl.replace(/\/+$/, "");

  return [
    {
      name: "Elysia Tiku AI",
      homepage: base,
      url: `${base}/api/answer`,
      method: "post",
      contentType: "json",
      type: "GM_xmlhttpRequest",
      data: {
        title: "${title}",
        type: "${type}",
        options: "${options}",
      },
      handler:
        "return (res) => res.code === 1 ? [res.question, res.answer] : undefined",
    },
  ];
}

export function ocsConfigToJson(config: OcsConfig[]): string {
  return JSON.stringify(config, null, 2);
}
