# Elysia Tiku Radix Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Radix Colors (Slate & Blue) system, applying inset shadows and refined typography for a premium SaaS feel.

**Architecture:** Inject Radix CSS variables into `index.css`, map Tailwind theme variables to these Radix scales. Update global component styles (`Card`, `Input`, `Button`) to utilize the new soft borders and inner shadows (`.glass-card`). Apply typographic refinements across all views.

**Tech Stack:** React, Tailwind CSS v4, Lucide React, Shadcn UI.

---

### Task 1: Update Global CSS and Radix Theme

**Files:**
- Modify: `apps/web/src/index.css`

- [ ] **Step 1: Overwrite `index.css` with Radix Colors**

Replace the root variables to use the Radix Slate, Blue, and Red scales (HSL values). Map the Tailwind semantic colors to these new scales. Add the `.glass-card` utility.

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@theme {
  --font-sans: "Inter", "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, monospace;

  /* Map semantic colors */
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
    /* Radix Slate Dark */
    --slate-1: 225 13.0% 5.9%;
    --slate-2: 223 13.8% 9.0%;
    --slate-3: 223 11.4% 13.5%;
    --slate-4: 219 10.3% 16.3%;
    --slate-5: 217 9.7% 19.0%;
    --slate-6: 215 9.4% 22.4%;
    --slate-7: 214 9.1% 27.6%;
    --slate-8: 212 9.1% 37.3%;
    --slate-9: 210 8.5% 42.0%;
    --slate-10: 210 7.8% 46.5%;
    --slate-11: 210 11.8% 65.5%;
    --slate-12: 210 16.7% 93.5%;

    /* Radix Blue Dark */
    --blue-1: 212 35.0% 9.2%;
    --blue-2: 216 50.0% 11.8%;
    --blue-3: 214 59.4% 15.3%;
    --blue-4: 214 65.8% 17.9%;
    --blue-5: 213 71.2% 20.2%;
    --blue-6: 212 77.4% 23.1%;
    --blue-7: 211 85.1% 27.4%;
    --blue-8: 211 89.7% 34.1%;
    --blue-9: 206 100% 50.0%;
    --blue-10: 209 100% 60.6%;
    --blue-11: 210 100% 71.8%;
    --blue-12: 205 100% 93.0%;

    /* Radix Red Dark */
    --red-1: 353 23.1% 7.3%;
    --red-2: 354 30.1% 10.4%;
    --red-3: 353 37.6% 14.8%;
    --red-4: 353 43.1% 18.0%;
    --red-5: 353 47.7% 21.0%;
    --red-6: 353 53.6% 25.0%;
    --red-7: 353 62.1% 31.6%;
    --red-8: 353 73.1% 41.8%;
    --red-9: 358 75.0% 59.0%;
    --red-10: 358 84.8% 65.3%;
    --red-11: 358 100% 75.9%;
    --red-12: 351 100% 93.2%;

    /* Radix Green Dark */
    --green-1: 146 30.0% 6.0%;
    --green-2: 153 31.8% 8.6%;
    --green-3: 154 33.7% 12.1%;
    --green-4: 154 34.8% 14.5%;
    --green-5: 154 35.7% 16.7%;
    --green-6: 154 36.9% 19.7%;
    --green-7: 153 38.8% 24.3%;
    --green-8: 151 40.2% 32.9%;
    --green-9: 151 55.0% 41.5%;
    --green-10: 151 49.3% 46.5%;
    --green-11: 151 65.0% 64.9%;
    --green-12: 144 70.0% 92.5%;

    /* Semantic Mapping */
    --background: var(--slate-1);
    --foreground: var(--slate-12);
    
    --card: var(--slate-2);
    --card-foreground: var(--slate-12);
    
    --popover: var(--slate-2);
    --popover-foreground: var(--slate-12);
    
    --primary: var(--blue-9);
    --primary-foreground: 0 0% 100%;
    
    --secondary: var(--slate-3);
    --secondary-foreground: var(--slate-12);
    
    --muted: var(--slate-3);
    --muted-foreground: var(--slate-11);
    
    --accent: var(--blue-3);
    --accent-foreground: var(--blue-11);
    
    --destructive: var(--red-9);
    --destructive-foreground: 0 0% 100%;
    
    --border: var(--slate-6);
    --input: var(--slate-6);
    --ring: var(--blue-8);
    
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

/* Glass Card Primitive */
.glass-card {
  @apply bg-card text-card-foreground shadow-[inset_0_0_0_1px_hsl(var(--slate-6)),_0_1px_2px_rgba(0,0,0,0.5)] rounded-lg;
}

.glass-panel {
  @apply shadow-[inset_0_0_0_1px_hsl(var(--slate-6))] rounded-md;
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

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/index.css
git commit -m "style(theme): implement radix slate and blue dark color scales"
```

---

### Task 2: Refine UI Components (Card & Button)

**Files:**
- Modify: `apps/web/src/components/ui/card.tsx`
- Modify: `apps/web/src/components/ui/button.tsx`

- [ ] **Step 1: Apply `.glass-card` to Card component**

In `apps/web/src/components/ui/card.tsx`:
Change the Card `cn` class:
```tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass-card",
      className
    )}
    {...props}
  />
))
```

- [ ] **Step 2: Refine Button Component**

In `apps/web/src/components/ui/button.tsx`:
Change `buttonVariants`:
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:bg-[hsl(var(--blue-10))]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-[hsl(var(--red-10))]",
        outline:
          "glass-panel bg-transparent hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

- [ ] **Step 3: Commit changes**
```bash
git add apps/web/src/components/ui/card.tsx apps/web/src/components/ui/button.tsx
git commit -m "style(ui): apply radix primitives to cards and buttons"
```

---

### Task 3: Refine App Layout and Login Panel

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/LoginPanel.tsx`

