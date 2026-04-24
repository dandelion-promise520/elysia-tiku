# Elysia Tiku 管理面板界面汉化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate the entire UI of the Elysia Tiku admin console from English to a modern, professional SaaS-style Chinese.

**Architecture:** Replace English text strings directly inside the React components (`App.tsx` and the panels in `src/components/`) without changing the logic, variable names, or internal enum values (e.g. `single`, `multiple`).

**Tech Stack:** React, TypeScript.

---

### Task 1: Localize App Layout & Navigation

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Update text strings in `App.tsx`**

We will update the sidebar navigation labels, status indicators, and toast messages to Chinese.

Update `apps/web/src/App.tsx` to apply the following replacements:

```tsx
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
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/App.tsx
git commit -m "feat(ui): localize main app layout to chinese"
```

---

### Task 2: Localize Login Panel

**Files:**
- Modify: `apps/web/src/components/LoginPanel.tsx`

- [ ] **Step 1: Update text strings in `LoginPanel.tsx`**

Replace the entire `apps/web/src/components/LoginPanel.tsx` file:

```tsx
import { useState } from "react";
import { fetchConfig } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginPanel({ onLoginSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError(null);
    
    localStorage.setItem("admin_token", password);
    
    try {
      await fetchConfig();
      onLoginSuccess();
    } catch (err: any) {
      if (err.name === "AuthError") {
        setError("身份验证失败：密码错误");
        localStorage.removeItem("admin_token");
      } else {
        setError("网络错误：无法连接到服务器");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md border bg-card">
      <CardHeader className="p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border bg-muted text-foreground rounded-full">
          <Lock className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight">系统身份验证</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-2">
          需要管理员权限才能访问系统
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="请输入管理员密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!password || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                验证中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                登录系统
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/LoginPanel.tsx
git commit -m "feat(ui): localize login panel to chinese"
```

---

### Task 3: Localize Config Panel

**Files:**
- Modify: `apps/web/src/components/ConfigPanel.tsx`

- [ ] **Step 1: Update text strings in `ConfigPanel.tsx`**

Replace the entire `apps/web/src/components/ConfigPanel.tsx` file:

