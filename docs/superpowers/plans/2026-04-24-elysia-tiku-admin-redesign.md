# Elysia Tiku Admin Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Elysia Tiku admin console from an industrial brutalist aesthetic to a clean, modern, pure monochrome Vercel/Linear style with a sidebar layout.

**Architecture:** Transition layout from `Tabs` to a Flex/Grid sidebar + main layout. Centralize state in `App.tsx`. Update global CSS for pure monochrome dark mode. Remove all brutalist utility classes (`brutalist-card`, `brutalist-button`, `brutalist-input`) from components.

**Tech Stack:** React, Tailwind CSS v4, Lucide React, Shadcn UI.

---

### Task 1: Update Global CSS Theme

**Files:**
- Modify: `apps/web/src/index.css`

- [ ] **Step 1: Replace brutalist CSS variables and utility classes**

Replace the entire contents of `apps/web/src/index.css` with the new pure monochrome theme.

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@theme {
  --font-sans: "Inter", "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;

  /* Pure monochrome mapping */
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

@layer base {
  :root {
    --background: 0 0% 0%; 
    --foreground: 0 0% 98%;
    
    --card: 0 0% 4%;
    --card-foreground: 0 0% 98%;
    
    --popover: 0 0% 4%;
    --popover-foreground: 0 0% 98%;
    
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 0%;
    
    --secondary: 0 0% 9%;
    --secondary-foreground: 0 0% 98%;
    
    --muted: 0 0% 9%;
    --muted-foreground: 0 0% 63.9%;
    
    --accent: 0 0% 9%;
    --accent-foreground: 0 0% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    @apply bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground;
  }
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground;
}
```

- [ ] **Step 2: Commit CSS Changes**

```bash
git add apps/web/src/index.css
git commit -m "style: update global css theme to vercel monochrome"
```

---

### Task 2: Redesign App Layout (Sidebar)

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Rewrite `App.tsx` for sidebar layout and cleaner toaster**

Replace the entire `App.tsx` file to remove Tabs, implement the `<aside>` sidebar, and refine the Toaster styling.

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
import { Terminal, Database, Code, ShieldAlert, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

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
            <p className="text-sm text-muted-foreground">Admin Console / Login</p>
          </div>
          <LoginPanel onLoginSuccess={loadConfig} />
        </div>
        <Toaster position="bottom-right" theme="dark" toastOptions={{ className: 'border border-border bg-card text-card-foreground shadow-sm rounded-md font-sans text-sm' }} />
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "config": return <ConfigPanel config={config} onSaved={() => { loadConfig(); showToast("Configuration saved successfully"); }} showToast={showToast} />;
      case "ocs": return <OcsPanel showToast={showToast} />;
      case "tester": return <TesterPanel />;
      case "logs": return <LogsPanel />;
    }
  };

  const navItems = [
    { id: "config", label: "Configuration", icon: Database },
    { id: "ocs", label: "OCS Generator", icon: Code },
    { id: "tester", label: "Debug & Test", icon: Terminal },
    { id: "logs", label: "System Logs", icon: Terminal },
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
              {online ? "ONLINE" : "OFFLINE"}
            </span>
            <span>{Math.floor(Math.random() * 40 + 20)}% MEM</span>
          </div>
          {config && <div className="truncate">CTX: {config.aiModel || "N/A"}</div>}
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-2">
            <LogOut className="h-3 w-3" /> Logout
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

- [ ] **Step 2: Commit Layout Update**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: implement sidebar layout and clean styles in app shell"
```

---

### Task 3: Clean up Login Panel

**Files:**
- Modify: `apps/web/src/components/LoginPanel.tsx`

- [ ] **Step 1: Replace classes in `LoginPanel.tsx`**

Use Node to clean up the brutalist classes in `LoginPanel.tsx`. Create a temporary script and run it.

```bash
cat << 'EOF' > clean_login.js
const fs = require('fs');
const file = 'apps/web/src/components/LoginPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/brutalist-card border-2 border-border bg-card rounded-none/g, "border bg-card");
code = code.replace(/border-b-2 border-border p-6 bg-muted\/20/g, "p-6 text-center");
code = code.replace(/border-2 border-primary bg-primary\/10 text-primary/g, "border bg-muted text-foreground rounded-full");
code = code.replace(/font-heading font-black uppercase tracking-tighter/g, "font-semibold tracking-tight");
code = code.replace(/font-mono text-xs uppercase tracking-widest mt-2/g, "text-sm text-muted-foreground mt-2");
code = code.replace(/h-14 brutalist-input text-center text-lg uppercase tracking-widest/g, "text-center");
code = code.replace(/brutalist-button bg-primary text-primary-foreground hover:bg-primary\/90 rounded-none/g, "");
code = code.replace(/bg-destructive text-destructive-foreground p-3 font-mono text-sm font-bold uppercase tracking-widest/g, "bg-destructive/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive/20");

fs.writeFileSync(file, code);
EOF
node clean_login.js
rm clean_login.js
```

- [ ] **Step 2: Commit Login Panel Update**

```bash
git add apps/web/src/components/LoginPanel.tsx
git commit -m "style: clean up login panel design"
```

---

### Task 4: Clean up Config Panel

**Files:**
- Modify: `apps/web/src/components/ConfigPanel.tsx`

- [ ] **Step 1: Replace classes in `ConfigPanel.tsx`**

Use Node to clean up the brutalist classes in `ConfigPanel.tsx`.

```bash
cat << 'EOF' > clean_config.js
const fs = require('fs');
const file = 'apps/web/src/components/ConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/brutalist-card rounded-none animate-in fade-in slide-in-from-bottom-8 duration-500/g, "border bg-card");
code = code.replace(/font-heading font-black uppercase tracking-tighter border-b-2 border-border pb-4/g, "font-semibold text-xl tracking-tight border-b border-border pb-4");
code = code.replace(/border-b-2 border-border/g, "border-b border-border");
code = code.replace(/brutalist-input h-12 px-4 bg-background/g, "");
code = code.replace(/border-destructive\/50 focus-visible:border-destructive focus-visible:shadow-\[4px_4px_0_0_hsl\(var\(--destructive\)\)\]/g, "border-destructive focus-visible:ring-destructive");
code = code.replace(/w-full h-16 text-xl brutalist-button bg-primary text-primary-foreground hover:bg-primary\/90 rounded-none group/g, "w-full");
code = code.replace(/bg-destructive\/10 border-2 border-destructive p-4 font-mono text-sm uppercase text-destructive/g, "bg-destructive/10 border border-destructive/20 rounded-md p-4 text-sm font-medium text-destructive");
code = code.replace(/<CardTitle className="font-heading uppercase tracking-widest text-lg flex items-center gap-2">/g, '<CardTitle className="font-semibold text-lg flex items-center gap-2">');

fs.writeFileSync(file, code);
EOF
node clean_config.js
rm clean_config.js
```

- [ ] **Step 2: Commit Config Panel Update**

```bash
git add apps/web/src/components/ConfigPanel.tsx
git commit -m "style: clean up config panel design"
```

---

### Task 5: Clean up OCS, Tester, and Logs Panels

**Files:**
- Modify: `apps/web/src/components/OcsPanel.tsx`
- Modify: `apps/web/src/components/TesterPanel.tsx`
- Modify: `apps/web/src/components/LogsPanel.tsx`

- [ ] **Step 1: Replace classes in Ocs, Tester, Logs panels**

Use Node to clean up the brutalist classes in the remaining panels.

```bash
cat << 'EOF' > clean_panels.js
const fs = require('fs');

const files = [
  'apps/web/src/components/OcsPanel.tsx',
  'apps/web/src/components/TesterPanel.tsx',
  'apps/web/src/components/LogsPanel.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Common replacements
  code = code.replace(/brutalist-card rounded-none overflow-hidden/g, "border bg-card overflow-hidden");
  code = code.replace(/brutalist-card rounded-none animate-in fade-in slide-in-from-bottom-8 duration-500/g, "border bg-card");
  code = code.replace(/brutalist-card rounded-none/g, "border bg-card");
  code = code.replace(/font-heading font-black uppercase tracking-tighter border-b-2 border-border pb-4/g, "font-semibold text-xl tracking-tight border-b border-border pb-4");
  code = code.replace(/font-heading uppercase tracking-widest text-lg/g, "font-semibold text-lg");
  code = code.replace(/brutalist-input/g, "");
  code = code.replace(/brutalist-button/g, "");
  code = code.replace(/bg-muted\/10 border-primary/g, "bg-muted/30 border-muted");
  code = code.replace(/rounded-none/g, "rounded-md");
  code = code.replace(/border-2/g, "border");
  
  // Specific tweaks
  code = code.replace(/<SelectTrigger className=" h-12 bg-background uppercase font-bold tracking-widest px-4">/g, '<SelectTrigger className="h-10 bg-background px-4">');
  code = code.replace(/className="w-full h-16 text-xl  bg-primary text-primary-foreground hover:bg-primary\/90 rounded-md group"/g, 'className="w-full"');
  code = code.replace(/className="flex-\[2\] h-14  bg-primary text-primary-foreground hover:bg-primary\/90 rounded-md group"/g, 'className="flex-[2]"');
  code = code.replace(/className="flex-1 h-14  bg-background hover:bg-muted rounded-md"/g, 'className="flex-1" variant="outline"');

  fs.writeFileSync(file, code);
});
EOF
node clean_panels.js
rm clean_panels.js
```

- [ ] **Step 2: Commit Ocs, Tester, Logs Panels Update**

```bash
git add apps/web/src/components/OcsPanel.tsx apps/web/src/components/TesterPanel.tsx apps/web/src/components/LogsPanel.tsx
git commit -m "style: clean up ocs, tester, and logs panel designs"
```
