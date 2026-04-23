import { useState } from "react";
import { updateConfig, type AppConfig } from "../api";

interface Props {
  config: AppConfig | null;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function ConfigPanel({ config, onSaved, showToast }: Props) {
  const [form, setForm] = useState({
    aiBaseUrl: "",
    aiApiKey: "",
    aiModel: "",
    aiTimeoutMs: "30000",
    aiTemperature: "0.2",
    aiMaxTokens: "512",
    aiDebugDefault: false,
    aiLogDebug: false,
    adminPassword: "",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync from config on first load
  useState(() => {
    if (config) {
      setForm({
        aiBaseUrl: config.aiBaseUrl,
        aiApiKey: "",
        aiModel: config.aiModel,
        aiTimeoutMs: String(config.aiTimeoutMs),
        aiTemperature: String(config.aiTemperature),
        aiMaxTokens: String(config.aiMaxTokens),
        aiDebugDefault: config.aiDebugDefault,
        aiLogDebug: config.aiLogDebug,
        adminPassword: "", // don't show the real password
      });
    }
  });

  const set = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = {};
      if (form.aiBaseUrl) updates.aiBaseUrl = form.aiBaseUrl;
      if (form.aiApiKey) updates.aiApiKey = form.aiApiKey;
      if (form.aiModel) updates.aiModel = form.aiModel;
      updates.aiTimeoutMs = Number(form.aiTimeoutMs);
      updates.aiTemperature = Number(form.aiTemperature);
      updates.aiMaxTokens = Number(form.aiMaxTokens);
      updates.aiDebugDefault = form.aiDebugDefault;
      updates.aiLogDebug = form.aiLogDebug;
      if (form.adminPassword) updates.adminPassword = form.adminPassword;
      await updateConfig(updates);
      setDirty(false);
      onSaved();
    } catch {
      showToast("保存失败，请检查服务", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" id="config-panel">
      <div className="card-title">
        <span className="icon">🔧</span>
        AI 服务配置
      </div>

      <div className="form-group">
        <label htmlFor="cfg-base-url">API Base URL</label>
        <input
          id="cfg-base-url"
          type="text"
          placeholder="https://api.openai.com/v1"
          value={form.aiBaseUrl}
          onChange={(e) => set("aiBaseUrl", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cfg-api-key">API Key</label>
          <input
            id="cfg-api-key"
            type="password"
            placeholder={config?.aiApiKey || "输入新的 API Key"}
            value={form.aiApiKey}
            onChange={(e) => set("aiApiKey", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cfg-model">模型名称</label>
          <input
            id="cfg-model"
            type="text"
            placeholder="gpt-4o-mini"
            value={form.aiModel}
            onChange={(e) => set("aiModel", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cfg-temperature">Temperature</label>
          <input
            id="cfg-temperature"
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={form.aiTemperature}
            onChange={(e) => set("aiTemperature", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cfg-max-tokens">Max Tokens</label>
          <input
            id="cfg-max-tokens"
            type="number"
            step="64"
            min="64"
            value={form.aiMaxTokens}
            onChange={(e) => set("aiMaxTokens", e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cfg-timeout">超时时间 (ms)</label>
        <input
          id="cfg-timeout"
          type="number"
          step="1000"
          min="5000"
          value={form.aiTimeoutMs}
          onChange={(e) => set("aiTimeoutMs", e.target.value)}
        />
      </div>

      <div className="form-group">
        <div className="toggle-row">
          <div className="toggle-label">
            <span>默认开启调试</span>
            <span>每次请求返回 AI 原始输出</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.aiDebugDefault}
              onChange={(e) => set("aiDebugDefault", e.target.checked)}
            />
            <span className="track" />
            <span className="thumb" />
          </label>
        </div>
      </div>

      <div className="form-group">
        <div className="toggle-row">
          <div className="toggle-label">
            <span>日志调试</span>
            <span>服务端控制台输出详情日志</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={form.aiLogDebug}
              onChange={(e) => set("aiLogDebug", e.target.checked)}
            />
            <span className="track" />
            <span className="thumb" />
          </label>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
        <label htmlFor="cfg-admin-pwd" style={{ color: "var(--danger)" }}>管理后台密码 (选填)</label>
        <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "0.5rem" }}>
          设置后，每次进入面板均需验证密码。设为空可清除密码。
        </p>
        <input
          id="cfg-admin-pwd"
          type="password"
          placeholder={config?.hasPassword ? "已设置密码，输入新密码以修改" : "未设置后台密码"}
          value={form.adminPassword}
          onChange={(e) => set("adminPassword", e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        id="btn-save-config"
        disabled={!dirty || saving}
        onClick={handleSave}
      >
        {saving ? <span className="spinner" /> : "💾 保存配置"}
      </button>
    </div>
  );
}