```tsx
import { useState, useEffect } from "react";
import { updateConfig, type AppConfig } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, Key, Cpu, Timer, Thermometer, Hash, Bug, ScrollText, Lock, Save } from "lucide-react";

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

  useEffect(() => {
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
        adminPassword: "",
      });
    }
  }, [config]);

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
      showToast("保存失败：无法更新系统配置", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="border-b border-border bg-muted/20 p-6">
        <CardTitle className="font-semibold text-xl tracking-tight pb-4 flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary" />
          引擎参数配置
        </CardTitle>
        <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
          配置大模型接口与系统安全选项
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
            <ScrollText className="h-4 w-4 text-primary" /> API 接口地址
          </Label>
          <Input
            type="text"
            className=""
            placeholder="https://api.openai.com/v1"
            value={form.aiBaseUrl}
            onChange={(e) => set("aiBaseUrl", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Key className="h-4 w-4 text-primary" /> API 密钥
            </Label>
            <Input
              type="password"
              className=""
              placeholder={config?.aiApiKey ? "[已设置，输入新密钥以覆盖]" : "[请输入 API 密钥]"}
              value={form.aiApiKey}
              onChange={(e) => set("aiApiKey", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Cpu className="h-4 w-4 text-primary" /> AI 模型名称
            </Label>
            <Input
              type="text"
              className=""
              placeholder="gpt-4o-mini"
              value={form.aiModel}
              onChange={(e) => set("aiModel", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Thermometer className="h-4 w-4 text-primary" /> 输出随机性 (Temperature)
            </Label>
            <Input
              type="number"
              className=""
              step="0.1"
              min="0"
              max="2"
              value={form.aiTemperature}
              onChange={(e) => set("aiTemperature", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Hash className="h-4 w-4 text-primary" /> 最大输出长度 (Max Tokens)
            </Label>
            <Input
              type="number"
              className=""
              step="64"
              min="64"
              value={form.aiMaxTokens}
              onChange={(e) => set("aiMaxTokens", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Timer className="h-4 w-4 text-primary" /> 请求超时时间 (毫秒)
            </Label>
            <Input
              type="number"
              className=""
              step="1000"
              min="5000"
              value={form.aiTimeoutMs}
              onChange={(e) => set("aiTimeoutMs", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center justify-between p-5 border border-border bg-background transition-colors hover:bg-muted/10 group">
            <div className="space-y-1">
              <Label className="text-sm font-mono font-bold uppercase tracking-widest group-hover:text-primary transition-colors">默认返回调试输出</Label>
              <p className="text-xs text-muted-foreground font-mono uppercase">在所有请求中直接返回 AI 的原始字符串输出，忽略结构化格式</p>
            </div>
            <Switch
              checked={form.aiDebugDefault}
              onCheckedChange={(v) => set("aiDebugDefault", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between p-5 border border-border bg-background transition-colors hover:bg-muted/10 group">
            <div className="space-y-1">
              <Label className="text-sm font-mono font-bold uppercase tracking-widest group-hover:text-primary transition-colors">启用系统详细日志</Label>
              <p className="text-xs text-muted-foreground font-mono uppercase">在服务器终端开启详细的调试日志打印</p>
            </div>
            <Switch
              checked={form.aiLogDebug}
              onCheckedChange={(v) => set("aiLogDebug", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <div className="space-y-3 pt-8 border-t border-border bg-destructive/10 border border-destructive/20 rounded-md p-6 border-x-0 border-b-0 -mx-8 px-8">
          <Label className="flex items-center gap-2 text-destructive font-mono text-sm font-bold uppercase tracking-widest">
            <Lock className="h-4 w-4" /> 管理员系统密码
          </Label>
          <Input
            type="password"
            className="border-destructive focus-visible:ring-destructive"
            placeholder={config?.hasPassword ? "[已设置，输入新密码以覆盖]" : "[未设置密码]"}
            value={form.adminPassword}
            onChange={(e) => set("adminPassword", e.target.value)}
          />
          <p className="text-xs text-destructive/80 font-mono uppercase">
            警告：如果留空，任何人都可以访问此管理面板。
          </p>
        </div>

        <div className="pt-4">
          <Button
            className="w-full"
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Bug className="h-6 w-6 animate-spin" /> 正在保存...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-6 w-6 group-hover:scale-110 transition-transform" /> 保存配置
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/ConfigPanel.tsx
git commit -m "feat(ui): localize config panel to chinese"
```

---

### Task 4: Localize OCS Panel

**Files:**
- Modify: `apps/web/src/components/OcsPanel.tsx`

- [ ] **Step 1: Update text strings in `OcsPanel.tsx`**

Replace the entire `apps/web/src/components/OcsPanel.tsx` file:

