import { useState, useEffect, useCallback } from "react";
import { fetchConfig, type AppConfig } from "./api";
import ConfigPanel from "./components/ConfigPanel";
import OcsPanel from "./components/OcsPanel";
import TesterPanel from "./components/TesterPanel";
import LogsPanel from "./components/LogsPanel";
import LoginPanel from "./components/LoginPanel";

type Tab = "config" | "ocs" | "tester" | "logs";

export default function App() {
  const [tab, setTab] = useState<Tab>("config");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [online, setOnline] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // default true, will be set to false if 401
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      const c = await fetchConfig();
      setConfig(c);
      setOnline(true);
      setIsLoggedIn(true);
    } catch (err: any) {
      if (err.name === "AuthError") {
        setIsLoggedIn(false);
      }
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <>
      <div className="bg-gradient" />
      <div className="container">
        <header className="header">
          <h1>⚙️ Elysia Tiku 管理面板</h1>
          <p>AI 题库服务配置管理 · OCS 题库配置生成</p>
        </header>

        <div className="status-bar" id="status-bar">
          <span className={`status-dot ${online ? "online" : "offline"}`} />
          <span className="status-text">
            {online ? "服务运行中" : "无法连接服务"}
          </span>
          {config && (
            <span className="status-model">模型: {config.aiModel || "未配置"}</span>
          )}
        </div>

        {isLoggedIn ? (
          <>
            <div className="tabs" id="main-tabs">
              <button
                className={`tab ${tab === "config" ? "active" : ""}`}
                onClick={() => setTab("config")}
              >
                ⚙️ AI 配置
              </button>
              <button
                className={`tab ${tab === "ocs" ? "active" : ""}`}
                onClick={() => setTab("ocs")}
              >
                📋 OCS 配置
              </button>
              <button
                className={`tab ${tab === "tester" ? "active" : ""}`}
                onClick={() => setTab("tester")}
              >
                🧪 答题测试
              </button>
              <button
                className={`tab ${tab === "logs" ? "active" : ""}`}
                onClick={() => setTab("logs")}
              >
                📄 系统日志
              </button>
            </div>

            {tab === "config" && (
              <ConfigPanel config={config} onSaved={() => { loadConfig(); showToast("配置已保存"); }} showToast={showToast} />
            )}
            {tab === "ocs" && <OcsPanel showToast={showToast} />}
            {tab === "tester" && <TesterPanel />}
            {tab === "logs" && <LogsPanel />}
          </>
        ) : (
          <LoginPanel onLoginSuccess={loadConfig} />
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </>
  );
}
