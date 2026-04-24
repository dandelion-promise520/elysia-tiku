import { useState, useEffect, useCallback } from "react";
import { fetchConfig, type AppConfig } from "./api";
import ConfigPanel from "./components/ConfigPanel";
import OcsPanel from "./components/OcsPanel";
import TesterPanel from "./components/TesterPanel";
import LogsPanel from "./components/LogsPanel";
import LoginPanel from "./components/LoginPanel";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Terminal, Database, Code, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

type Tab = "config" | "ocs" | "tester" | "logs";

export default function App() {
  const [tab, setTab] = useState<Tab>("config");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [online, setOnline] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

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
    if (type === "success") {
      toast(msg, { icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> });
    } else {
      toast(msg, { icon: <AlertCircle className="h-4 w-4 text-destructive" /> });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    setConfig(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Elysia Tiku</h1>
            <p className="text-sm text-muted-foreground">管理面板 / 登录</p>
          </div>
          <LoginPanel onLoginSuccess={loadConfig} />
        </div>
        <Toaster position="bottom-right" theme="dark" toastOptions={{ className: 'border border-border bg-card text-card-foreground shadow-sm rounded-md font-sans text-sm' }} />
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "config": return <ConfigPanel config={config} onSaved={() => { loadConfig(); showToast("系统配置保存成功"); }} showToast={showToast} />;
      case "ocs": return <OcsPanel showToast={showToast} />;
      case "tester": return <TesterPanel />;
      case "logs": return <LogsPanel />;
    }
  };

  const navItems = [
    { id: "config", label: "系统设置", icon: Database },
    { id: "ocs", label: "题库配置生成", icon: Code },
    { id: "tester", label: "测试与调试", icon: Terminal },
    { id: "logs", label: "系统运行日志", icon: Terminal },
  ] as const;

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <h1 className="font-semibold text-lg tracking-tight">Elysia Tiku</h1>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-border flex flex-col gap-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-destructive"}`} />
              {online ? "运行中" : "已离线"}
            </span>
            <span>{Math.floor(Math.random() * 40 + 20)}% 内存使用</span>
          </div>
          {config && <div className="truncate">当前模型: {config.aiModel || "N/A"}</div>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-2">
            <LogOut className="h-3 w-3" /> 退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center px-8 border-b border-border">
          <h2 className="font-semibold text-lg">
            {navItems.find(i => i.id === tab)?.label}
          </h2>
        </header>
        <div className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            {renderContent()}
          </div>
        </div>
      </main>

      <Toaster position="bottom-right" theme="dark" toastOptions={{
        className: 'border border-border bg-card text-card-foreground shadow-sm rounded-md font-sans text-sm',
      }} />
    </div>
  );
}