```tsx
import { useState, useMemo } from "react";
import { generateOcsConfig, ocsConfigToJson } from "../ocs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClipboardList, Link2, Copy, Check, BookOpen, Info } from "lucide-react";

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function OcsPanel({ showToast }: Props) {
  const [serverUrl, setServerUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return origin.replace(/:\d+$/, ":3000");
      }
      return origin;
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
      showToast("系统消息：JSON 配置已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("复制失败：剪贴板权限被拒绝", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <Card className="border bg-card overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 p-6">
          <CardTitle className="font-semibold text-xl tracking-tight border-b border-border pb-4 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            OCS 题库配置生成器
          </CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
            生成用于 OCS 浏览器扩展的 JSON 配置文件
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              <Link2 className="h-4 w-4 text-primary" /> 目标服务器地址
            </Label>
            <Input
              type="text"
              className=" px-4 bg-background"
              placeholder="http://your-server:3000"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground font-mono uppercase">
              Elysia Tiku 后端服务的访问地址
            </p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              生成的 JSON 配置代码
            </Label>
            <div className="relative group">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="sm"
                  className={` rounded-md h-10 gap-2 font-mono uppercase tracking-widest ${copied ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> 复制 JSON
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-6 bg-background border border-border font-mono text-sm text-foreground overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar shadow-inner">
                {json}
              </pre>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCopy}
          >
            <span className="flex items-center gap-2">
              <Copy className="h-6 w-6 group-hover:scale-110 transition-transform" /> 复制完整配置代码
            </span>
          </Button>
        </CardContent>
      </Card>

      <Card className="border bg-card bg-muted/30 border-muted">
        <CardHeader className="p-6 border-b border-primary bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <BookOpen className="h-6 w-6" />
            快速使用指南
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {[
            { step: "01", text: "请确保后端服务正在运行且可访问（本地开发请使用 localhost:3000）。" },
            { step: "02", text: "在上方输入服务器地址，下方的 JSON 配置代码会自动更新。" },
            { step: "03", text: "点击复制按钮，并将代码粘贴到 OCS 扩展的自定义题库设置中。" },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start group">
              <span className="text-3xl font-black text-muted-foreground group-hover:text-primary transition-colors font-mono">
                {item.step}
              </span>
              <p className="text-sm font-mono uppercase tracking-widest pt-2 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
          <div className="mt-8 p-5 border border-primary bg-primary/10 flex gap-4 items-start">
            <Info className="h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-primary uppercase font-mono tracking-widest">
                HTTPS 混合内容警告
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase leading-relaxed">
                如果 OCS 答题页面是 HTTPS 协议，而后端服务是 HTTP 协议且没有反向代理，浏览器会拦截请求。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/OcsPanel.tsx
git commit -m "feat(ui): localize ocs panel to chinese"
```

---

### Task 5: Localize Tester Panel

**Files:**
- Modify: `apps/web/src/components/TesterPanel.tsx`

- [ ] **Step 1: Update text strings in `TesterPanel.tsx`**

Replace the entire `apps/web/src/components/TesterPanel.tsx` file:

```tsx
import { useState } from "react";
import { submitAnswer, type AnswerResponse } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Send, ListPlus, CheckSquare, AlertTriangle, Info } from "lucide-react";

const TYPES = [
  { value: "single", label: "单选题" },
  { value: "multiple", label: "多选题" },
  { value: "judgement", label: "判断题" },
  { value: "completion", label: "填空题" },
];

export default function TesterPanel() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("single");
  const [options, setOptions] = useState("A. 选项 1\nB. 选项 2\nC. 选项 3\nD. 选项 4");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnswerResponse | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const optionList =
        type === "completion"
          ? undefined
          : options
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean);

      const data = await submitAnswer({
        title: title.trim(),
        type,
        options: optionList,
        debug: true,
      });
      setResult(data);
    } catch {
      setResult({
        code: 0,
        question: title,
        answer: "",
        message: "网络错误：无法连接到后端服务",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillExample = () => {
    setTitle("下列哪个方法可以向 JavaScript 数组的末尾添加一个或多个元素？");
    setType("single");
    setOptions("A. pop()\nB. push()\nC. shift()\nD. unshift()");
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="border-b border-border bg-muted/20 p-6">
        <CardTitle className="font-semibold text-xl tracking-tight border-b border-border pb-4 flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          大模型请求测试
        </CardTitle>
        <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
          直接调用 AI 引擎，验证提示词与参数配置是否正确
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-3">
          <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
            测试题目内容
          </Label>
          <Textarea
            placeholder="[在此输入测试题目文本]"
            className=" p-4 min-h-[120px] text-base resize-y"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              题目类型
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10 bg-background px-4">
                <SelectValue placeholder="选择题目类型" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border rounded-md shadow-[4px_4px_0_0_hsl(var(--primary))] uppercase font-mono tracking-widest">
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="focus:bg-primary focus:text-primary-foreground rounded-md">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {type !== "completion" && (
          <div className="space-y-3">
            <Label className="text-muted-foreground font-mono text-sm font-bold uppercase tracking-widest">
              候选项列表 (每行填写一个选项)
            </Label>
            <Textarea
              className=" p-4 min-h-[160px] font-mono text-sm uppercase resize-y"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleFillExample}
          >
            <ListPlus className="mr-2 h-4 w-4" />
            填入测试用例
          </Button>
          <Button
            className="flex-[2]"
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 animate-bounce" /> 请求处理中...
              </span>
            ) : (
              <span className="flex items-center gap-2 font-mono tracking-widest text-lg">
                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 发送验证请求
              </span>
            )}
          </Button>
        </div>

        {result && (
          <div className={`mt-8 border-4 animate-in slide-in-from-top-4 duration-500 ${
            result.code === 1 
              ? "bg-secondary/10 border-secondary shadow-[8px_8px_0_0_hsl(var(--secondary))]" 
              : "bg-destructive/10 border-destructive shadow-[8px_8px_0_0_hsl(var(--destructive))]"
          }`}>
            <div className={`p-4 border-b-4 font-mono font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${
              result.code === 1 ? "bg-secondary text-secondary-foreground border-secondary" : "bg-destructive text-destructive-foreground border-destructive"
            }`}>
              {result.code === 1 ? <CheckSquare className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {result.code === 1 ? "系统响应：测试成功" : "系统响应：测试失败"}
            </div>

            <div className="p-8">
              {result.code === 1 ? (
                <div className="space-y-6">
                  <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-mono">
                    AI 计算结果
                  </div>
                  <div className="text-5xl md:text-7xl font-black text-foreground font-semibold tracking-tight uppercase bg-background border border-border p-6 shadow-inner">
                    {result.answer}
                  </div>
                  {result.confidence != null && (
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between text-xs font-mono font-bold tracking-widest uppercase">
                        <span>置信度评分</span>
                        <span>{Math.round(result.confidence * 100)}%</span>
                      </div>
                      <div className="h-4 w-full border border-border bg-background p-0.5">
                        <div 
                          className="h-full bg-secondary transition-all duration-1000 ease-out" 
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {result.reason && (
                    <div className="pt-8 mt-4 border-t border-border border-dashed">
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary mb-4 font-mono">
                        <Info className="h-4 w-4" />
                        执行追踪日志
                      </div>
                      <p className="text-foreground leading-relaxed font-mono text-sm bg-background border border-border p-4 shadow-inner">
                        {result.reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl font-bold uppercase tracking-widest text-destructive font-mono text-center p-8">
                  {result.message || "发生未知错误"}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/TesterPanel.tsx
git commit -m "feat(ui): localize tester panel to chinese"
```

---

### Task 6: Localize Logs Panel

**Files:**
- Modify: `apps/web/src/components/LogsPanel.tsx`

- [ ] **Step 1: Update text strings in `LogsPanel.tsx`**

Replace the entire `apps/web/src/components/LogsPanel.tsx` file:

```tsx
import { useState, useEffect, useCallback } from "react";
import { fetchLogs, type LogEntry } from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RefreshCw, Terminal, Clock, Box } from "lucide-react";

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLogs();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError("网络错误：无法获取系统日志");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <Card className="border bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 border-b border-border bg-muted/20 p-6">
        <div>
          <CardTitle className="font-semibold text-xl tracking-tight flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            系统运行日志
          </CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-widest mt-2">
            查看系统操作历史、错误信息及请求事务日志
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className=" h-10 px-4 bg-background rounded-md hover:bg-primary hover:text-primary-foreground group" 
          onClick={loadLogs} 
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform" />
          )}
          <span className="font-mono tracking-widest uppercase">刷新日志</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="m-6 p-4 border border-destructive bg-destructive/10 text-destructive text-sm font-bold font-mono tracking-widest uppercase flex items-center gap-2 shadow-[4px_4px_0_0_hsl(var(--destructive))]">
             <Box className="h-5 w-5" />
             {error}
          </div>
        )}

        <div className="bg-background p-6">
          <ScrollArea className="h-[600px] pr-4 custom-scrollbar">
            <div className="space-y-4">
            {logs.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-20 font-mono uppercase tracking-widest">
                <Terminal className="h-16 w-16 text-border" />
                <p>暂无日志记录</p>
              </div>
            )}

            {logs.map((log, i) => (
              <div key={i} className="group p-0 bg-background border border-border hover:border-primary transition-colors shadow-sm hover:shadow-[4px_4px_0_0_hsl(var(--primary))]">
                <div className="flex items-start justify-between p-4 border-b border-border bg-muted/10 group-hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center border border-primary bg-primary/10 text-primary">
                      <Terminal className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-foreground font-mono uppercase tracking-wide text-sm">{log.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background border border-border px-2 py-1">
                    <Clock className="h-3 w-3 text-primary" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {log.payload && (
                  <div className="p-4 bg-black/50">
                    <div className="mb-2 flex items-center gap-2 border-b border-border pb-2">
                      <div className="w-3 h-3 bg-destructive border border-border" />
                      <div className="w-3 h-3 bg-secondary border border-border" />
                      <div className="w-3 h-3 bg-primary border border-border" />
                      <span className="text-xs font-bold font-mono text-muted-foreground tracking-widest ml-2 uppercase">请求载荷数据</span>
                    </div>
                    <pre className="text-xs font-mono text-secondary overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      <code>{JSON.stringify(log.payload, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/LogsPanel.tsx
git commit -m "feat(ui): localize logs panel to chinese"
```
