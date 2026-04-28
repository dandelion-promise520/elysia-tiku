import { useState, useCallback, lazy, Suspense } from "react";
import LoginPanel from "./components/LoginPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Terminal, Database, Code, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import { useConfig } from "./hooks/useConfig";

// 懒加载组件以优化首屏加载性能
const ConfigPanel = lazy(() => import("./components/ConfigPanel"));
const OcsPanel = lazy(() => import("./components/OcsPanel"));
const TesterPanel = lazy(() => import("./components/TesterPanel"));
const LogsPanel = lazy(() => import("./components/LogsPanel"));

type Tab = "config" | "ocs" | "tester" | "logs";

export default function App() {
  const [tab, setTab] = useState<Tab>("config");
  const [online, setOnline] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { config, refetch } = useConfig();

  const loadConfig = useCallback(async () => {
    try {
      await refetch();
      setOnline(true);
      setIsLoggedIn(true);
    } catch (err: any) {
      if (err.name === "AuthError") {
        setIsLoggedIn(false);
      }
      setOnline(false);
    }
  }, [refetch]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      toast(msg, { icon: <CheckCircle2 className="h-4 w-4 text-[hsl(var(--green-9))]" /> });
    } else {
      toast(msg, { icon: <AlertCircle className="h-4 w-4 text-destructive" /> });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-9/5 via-transparent to-slate-8/10 pointer-events-none" />

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="mb-10 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-8 to-blue-9 mb-4 shadow-lg">
              <Terminal className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Elysia Tiku
            </h1>
            <p className="text-base text-muted-foreground font-medium">智能题库管理面板</p>
            <p className="text-sm text-muted-foreground/80">请登录以继续访问系统</p>
          </div>
          <div className="glass-card p-6">
            <LoginPanel onLoginSuccess={loadConfig} />
          </div>
        </div>
        <Toaster position="bottom-right" theme="dark" toastOptions={{ className: 'border border-border bg-card text-card-foreground shadow-sm rounded-md font-sans text-sm' }} />
      </div>
    );
  }

  const renderContent = () => {
    const fallback = (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-blue-8/30 border-t-blue-8 rounded-full animate-spin" />
          <span>正在加载组件...</span>
        </div>
      </div>
    );

    switch (tab) {
      case "config":
        return (
          <Suspense fallback={fallback}>
            <ConfigPanel
              config={config}
              onSaved={() => {
                loadConfig();
                showToast("系统配置保存成功");
              }}
              showToast={showToast}
            />
          </Suspense>
        );
      case "ocs":
        return (
          <Suspense fallback={fallback}>
            <OcsPanel showToast={showToast} />
          </Suspense>
        );
      case "tester":
        return (
          <Suspense fallback={fallback}>
            <TesterPanel />
          </Suspense>
        );
      case "logs":
        return (
          <Suspense fallback={fallback}>
            <LogsPanel />
          </Suspense>
        );
    }
  };

  const navItems = [
    { id: "config", label: "系统设置", icon: Database },
    { id: "ocs", label: "题库配置生成", icon: Code },
    { id: "tester", label: "测试与调试", icon: Terminal },
    { id: "logs", label: "系统运行日志", icon: Terminal },
  ] as const;

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-background text-foreground font-sans">
        {/* Sidebar */}
        <aside className="w-64 glass-panel bg-background/40 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-8 to-blue-9 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Elysia Tiku</h1>
          </div>
        </div>

        <div className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-8/20 to-blue-9/10 text-blue-11 shadow-sm border border-blue-7/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:translate-x-1"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-11" : "group-hover:text-blue-11"} transition-colors`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-blue-11 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50 space-y-4">
          <div className="glass-panel bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${online ? "bg-green-9" : "bg-destructive"} animate-pulse`} />
                <span className="font-medium">{online ? "服务运行中" : "服务已离线"}</span>
              </span>
              <span className="text-muted-foreground">系统就绪</span>
            </div>
            {config && (
              <div className="text-xs text-muted-foreground truncate">
                当前模型: <span className="text-foreground/80 font-medium">{config.aiModel || "N/A"}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-all duration-200 group"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 flex items-center px-8 border-b border-border/50 bg-background/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-9 to-blue-11 rounded-full" />
            <div>
              <h2 className="font-bold text-xl">
                {navItems.find(i => i.id === tab)?.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {tab === "config" && "配置 AI 引擎参数和系统设置"}
                {tab === "ocs" && "生成和管理 OCS 题库配置文件"}
                {tab === "tester" && "测试 API 连接和调试功能"}
                {tab === "logs" && "查看系统运行日志和调试信息"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="p-8">
            <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>

        <Toaster position="bottom-right" theme="dark" toastOptions={{
          className: 'border border-border bg-card text-card-foreground shadow-sm rounded-md font-sans text-sm',
        }} />
      </div>
    </ErrorBoundary>
  );
}