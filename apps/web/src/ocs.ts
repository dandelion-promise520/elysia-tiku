export interface OcsConfig {
  name: string;
  homepage: string;
  url: string;
  method: string;
  contentType: string;
  type: string;
  data: Record<string, any>;
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
        title: {
          handler: "return (env) => { console.log('[OCS] env.title:', env.title); return env.title || ''; }"
        },
        type: {
          handler: "return (env) => { console.log('[OCS] env.type:', env.type); return env.type || 'single'; }"
        },
        options: {
          handler: "return (env) => { console.log('[OCS] env.options:', env.options); return env.options || ''; }"
        }
      },
      handler:
        "return (res) => { console.log('[OCS DEBUG] Response:', res); console.log('[OCS DEBUG] Code:', res.code); return res.code === 1 ? [res.question, res.answer] : [res.message ?? res.question, undefined]; }",
    },
  ];
}

export function ocsConfigToJson(config: OcsConfig[]): string {
  return JSON.stringify(config, null, 2);
}