- [ ] **Step 1: Refine `App.tsx`**

In `apps/web/src/App.tsx`, remove harsh borders and update text colors/active states.

Create a script to apply the replacements:
```javascript
const fs = require('fs');
const file = 'apps/web/src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update Sidebar styling
code = code.replace(/className="w-64 border-r border-border bg-card\/50 flex flex-col"/g, 'className="w-64 shadow-[inset_-1px_0_0_hsl(var(--slate-6))] bg-background flex flex-col"');
code = code.replace(/bg-secondary text-secondary-foreground/g, "bg-accent text-accent-foreground shadow-sm");
code = code.replace(/text-muted-foreground hover:text-foreground hover:bg-secondary\/50/g, "text-muted-foreground hover:text-foreground hover:bg-muted/50");

// Update headers and badges
code = code.replace(/border-b border-border/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))]");
code = code.replace(/bg-green-500/g, "bg-[hsl(var(--green-9))]");
code = code.replace(/text-green-500/g, "text-[hsl(var(--green-9))]");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 2: Refine `LoginPanel.tsx`**

```javascript
const fs = require('fs');
const file = 'apps/web/src/components/LoginPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/border bg-card/g, ""); // Let card handle it
code = code.replace(/border bg-muted/g, "shadow-[inset_0_0_0_1px_hsl(var(--slate-6))] bg-muted");
code = code.replace(/bg-destructive\/10 text-destructive p-3 rounded-md text-sm font-medium border border-destructive\/20/g, "bg-[hsl(var(--red-3))] text-[hsl(var(--red-11))] p-3 rounded-md text-sm font-medium shadow-[inset_0_0_0_1px_hsl(var(--red-6))]");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 3: Commit changes**
```bash
git add apps/web/src/App.tsx apps/web/src/components/LoginPanel.tsx
git commit -m "style(ui): apply radix styling to app layout and login panel"
```

---

### Task 4: Refine Config Panel Typography and Colors

**Files:**
- Modify: `apps/web/src/components/ConfigPanel.tsx`

- [ ] **Step 1: Clean up `ConfigPanel.tsx` text formatting and colors**

```javascript
const fs = require('fs');
const file = 'apps/web/src/components/ConfigPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/border bg-card/g, ""); // Handled by Card
code = code.replace(/border-b border-border bg-muted\/20/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))] rounded-t-lg");
code = code.replace(/font-bold uppercase tracking-widest/g, "font-medium text-[hsl(var(--slate-11))]");
code = code.replace(/uppercase tracking-widest/g, "");
code = code.replace(/text-muted-foreground font-mono text-sm/g, "text-sm");
code = code.replace(/border border-border/g, "glass-panel");
code = code.replace(/bg-destructive\/10 border border-destructive\/20/g, "bg-[hsl(var(--red-3))] shadow-[inset_0_0_0_1px_hsl(var(--red-6))]");
code = code.replace(/text-destructive\/80/g, "text-[hsl(var(--red-11))] opacity-80");
code = code.replace(/text-destructive/g, "text-[hsl(var(--red-11))]");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 2: Commit changes**
```bash
git add apps/web/src/components/ConfigPanel.tsx
git commit -m "style(ui): apply typography and radix colors to config panel"
```

---

### Task 5: Refine Remaining Panels

**Files:**
- Modify: `apps/web/src/components/OcsPanel.tsx`
- Modify: `apps/web/src/components/TesterPanel.tsx`
- Modify: `apps/web/src/components/LogsPanel.tsx`

- [ ] **Step 1: Clean up `OcsPanel.tsx`**

```javascript
const fs = require('fs');
const file = 'apps/web/src/components/OcsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/border bg-card overflow-hidden/g, "overflow-hidden");
code = code.replace(/border-b border-border bg-muted\/20/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))]");
code = code.replace(/border-b border-border/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))]");
code = code.replace(/border border-border/g, "glass-panel");
code = code.replace(/bg-muted\/30 border-muted/g, "bg-[hsl(var(--slate-2))] glass-panel");
code = code.replace(/border-b border-primary bg-primary text-primary-foreground/g, "bg-[hsl(var(--blue-3))] shadow-[inset_0_-1px_0_hsl(var(--blue-6))] text-[hsl(var(--blue-11))]");
code = code.replace(/font-bold uppercase tracking-widest/g, "font-medium text-[hsl(var(--slate-11))]");
code = code.replace(/uppercase tracking-widest/g, "");
code = code.replace(/border border-primary bg-primary\/10/g, "shadow-[inset_0_0_0_1px_hsl(var(--blue-6))] bg-[hsl(var(--blue-3))]");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 2: Clean up `TesterPanel.tsx`**

