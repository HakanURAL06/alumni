# 🎨 Design System & UI Specification (`design.md`)

> **Project:** Istanbul University Alumni Tracking System (*İstanbul Üniversitesi Mezun Takip Sistemi*)  
> **Design Framework:** Refero Styles & Awesome-Design-MD Standard (`DESIGN.md`)  
> **Version:** 2.0.0 &bull; **Status:** Production Design Reference  
> 🔗 **Related Specifications:** [brand.md](./brand.md) &bull; [README.md](./README.md) &bull; [ddd.md](./ddd.md)

---

## 📑 Table of Contents

1. [Design Philosophy & Core Tenets](#1-design-philosophy--core-tenets)
2. [Design Tokens & Variables](#2-design-tokens--variables)
   - [2.1 Color Palette & Semantic Roles](#21-color-palette--semantic-roles)
   - [2.2 Typography Hierarchy & Scale](#22-typography-hierarchy--scale)
   - [2.3 Spacing, Grid & Layout Metrics](#23-spacing-grid--layout-metrics)
   - [2.4 Elevation, Shadows & Borders](#24-elevation-shadows--borders)
   - [2.5 Corner Radii & Geometry](#25-corner-radii--geometry)
3. [Component Architecture & Specifications](#3-component-architecture--specifications)
   - [3.1 Top Utility & Navigation Header](#31-top-utility--navigation-header)
   - [3.2 Hero Showcase & Live KPI Bar](#32-hero-showcase--live-kpi-bar)
   - [3.3 Interactive Quick Search & Filter Bar](#33-interactive-quick-search--filter-bar)
   - [3.4 Core Module Grid Cards](#34-core-module-grid-cards)
   - [3.5 Architecture & Guardian Observability Banner](#35-architecture--guardian-observability-banner)
   - [3.6 Developer & REST API Playground](#36-developer--rest-api-playground)
   - [3.7 Multi-Column Enterprise Footer](#37-multi-column-enterprise-footer)
4. [Interaction Design & Micro-Animations](#4-interaction-design--micro-animations)
5. [Responsive Breakpoints & Layout Adaptability](#5-responsive-breakpoints--layout-adaptability)
6. [Accessibility (a11y) & Performance Guidelines](#6-accessibility-a11y--performance-guidelines)
7. [Refero & Awesome-Design-MD Best Practices: Do's & Don'ts](#7-refero--awesome-design-md-best-practices-dos--donts)

---

## 1. Design Philosophy & Core Tenets

Following the design system paradigms captured in **[Refero Styles](https://refero.design)** and **[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)**, this design system establishes a high-craft, scalable visual language for the Istanbul University Alumni Tracking System.

### The Three Foundational Pillars

1. **Academic Prestige Meets Modern SaaS Elegance:**
   - Honors Istanbul University’s **1453 heritage** through dignified deep navy, ceremonial golden amber, and refined academic iconography, balanced with the clean ergonomics of top-tier developer platforms (Linear, Stripe, Vercel).
2. **Information Clarity & Zero Cognitive Friction:**
   - High data-ink ratio. Core actions (Directory, Career Postings, Announcements, Candidate ATS) are immediately distinguishable with distinct semantic color badges, readable type scales, and predictable spatial grouping.
3. **Enterprise Resilience & Self-Sufficiency:**
   - Self-contained, zero-dependency CSS and vanillajs implementation. Functions completely offline without reliance on brittle external CDN font files or third-party asset hosts, ensuring maximum reliability within Docker, air-gapped campuses, or automated test pipelines.

---

## 2. Design Tokens & Variables

All visual rules are defined as standard CSS Custom Properties (`:root`) for instant customization, dark/light contrast parity, and deterministic rendering.

### 2.1 Color Palette & Semantic Roles

```css
:root {
  /* Brand Primitives (Istanbul University Heritage) */
  --iu-navy-950:    #020617; /* Deepest Obsidian Slate */
  --iu-navy-900:    #0f172a; /* Core Brand Navy / Header Background */
  --iu-navy-800:    #1e293b; /* Hero Gradient & Elevated Dark Surfaces */
  --iu-navy-700:    #334155; /* Secondary Text on Light Backgrounds */
  --iu-cobalt-600:  #2563eb; /* Bosphorus Cobalt - Primary Brand Action */
  --iu-cobalt-500:  #3b82f6; /* Vibrant Interactive Blue / Hover States */
  --iu-cobalt-400:  #60a5fa; /* Hero Gradient Accent & Badges */
  --iu-gold-600:    #d97706; /* IU Seal Amber - Announcements & Honor */
  --iu-gold-500:    #f59e0b; /* Amber Accent */
  --iu-gold-50:     #fffbeb; /* Amber Soft Tint */
  --iu-emerald-600: #059669; /* Career / Job Board Primary */
  --iu-emerald-500: #10b981; /* Success Indicator & Live Status */
  --iu-emerald-50:  #ecfdf5; /* Emerald Soft Tint */
  --iu-purple-600:  #7c3aed; /* ATS / Applications Primary */
  --iu-purple-500:  #a855f7; /* Purple Accent */
  --iu-purple-50:   #faf5ff; /* Purple Soft Tint */
  --iu-rose-600:    #e11d48; /* Guardian / Error Alert Accent */
  --iu-rose-50:     #fff1f2; /* Rose Soft Tint */

  /* Neutral Surface & Border Tokens */
  --surface-canvas:  #f8fafc; /* Neutral Page Background */
  --surface-card:    #ffffff; /* Card Background */
  --surface-subtle:  #f1f5f9; /* Subtle Controls & Code Snippets */
  --border-subtle:   #e2e8f0; /* Default Card & Table Borders */
  --border-strong:   #cbd5e1; /* Hover State Borders */
  --text-primary:    #0f172a; /* High-contrast Headings & Body */
  --text-secondary:  #475569; /* Descriptive Prose */
  --text-muted:      #94a3b8; /* Placeholders, Dates, Micro-copy */
}
```

### 2.2 Typography Hierarchy & Scale

The type system relies on native high-performance system font stacks:
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
```

| Token / Element | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `2.85rem` (45.6px) | 850 (Black) | 1.15 | `-0.035em` | Homepage Hero Title |
| **Section Title**| `1.85rem` (29.6px) | 800 (Extrabold) | 1.25 | `-0.025em` | Major Section Headings |
| **Card Title**   | `1.25rem` (20.0px) | 750 (Bold) | 1.30 | `-0.015em` | Feature & Module Card Titles |
| **Body Large**   | `1.12rem` (18.0px) | 400 (Regular) | 1.65 | `normal` | Hero Descriptions |
| **Body Base**    | `0.94rem` (15.0px) | 400 / 500 | 1.55 | `normal` | General Paragraphs & Card Text |
| **UI Button**    | `0.90rem` (14.4px) | 600 (Semibold)| 1.00 | `0.01em` | Buttons & Primary Links |
| **Badge / Tag**  | `0.78rem` (12.5px) | 700 (Bold) | 1.00 | `0.04em` | Category Chips, Status Pills |
| **Code / Route** | `0.84rem` (13.4px) | 600 (Semibold)| 1.40 | `normal` | Terminal commands, API routes |

### 2.3 Spacing, Grid & Layout Metrics

Built on an 8-point spatial grid rhythm (with 4px half-steps for micro-alignments):
- **Maximum Page Container Width:** `1140px` (centered with `margin: 0 auto; padding: 0 24px;`)
- **Spacing Steps:**
  - `4px` (`0.25rem`) &bull; Micro-padding (badge borders, status dot gaps)
  - `8px` (`0.50rem`) &bull; Small gap (button icons, list items)
  - `12px` (`0.75rem`) &bull; Input padding, compact chip spacing
  - `16px` (`1.00rem`) &bull; Base margin, grid gaps on mobile
  - `24px` (`1.50rem`) &bull; Card padding, desktop grid gaps
  - `32px` (`2.00rem`) &bull; Section bottom margins, hero action gaps
  - `48px` (`3.00rem`) &bull; Inter-section vertical rhythm
  - `64px` (`4.00rem`) &bull; Hero padding, major landmark spacing

### 2.4 Elevation, Shadows & Borders

Layered box-shadow tokens provide realistic physical depth without muddying dark themes:
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
--shadow-glow-blue: 0 0 20px rgba(37, 99, 235, 0.25);
```

### 2.5 Corner Radii & Geometry
- `--radius-sm`: `6px` (Buttons, badges, terminal headers)
- `--radius-md`: `10px` (Input fields, code blocks, icon bubbles)
- `--radius-lg`: `16px` (Cards, banners, panels)
- `--radius-full`: `9999px` (Pills, circular avatars, status dots)

---

## 3. Component Architecture & Specifications

### 3.1 Top Utility & Navigation Header
- **Top Utility Bar:** Slim dark bar (`background: #020617; font-size: 0.8rem;`) displaying real-time system state (`● Core Services Active`, Express 5 & PostgreSQL 16 badges) and quick access to OpenAPI Swagger.
- **Main Sticky Navigation:** Translucent backdrop blur (`backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.95);`).
  - **Brand Emblem:** 🎓 square icon bubble with a royal gradient (`#3b82f6` to `#1d4ed8`) and bold letterform.
  - **Brand Title:** "Alumni Tracking System" + "İstanbul Üniversitesi".
  - **Navigation Links:** Hover pill states (`rgba(255, 255, 255, 0.08)`) and an eye-catching gradient CTA button for Swagger API documentation.

### 3.2 Hero Showcase & Live KPI Bar
- **Visual Design:** Angular deep-slate gradient (`linear-gradient(140deg, #0b1120 0%, #0f172a 45%, #1e1b4b 100%)`) accented with ambient radial lighting spheres.
- **Eyebrow Badge:** Glassmorphic pill (`✨ Enterprise MVC Architecture • Release v2.0`).
- **Headlines:** High-contrast typography with a 3-stop gradient highlight (`#60a5fa` -> `#38bdf8` -> `#c084fc`).
- **Hero Actions:** Primary high-elevation button (`.btn-primary`) paired with frosted ghost buttons (`.btn-ghost`).
- **Live KPI Counter Bar:** 4-column metric bar showcasing:
  - 🎓 **500+** Registered Alumni
  - 📢 **100%** Verified Announcements
  - 💼 **Active** Career Opportunities
  - 🛡️ **99.9%** Guardian Fault Uptime

### 3.3 Interactive Quick Search & Filter Bar
- **Search Input:** Clean icon-prepended text field (`🔍`) with instant, debounced client-side filtering.
- **Instant Keyword Filtering:** As the user types (e.g. "software", "homecoming", "law"), feature cards smoothly filter in real-time.
- **Quick Jump Filter Chips:** Interactive pills (*Computer Engineering*, *Software Engineering*, *Full-Time*, *Remote*, *Homecoming*, *ATS Reviews*) for single-click category filtering.

### 3.4 Core Module Grid Cards
- **Grid Layout:** CSS Grid with `repeat(auto-fit, minmax(250px, 1fr))` ensuring optimal distribution on widescreen, tablet, and mobile.
- **Accent Top Borders:** 4px gradient border matching the module identity:
  - 👥 **Alumni Directory:** Blue Cobalt (`#3b82f6` to `#1d4ed8`)
  - 📢 **Announcements & News:** Golden Amber (`#f59e0b` to `#d97706`)
  - 💼 **Career & Job Board:** Emerald Green (`#10b981` to `#059669`)
  - 📝 **Applications & ATS:** Royal Purple (`#a855f7` to `#7c3aed`)
- **Card Content:** Icon bubble, descriptive copy, 4-point bulleted capability checklist with green checkmarks, and a dedicated action button.

### 3.5 Architecture & Guardian Observability Banner
- **Dark Surface Card:** Explaining the system’s robust backend safeguards:
  - 🔍 **404 Guardian:** Route typo detection, safe `/404?from=...` redirection, and anti-open-redirect mitigation.
  - 🚨 **5xx Server Guardian:** Automatic `ERR-*` incident tokens, database failover, and production stack protection.
  - 📊 **Dual-Sink Telemetry:** Request logging to terminal and `logs/error.logs`.
  - 🗄️ **Decoupled Persistence:** PostgreSQL 16 + in-memory fallback.

### 3.6 Developer & REST API Playground
- **Live Latency Ping Pill:** Automatically sends an asynchronous heartbeat to `/api/health` and calculates live round-trip latency (e.g. `API Healthy (2ms)`).
- **Interactive Route Matrix:** Grid displaying endpoints with distinct HTTP method badges (`GET /api/users`, `GET /api/jobs`, `GET /api/swagger`).
- **Terminal Emulator Snippet:** Realistic macOS/Linux bash terminal window with traffic-light dots and one-click copy command for curl verification.

### 3.7 Multi-Column Enterprise Footer
- **4-Column Layout:** Brand overview + Tech badges (*Node.js*, *Express 5*, *PostgreSQL 16*, *Docker*), Presentation links, Developer Hub links, and Documentation references.
- **Copyright & System Lineage:** Explicit acknowledgment of Istanbul University’s heritage and Guardian telemetry architecture.

---

## 4. Interaction Design & Micro-Animations

- **Hover Elevations:** Cards translate vertically (`transform: translateY(-4px);`) with accelerated box-shadow depth over `220ms ease`.
- **Button Feedback:** Active button press transitions down by `1px` (`transform: translateY(-1px);`) for tactile feedback.
- **Status Dot Pulse:** Keyframe animation smoothly pulsing opacity and scale on the live service indicator (`animation: pulse-dot 2s infinite ease-in-out`).
- **Focus Rings:** Accessible 3px focus rings (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25)`) on all inputs and interactive links.

---

## 5. Responsive Breakpoints & Layout Adaptability

| Breakpoint | Target Devices | Layout Adaptations |
| :--- | :--- | :--- |
| **Desktop (`> 1024px`)** | High-res monitors, laptops | Full 4-column module grid, side-by-side header nav, 4-column footer |
| **Tablet (`768px – 1024px`)** | iPads, medium tablets | 2-column module grid, compact search input, 2-column footer |
| **Mobile (`< 768px`)** | Smartphones | Single-column cards, stacked hero action buttons, wrapped badges |

---

## 6. Accessibility (a11y) & Performance Guidelines

1. **Color Contrast:** All body text meets or exceeds **WCAG AA (4.5:1)** against backgrounds. Headings and large titles meet **WCAG AAA (7:1)**.
2. **Semantic HTML5:** Native landmark elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) ensure screen-reader clarity.
3. **Zero Cumulative Layout Shift (CLS):** Explicit SVG/icon sizing and CSS grid templates prevent layout jumping during resource loading.
4. **Lightweight Footprint:** Entire homepage HTML and embedded CSS weighs under **45 KB uncompressed**, loading in under **10ms** on local servers.

---

## 7. Refero & Awesome-Design-MD Best Practices: Do's & Don'ts

| Category | ✅ Do | ❌ Don't |
| :--- | :--- | :--- |
| **Typography** | Use a clear, restrained type scale with deliberate line-heights and negative letter-spacing on display headers. | Don't mix multiple incompatible font families or use low-contrast gray text on white backgrounds. |
| **Color Usage** | Reserve vibrant saturated colors (Cobalt, Amber, Emerald, Purple) for interactive elements and category accents. | Don't paint entire page backgrounds with garish bright colors or clash conflicting primary tones. |
| **Spacing** | Maintain consistent 8px spatial increments. Group related information with tighter margins and separate sections generously. | Don't use random arbitrary pixel values (`margin-top: 17px;`) without visual rhythm. |
| **Card Design** | Give cards clear hierarchy: icon badge &bull; title &bull; concise description &bull; capability tags &bull; direct action. | Don't build infinite text walls without visual anchors, dividers, or clear CTAs. |
| **Feedback** | Provide immediate visual states for hover, focus, search filtering, and live API connectivity. | Don't leave interactive buttons without hover feedback or let users wonder if a search input works. |

---

*This document is indexed as the master visual design specification for the Istanbul University Alumni Tracking System. For domain rules, refer to [ddd.md](./ddd.md); for brand purpose, refer to [brand.md](./brand.md).*
