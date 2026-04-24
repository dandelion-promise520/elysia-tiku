# Elysia Tiku Admin Console Redesign

## 1. Overview
The current Elysia Tiku admin console employs a brutalist, industrial aesthetic with high-contrast colors, sharp edges, and aggressive typography. The goal of this redesign is to transition the interface to a clean, modern "Vercel/Linear" style. This new style prioritizes minimalism, readability, and a premium SaaS feel through a pure monochrome palette, subtle borders, and a sidebar navigation structure.

## 2. Visual Language & Styling
*   **Aesthetic:** Vercel/Linear style. Maximum contrast, minimalism, and focus on content.
*   **Color Palette:** Pure Monochrome.
    *   Background: Pure black (`#000000`).
    *   Cards/Surfaces: Very dark gray (`#111111` or `#0a0a0a`).
    *   Borders: Subtle dark gray (`#333333`).
    *   Primary Text: White (`#ffffff`).
    *   Secondary Text: Light gray (`#a1a1aa` or similar).
    *   Primary Actions (Buttons): Solid white background with black text.
*   **Typography:**
    *   UI/Body: Clean sans-serif (Inter, Geist, or system-ui) replacing the aggressive uppercase Bricolage Grotesque.
    *   Code/Data: Monospace (Space Mono) retained strictly for logs, code snippets, and system status indicators.
*   **Components:**
    *   Transition from sharp, heavy brutalist shadows to clean, flat designs with slight rounding (`rounded-md` or `rounded-lg`).
    *   Subtle hover states (e.g., slight background lightness increase) rather than aggressive translation/shadow changes.

## 3. Layout Structure
*   **Global Layout:** Move from a top-tab layout to a persistent **Left Sidebar** layout.
*   **Left Sidebar:**
    *   **Header:** Sleek, understated "ELYSIA TIKU" branding.
    *   **Navigation Links:** Config, OCS Gen, Debug Test, Sys Logs. Active states indicated by a subtle white background tint (`bg-white/10`) and white text.
    *   **Footer:** System status indicator (Online/Offline), memory usage, and context model info, previously in the top industrial banner.
*   **Main Content Area:**
    *   A spacious right-hand area containing the active view.
    *   A clean header indicating the current page title and optional breadcrumbs.
    *   Content organized into Vercel-style cards with `1px` borders and no drop shadows.

## 4. Page Level Updates
*   **Login Screen:** Replaced the brutalist warning box with a clean, centered modal. Simple borders, minimalist inputs, and a standard white "Login" button.
*   **Config Panel:** Group settings into clean cards. Use minimalist input fields with subtle focus rings (white or gray, not orange).
*   **OCS / Tester / Logs Panels:** Restyle tables, inputs, and text areas to match the new flat, dark-mode aesthetic. Remove brutalist accents from the terminal/logs view, focusing purely on legibility.
*   **Toasts:** Update the `sonner` toast configuration to use the new monochrome, flat style with subtle borders, removing the brutalist styling.

## 5. Implementation Strategy
*   **CSS Update:** Rewrite `index.css` to replace the brutalist variables and utility classes (`.brutalist-card`, `.brutalist-button`) with the new monochrome palette and standard Tailwind utility classes.
*   **App.tsx Update:** Refactor the main layout from `Tabs` to a Flex/Grid layout with a sidebar (`<aside>`) and main content area (`<main>`).
*   **Component Updates:** Iterate through `ConfigPanel`, `LoginPanel`, `OcsPanel`, `TesterPanel`, and `LogsPanel` to remove brutalist classes and apply the new clean styles. Update Shadcn UI components if necessary to ensure they use the new border radius and color variables.
