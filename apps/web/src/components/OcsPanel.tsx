import { useState, useMemo } from "react";
import { generateOcsConfig, ocsConfigToJson } from "../ocs";

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function OcsPanel({ showToast }: Props) {
  const [serverUrl, setServerUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  });
  const [copied, setCopied] = useState(false);

  const config = useMemo(() => generateOcsConfig(serverUrl), [serverUrl]);
  const json = useMemo(() => ocsConfigToJson(config), [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      showToast("已复制到剪贴板！");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("复制失败", "error");
    }
  };

  return (
    <>
      <div className="card" id="ocs-panel">
        <div className="card-title">
          <span className="icon">📋</span>
          OCS 题库配置生成
        </div>

        <div className="form-group">
          <label htmlFor="ocs-server-url">服务器地址</label>
          <input
            id="ocs-server-url"
            type="text"
            placeholder="http://your-server:3000"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          />
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
            输入你的 Elysia Tiku 后端部署地址，配置会自动更新
          </div>
        </div>

        <div className="form-group">
          <label>生成的配置 (JSON)</label>
          <div className="code-block" id="ocs-json-output">
            <button
              className={`copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopy}
              id="btn-copy-ocs"
            >
              {copied ? "✅ 已复制" : "📋 复制"}
            </button>
            {json}
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleCopy}
          id="btn-copy-ocs-main"
        >
          📋 一键复制配置
        </button>
      </div>

      <div className="card">
        <div className="card-title">
          <span className="icon">📖</span>
          使用说明
        </div>
        <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <p><strong>1.</strong> 确保 Elysia Tiku 后端已部署并可访问</p>
          <p><strong>2.</strong> 填入正确的服务器地址（如有域名填域名）</p>
          <p><strong>3.</strong> 点击「一键复制配置」</p>
          <p><strong>4.</strong> 打开 OCS 网课助手 → 通用 → 全局设置 → 题库配置</p>
          <p><strong>5.</strong> 粘贴 JSON 配置并保存</p>
          <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: "0.8rem" }}>
            ⚠️ 注意：如使用自定义域名，需要在脚本管理器中将域名加入 @connect 白名单，或使用 OCS 全域名通用版本。
          </p>
        </div>
      </div>
    </>
  );
}