```javascript
const fs = require('fs');
const file = 'apps/web/src/components/TesterPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/border bg-card/g, "");
code = code.replace(/border-b border-border bg-muted\/20/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))] rounded-t-lg");
code = code.replace(/border-b border-border/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))]");
code = code.replace(/border border-border/g, "glass-panel");
code = code.replace(/font-bold uppercase tracking-widest/g, "font-medium");
code = code.replace(/uppercase tracking-widest/g, "");
code = code.replace(/bg-secondary\/10 border-secondary shadow-\[8px_8px_0_0_hsl\(var\(--secondary\)\)\]/g, "bg-[hsl(var(--green-3))] shadow-[inset_0_0_0_1px_hsl(var(--green-6))] rounded-md");
code = code.replace(/bg-secondary text-secondary-foreground border-secondary/g, "text-[hsl(var(--green-11))] border-b border-[hsl(var(--green-6))] bg-[hsl(var(--green-4))]");
code = code.replace(/bg-destructive\/10 border-destructive shadow-\[8px_8px_0_0_hsl\(var\(--destructive\)\)\]/g, "bg-[hsl(var(--red-3))] shadow-[inset_0_0_0_1px_hsl(var(--red-6))] rounded-md");
code = code.replace(/bg-destructive text-destructive-foreground border-destructive/g, "text-[hsl(var(--red-11))] border-b border-[hsl(var(--red-6))] bg-[hsl(var(--red-4))]");
code = code.replace(/border-4/g, "");
code = code.replace(/border-b-4/g, "");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 3: Clean up `LogsPanel.tsx`**

```javascript
const fs = require('fs');
const file = 'apps/web/src/components/LogsPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/border bg-card/g, "");
code = code.replace(/border-b border-border bg-muted\/20/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))] bg-[hsl(var(--slate-2))] rounded-t-lg");
code = code.replace(/border border-border/g, "glass-panel");
code = code.replace(/border-b border-border/g, "shadow-[inset_0_-1px_0_hsl(var(--slate-6))]");
code = code.replace(/bg-destructive\/10 text-destructive border border-destructive shadow-\[4px_4px_0_0_hsl\(var\(--destructive\)\)\]/g, "bg-[hsl(var(--red-3))] text-[hsl(var(--red-11))] shadow-[inset_0_0_0_1px_hsl(var(--red-6))] rounded-md");
code = code.replace(/font-bold uppercase tracking-widest/g, "font-medium text-[hsl(var(--slate-11))]");
code = code.replace(/uppercase tracking-widest/g, "");
code = code.replace(/uppercase tracking-wide/g, "");
code = code.replace(/hover:border-primary shadow-sm hover:shadow-\[4px_4px_0_0_hsl\(var\(--primary\)\)\]/g, "hover:bg-[hsl(var(--slate-3))] rounded-md");
code = code.replace(/border border-primary bg-primary\/10/g, "shadow-[inset_0_0_0_1px_hsl(var(--blue-6))] bg-[hsl(var(--blue-3))] rounded-md");

fs.writeFileSync(file, code);
```
Run `node script.js && rm script.js`

- [ ] **Step 4: Commit changes**
```bash
git add apps/web/src/components/OcsPanel.tsx apps/web/src/components/TesterPanel.tsx apps/web/src/components/LogsPanel.tsx
git commit -m "style(ui): apply radix styling to remaining panels"
```