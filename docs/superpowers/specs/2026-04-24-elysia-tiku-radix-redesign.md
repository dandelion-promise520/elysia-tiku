# Elysia Tiku 管理面板前端 Radix 高级质感重构设计

## 1. 概述
当前界面虽然已转为纯黑白单色 (Monochrome Vercel) 风格并进行了汉化，但由于仅使用了粗线条 (`1px solid #333`) 和纯黑 (`#000`) 的暴力对比，整体界面依然显得生硬且缺乏层次感，达不到真正 Radix 风格中那种精致、顺滑的现代 SaaS 质感。本次设计目标是引入 Radix Colors (Slate & Blue 配色方案) 的 1-12 级色阶系统，并利用内阴影 (Inset Shadow)、柔和边框和细致的排版来重构界面。

## 2. 视觉语言与颜色系统 (Radix 1-12 Scale)
全面弃用基于 HSL 基础调整的生硬黑白色，改用 Radix Colors (Slate、Blue、Red、Green 等)。由于我们在使用 Tailwind CSS v4，我们将直接把这些色值定义到主题变量中。

### 2.1 颜色映射 (Slate & Blue)
*   **基础背景 (Background):** `slate-1` (`#0f1115`)
*   **应用/卡片背景 (Card/Popover):** `slate-2` (`#15171c`) 或 `slate-3` (`#1d1f24`)
*   **悬停状态 (Hover/Muted):** `slate-4` (`#23262b`) / `slate-5` (`#2a2d33`)
*   **边框 (Borders/Ring):** `slate-6` (`#31353b`) / `slate-7` (`#3e434a`)
*   **主色调 (Primary/Blue):** 
    *   按钮背景: `blue-9` (`#0090ff`)
    *   按钮悬停: `blue-10` (`#0b9aff`)
    *   侧边栏/选中项背景: `blue-3` (`#0f2e4a`)
    *   侧边栏/选中项文字: `blue-11` (`#5eb1ff`)
*   **危险/错误色 (Destructive/Red):**
    *   错误背景: `red-3` (`#3c1618`)
    *   错误边框: `red-6` (`#671e22`)
    *   错误文字: `red-11` (`#ff9592`)
    *   删除按钮: `red-9` (`#e5484d`)
*   **文字 (Typography):**
    *   主标题/高对比度: `slate-12` (`#edecee`)
    *   正文/副标题/弱化: `slate-11` (`#b5b3b7`)

### 2.2 质感与光影 (Primitives)
*   **卡片质感 (Cards):** 移除所有外部的实线边框（不再使用 `border-border`）。改用轻微的背景色 (`slate-2`) 配合精细的内边框阴影（Ring Shadow），例如 `box-shadow: inset 0 0 0 1px var(--slate-6), 0 1px 2px 0 rgba(0,0,0,0.5)`，创造出柔和浮起的“玻璃质感”。
*   **圆角 (Border Radius):** 统一全局的交互元素和卡片圆角为 `0.5rem` (8px) 或 `0.375rem` (6px)，彻底抛弃原本工业风的锐角 (`rounded-none`)。
*   **过渡动画 (Transitions):** 对所有背景色、文字颜色和边框色的变化添加 `150ms` 的 `ease-in-out` 过渡，使交互更加温润。

## 3. 排版细节优化 (Typography)
*   **字重与间距：**
    *   移除界面中残留的大量粗暴的大写 (`uppercase`) 和超宽字间距 (`tracking-widest`) 样式，这些在原有的工业风中适用，但在现代 SaaS 中显得杂乱。
    *   标签和副标题使用 `text-sm font-medium text-slate-11`。
    *   主标题使用 `text-xl font-semibold tracking-tight text-slate-12`。
*   **字体系列：** 继续保持全局使用 `Inter` 或 `Geist` (sans-serif)，并在展示代码、日志或 ID 时克制地使用 `Space Mono` (monospace)。

## 4. 组件级调整策略
*   **侧边栏 (Sidebar):** 
    *   背景色调整为 `slate-1` 或微弱透明的黑色。
    *   右侧边框使用极细的 `slate-6` 或渐变线。
    *   导航项激活状态使用 `blue-3` 背景配合 `blue-11` 文字。未激活状态使用 `slate-11`。
*   **按钮 (Buttons):**
    *   主按钮从纯白变更为 Radix 的主色 `blue-9`。文字为纯白或浅蓝。
    *   次级/幽灵按钮取消边框，悬停时显示 `slate-4` 背景。
*   **输入框 (Inputs):**
    *   背景色使用 `slate-2` 或透明。
    *   边框使用 `slate-6`。
    *   聚焦 (Focus) 时发光圈使用主色 `blue-8` 或 `blue-9` 的光晕，而不是原先的纯白硬线。
*   **代码区/预格式化 (Pre/Code):**
    *   背景色深邃化，使用近乎黑色的 `slate-1`。
    *   字体颜色使用 `slate-11` 混合局部的高亮色。

## 5. 实施步骤
1.  修改 `index.css`，注入 Radix Colors (Slate, Blue, Red, Green) 对应的 HEX/HSL 变量，并重新映射 Tailwind v4 的 theme 变量。
2.  更新 Tailwind 的 `boxShadow` 配置（如果需要）以支持新的内发光质感。
3.  全局扫描并清理 `App.tsx` 及 `src/components/` 下所有组件中残留的破坏排版的实用类（如 `uppercase`, `tracking-widest`, `border-2`, 生硬的 `bg-muted` 等）。
4.  应用新的 Radix 颜色类、内边框阴影类、以及调整过的字体粗细和颜色类。
