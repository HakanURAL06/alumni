# 🎨 Design System & UI Specification (`design.md`)

> **Project:** Istanbul University Alumni Tracking System (*İstanbul Üniversitesi Mezun Takip Sistemi*)  
> **Design Framework:** Istanbul University AKSİS & ÖYS Corporate Design Standard &bull; Refero Styles  
> **Version:** 2.1.0 &bull; **Status:** Production Design Reference  
> 🔗 **Related Specifications:** [brand.md](./brand.md) &bull; [README.md](./README.md) &bull; [ddd.md](./ddd.md)

---

## 📑 Table of Contents

1. [Design Philosophy & Core Tenets (İÜ AKSİS & ÖYS Standard)](#1-design-philosophy--core-tenets-iü-aksis--öys-standard)
2. [Design Tokens & Variables (`portal.css`)](#2-design-tokens--variables-portalcss)
   - [2.1 Color Palette & Semantic Roles](#21-color-palette--semantic-roles)
   - [2.2 Typography Hierarchy & Scale](#22-typography-hierarchy--scale)
   - [2.3 Spacing, Grid & Layout Metrics](#23-spacing-grid--layout-metrics)
   - [2.4 Elevation, Shadows & Borders](#24-elevation-shadows--borders)
   - [2.5 Corner Radii & Geometry](#25-corner-radii--geometry)
3. [Page Skeleton & Layout Architecture](#3-page-skeleton--layout-architecture)
   - [3.1 Collapsible Left Sidebar (`#appSidebar`)](#31-collapsible-left-sidebar-appsidebar)
   - [3.2 White Top Header Bar (`.app-header`)](#32-white-top-header-bar-appheader)
   - [3.3 Cool Light Gray Main Content Canvas (`.app-content-body`)](#33-cool-light-gray-main-content-canvas-appcontentbody)
4. [Component Architecture & Specifications](#4-component-architecture--specifications)
   - [4.1 Dashboard & Quick Access Cards (2-3 Column Grid with Icon Box & Arrow)](#41-dashboard--quick-access-cards-2-3-column-grid-with-icon-box--arrow)
   - [4.2 Profile, Detail & Form Cards with Horizontal Tabs](#42-profile-detail--form-cards-with-horizontal-tabs)
   - [4.3 Form Inputs & 2-Column Responsive Form Grids](#43-form-inputs--2-column-responsive-form-grids)
   - [4.4 Button Hierarchy & Positioning](#44-button-hierarchy--positioning)
   - [4.5 Spacious Data Tables with Row Hover](#45-spacious-data-tables-with-row-hover)
   - [4.6 KPI Metrics & Statistics Tiles](#46-kpi-metrics--statistics-tiles)
   - [4.7 Status Badges & Category Chips](#47-status-badges--category-chips)
5. [Interaction Design & Micro-Animations](#5-interaction-design--micro-animations)
6. [Responsive Breakpoints & Layout Adaptability](#6-responsive-breakpoints--layout-adaptability)
7. [Accessibility (a11y) & Performance Guidelines](#7-accessibility-a11y--performance-guidelines)
8. [Complete Page-by-Page Design Specification (All 18 Front-End Screens)](#8-complete-page-by-page-design-specification-all-18-front-end-screens)

---

## 1. Design Philosophy & Core Tenets (İÜ AKSİS & ÖYS Standard)

The design system of the **Istanbul University Alumni Tracking System** is modeled directly on the corporate, clean, and modern aesthetic of Istanbul University's primary digital portals: **AKSİS (Akademik Kayıt Sistemi)** and **ÖYS (Öğretim Yönetim Sistemi)**.

```
+-----------------------------------------------------------------------------------------+
|                                    APP TOP HEADER                                       |
|  [=] Page Title / Breadcrumb                            Status • Role Avatar • Logout   |
+-------------------+---------------------------------------------------------------------+
|                   |                                                                     |
|   SIDEBAR         |                      MAIN CONTENT CANVAS                            |
|   (#FFFFFF)       |                      (#F4F6F9)                                      |
|                   |                                                                     |
|   [IU Logo]       |   +-------------------------------------------------------------+   |
|   İSTANBUL ÜNİV.  |   | WHITE CARD (#FFFFFF)                                        |   |
|   Mezun Takip     |   | [Icon Box] Title .................................... [ > ] |   |
|                   |   +-------------------------------------------------------------+   |
|   - Ana Sayfa     |                                                                     |
|   - Mezunlar      |   +-------------------------------------------------------------+   |
|   - Duyurular     |   | [Tab 1 | Tab 2 | Tab 3]                                     |   |
|   - İş İlanları   |   | [Input (#F5F7FA)]     [Input (#F5F7FA)]                     |   |
|   - Başvurular    |   |                                        [İptal]  [KAYDET]    |   |
|   - Yönetim       |   +-------------------------------------------------------------+   |
|                   |                                                                     |
+-------------------+---------------------------------------------------------------------+
```

### The Three Foundational Pillars

1. **Corporate Institutional Clarity (İÜ AKSİS / ÖYS Aesthetic):**
   - High-contrast typography, generous negative space, crisp white cards on a cool light gray background (`#F4F6F9`), and the official Istanbul University seal emblem (`/images/iu-logo.svg`) reflecting the university's **1453 heritage**.
2. **Predictable Visual Hierarchy & Ergonomics:**
   - Fixed, collapsible vertical sidebar navigation on the left (`#FFFFFF`, thin right border `#E5E7EB`).
   - Clean top utility header bar with page title on the left and member role pill/quick actions on the right.
   - Structured 2-column input forms on soft gray backgrounds (`#F5F7FA`) and standardized button hierarchy (primary corporate blue, secondary outline, danger red) right-aligned with consistent spacing.
3. **Zero-Dependency Resilience & Accessibility:**
   - 100% self-contained vanilla CSS architecture (`public/css/portal.css`) with zero third-party CDN or font dependencies, ensuring flawless offline execution, instant rendering in containerized environments, and full WCAG AA contrast compliance.

---

## 2. Design Tokens & Variables (`portal.css`)

All visual tokens are centralized as CSS custom properties in `:root` within [`public/css/portal.css`](./public/css/portal.css):

### 2.1 Color Palette & Semantic Roles

```css
:root {
  /* -------------------------------------------------------------------------
   * 1. PRIMARY CORPORATE BRAND (Istanbul University AKSİS / ÖYS Blue)
   * ------------------------------------------------------------------------- */
  --iu-accent-blue:       #1D8CF8; /* Primary corporate action & active nav */
  --iu-accent-blue-hover: #0F7AE5; /* Interactive hover state */
  --iu-accent-blue-light: #EBF5FF; /* Active tab/nav soft blue tint */
  --iu-accent-blue-border:#B9DCFE; /* Accent border */

  /* -------------------------------------------------------------------------
   * 2. NEUTRAL CANVAS & CARD SURFACES
   * ------------------------------------------------------------------------- */
  --surface-canvas:       #F4F6F9; /* Cool light gray main content canvas */
  --surface-card:         #FFFFFF; /* Pure white card background */
  --surface-subtle:       #F5F7FA; /* Soft gray form inputs & table headers */
  --surface-hover:        #F8FAFC; /* Table row hover & subtle list states */
  --border-subtle:        #E5E7EB; /* Standard divider, sidebar & header border */
  --border-strong:        #D1D5DB; /* Form input borders & outline button border */

  /* -------------------------------------------------------------------------
   * 3. TYPOGRAPHY & TEXT COLORS
   * ------------------------------------------------------------------------- */
  --text-primary:         #1E293B; /* Dark anthracite headings & key metrics */
  --text-secondary:       #334155; /* Regular body text & descriptions */
  --text-muted:           #64748B; /* Secondary metadata, breadcrumbs, dates */
  --text-light:           #94A3B8; /* Subtle placeholders & tertiary info */

  /* -------------------------------------------------------------------------
   * 4. BALANCED ACCENT & CATEGORY COLORS (Dashboard Cards & Badges)
   * ------------------------------------------------------------------------- */
  --accent-green:         #2E7D32; /* Careers / Success indicator */
  --accent-green-bg:      #E8F5E9;
  --accent-orange:        #F59E0B; /* Announcements / Events / Warning */
  --accent-orange-bg:     #FEF3C7;
  --accent-purple:        #7C3AED; /* Applications / ATS / Academic */
  --accent-purple-bg:     #F3E8FF;
  --accent-navy:          #1E293B; /* Heritage / System Administration */
  --accent-navy-bg:       #F1F5F9;
  --accent-red:           #DC2626; /* Danger / Error / Deletion actions */
  --accent-red-bg:        #FEE2E2;
  --accent-sky:           #0284C7; /* Directory / General Information */
  --accent-sky-bg:        #E0F2FE;
  --accent-coral:         #F88379; /* Mentorship / Student Programs */
  --accent-coral-bg:      #FFF1F0;
}
```

### 2.2 Typography Hierarchy & Scale

The font system uses native high-performance system font stacks:
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
```

| Element / Token | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title (`.page-title`)** | `1.50rem` (24px) | 700 (Bold) | 1.25 | Top header & major card headers |
| **Card Title (`.portal-card-title`)** | `1.15rem` (18.4px) | 700 (Bold) | 1.30 | Section & module card titles |
| **Section Header (`h2`)** | `1.25rem` (20px) | 700 (Bold) | 1.30 | Internal content card subsections |
| **Body Base** | `0.9375rem` (15px) | 400 (Regular) | 1.50 | Standard body copy & descriptions |
| **Form Label (`.form-label`)** | `0.875rem` (14px) | 600 (Semibold) | 1.40 | Form input labels |
| **Button Text (`.btn`)** | `0.875rem` (14px) | 600 (Semibold) | 1.00 | Primary, secondary & danger buttons |
| **Badge / Status Pill** | `0.75rem` (12px) | 700 (Bold) | 1.00 | Role pills, status badges, chips |
| **Code / Route** | `0.8125rem` (13px) | 600 (Semibold) | 1.40 | Endpoint paths, IDs, timestamps |

### 2.3 Spacing, Grid & Layout Metrics

The layout relies on standard 8-point spatial increments:
- **Sidebar Width:** `260px` (desktop default, full-width overlay on mobile)
- **Top Header Height:** `64px`
- **Main Content Max Width:** `1400px` (centered with `padding: 24px`)
- **Spacing Units:**
  - `4px` (`0.25rem`) &bull; Micro-padding (status dots, badge borders)
  - `8px` (`0.50rem`) &bull; Small gap (icon-to-text spacing, chip margins)
  - `12px` (`0.75rem`) &bull; Form input vertical padding, compact table cells
  - `16px` (`1.00rem`) &bull; Base margin, mobile grid gutters
  - `24px` (`1.50rem`) &bull; Card padding, desktop grid gutters
  - `32px` (`2.00rem`) &bull; Inter-card vertical separation

### 2.4 Elevation, Shadows & Borders

Clean, minimal shadow tokens designed for light-mode readability:
```css
--shadow-card:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
--shadow-modal: 0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### 2.5 Corner Radii & Geometry
- `--radius-sm`: `6px` (Badges, small status pills)
- `--radius-md`: `8px` (Form input fields, action buttons)
- `--radius-lg`: `12px` (Cards, banners, panels)
- `--radius-full`: `9999px` (Circular avatars, user identity pills)

---

## 3. Page Skeleton & Layout Architecture

All screens follow a unified layout structure wrapped in `.app-layout`:

```html
<div class="app-layout">
  <!-- 1. Collapsible Left Sidebar -->
  <aside class="app-sidebar" id="appSidebar">
    <div class="sidebar-brand">
      <img src="/images/iu-logo.svg" alt="İÜ Logo" class="sidebar-logo">
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-sub">İSTANBUL ÜNİVERSİTESİ</span>
        <span class="sidebar-brand-title">Mezun Takip Sistemi</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <!-- Role-adaptive vertical navigation links -->
    </nav>
  </aside>

  <!-- 2. Main Wrapper -->
  <div class="app-main-wrapper">
    <!-- Top Header Bar -->
    <header class="app-header">
      <div class="app-header-left">
        <button class="sidebar-toggle-btn" id="sidebarToggleBtn" aria-label="Menüyü Aç/Kapat">☰</button>
        <div class="page-title-wrap">
          <h1 class="page-title">Sayfa Başlığı</h1>
          <span class="page-header-desc">Kısa açıklama</span>
        </div>
      </div>
      <div class="app-header-right">
        <!-- Live status, User Pill, Logout Button -->
      </div>
    </header>

    <!-- 3. Main Content Canvas -->
    <main class="app-content-body">
      <!-- Page Content enclosed in White Cards -->
    </main>
  </div>
</div>
```

### 3.1 Collapsible Left Sidebar (`#appSidebar`)
- **Background & Border:** Pure white (`#FFFFFF`) with a clean right border (`#E5E7EB`).
- **Brand Header:** Official Istanbul University vector emblem (`/images/iu-logo.svg`) paired with "İSTANBUL ÜNİVERSİTESİ" (uppercase bold, 11px) and "Mezun Takip Sistemi" (14px semibold).
- **Navigation Items:** Vertical items with muted gray icons (`#64748B`). When active, items switch to corporate blue text (`#1D8CF8`), soft blue background (`#EBF5FF`), and a 3px solid blue left border indicator.

### 3.2 White Top Header Bar (`.app-header`)
- **Background & Border:** Pure white (`#FFFFFF`) with a subtle bottom border (`#E5E7EB`).
- **Left Section:** Mobile hamburger button (`#sidebarToggleBtn`) followed by the current page title and contextual breadcrumb/subtitle.
- **Right Section:** System status indicator (`● Sistem Aktif`), dynamic user role pill (with icon and name), quick links (`👤 Profilim`, `🛡️ Admin Panel`), and a high-visibility logout button.

### 3.3 Cool Light Gray Main Content Canvas (`.app-content-body`)
- **Canvas Color:** Cool light gray (`#F4F6F9`) providing high contrast against white card components.
- **Card Containers:** All content blocks are wrapped in pure white cards (`#FFFFFF`) with `12px` border radius, subtle border (`#E5E7EB`), and soft drop shadow.

---

## 4. Component Architecture & Specifications

### 4.1 Dashboard & Quick Access Cards (2-3 Column Grid with Icon Box & Arrow)

Used on the homepage, admin panel, and hub views:
- **Layout:** CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` and `20px` gap.
- **Card Structure (`.portal-action-card`):**
  - **Left:** Square colored icon/shortcut box (`48px x 48px`, `8px` border radius) using balanced accent background and text color.
  - **Middle:** Title (`.portal-action-title`, 16px bold) and short descriptive prose (`.portal-action-desc`, 13px muted).
  - **Right:** Subtle rightward navigation arrow (`.portal-action-arrow`, `>` or `→`), animating horizontally on hover (`transform: translateX(4px)`).

### 4.2 Profile, Detail & Form Cards with Horizontal Tabs

Used in [`views/profile.html`](./views/profile.html) and detail views:
- **White Card Enclosure:** White container (`#FFFFFF`) with `12px` border radius and `24px` padding.
- **Horizontal Tabs (`.portal-tabs`):** Positioned along the top border with clear underline style. Active tab receives corporate blue bottom border (`3px solid #1D8CF8`) and bold blue text. Inactive tabs display muted gray text (`#64748B`) with soft hover states.

### 4.3 Form Inputs & 2-Column Responsive Form Grids

- **Input Styling (`.portal-input`, `.form-control`):**
  - Background: Soft light gray (`#F5F7FA`).
  - Border: Subtle gray (`#D1D5DB`), transitioning to corporate blue (`#1D8CF8`) with soft focus ring (`box-shadow: 0 0 0 3px rgba(29, 140, 248, 0.15)`).
  - Corner Radius: `8px`.
  - Padding: `10px 14px`.
- **Form Layout:** 2-column grid (`grid-template-columns: 1fr 1fr`) on desktop, collapsing to single-column on mobile viewports.

### 4.4 Button Hierarchy & Positioning

Standardized visual hierarchy across all views:

| Button Tier | CSS Class | Visual Style | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | `.btn-primary` | Filled corporate blue (`#1D8CF8`), text `#FFFFFF`, hover `#0F7AE5` | Kaydet, Güncelle, Ekle, Giriş Yap, Başvur |
| **Secondary** | `.btn-secondary`, `.btn-outline` | White background, border `#D1D5DB`, text `#334155`, hover `#F8FAFC` | İptal, Geri, Filtreleri Sıfırla, Düzenle |
| **Danger** | `.btn-danger` | Soft red tint (`#FEE2E2`), border `#FECACA`, text `#DC2626` | Sil, Kaydı Sil, Çıkış Yap |

- **Positioning:** Form action buttons are strictly aligned to the **bottom right** of the card with `12px` gap between buttons (`display: flex; justify-content: flex-end; gap: 12px;`).

### 4.5 Spacious Data Tables with Row Hover

- **Table Header (`thead th`):** Soft gray background (`#F8FAFC`), text color `#475569`, 11px uppercase bold, bottom border `#E2E8F0`.
- **Table Cells (`tbody td`):** Spacious padding (`14px 16px`), vertical alignment center, bottom border `#F1F5F9`.
- **Row Hover:** Smooth transition to `#F8FAFC` on hover (`transition: background 0.15s ease`).

### 4.6 KPI Metrics & Statistics Tiles

- **Grid:** 4-column layout (`repeat(auto-fit, minmax(200px, 1fr))`).
- **Structure:** White card with colored left accent border (`4px solid`), large numerical metric (`28px bold #1E293B`), and descriptive sub-label (`13px muted #64748B`).

### 4.7 Status Badges & Category Chips

- **Alumni / Active:** Sky Blue (`#E0F2FE` / `#0369A1`)
- **Careers / Full-Time:** Green (`#E8F5E9` / `#1B5E20`)
- **Announcements / Events:** Amber (`#FEF3C7` / `#92400E`)
- **ATS / In Review:** Purple (`#F3E8FF` / `#6B21A8`)
- **Admin / Rejected:** Red (`#FEE2E2` / `#991B1B`)

---

## 5. Interaction Design & Micro-Animations

- **Sidebar Toggle:** Smooth width transition on desktop collapse and slide-in drawer on mobile (`transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`).
- **Card Hover:** Subtle upward elevation (`transform: translateY(-2px); box-shadow: var(--shadow-hover);`) over `0.2s ease`.
- **Action Arrow:** Arrow icon translates right by `4px` on hover.
- **Status Dot Pulse:** Subtle live heartbeat on the active system indicator (`animation: pulse 2s infinite`).

---

## 6. Responsive Breakpoints & Layout Adaptability

| Breakpoint | Viewport | Sidebar Behavior | Content Layout |
| :--- | :--- | :--- | :--- |
| **Desktop** | `> 1024px` | Fixed 260px vertical menu | 2-3 column cards, 2-column forms |
| **Tablet** | `768px – 1024px` | Collapsible sidebar, toggled via hamburger | 2-column cards, responsive table scroll |
| **Mobile** | `< 768px` | Slide-out overlay drawer | Single-column cards, stacked buttons |

---

## 7. Accessibility (a11y) & Performance Guidelines

1. **High Contrast Ratios:** All body text exceeds WCAG AA (4.5:1), and headings exceed WCAG AAA (7:1).
2. **Keyboard Navigation:** Explicit `:focus-visible` outline rings (`2px solid #1D8CF8`) on all interactive controls.
3. **No External Dependencies:** Zero remote fonts or CDN stylesheets; renders instantly in isolated or air-gapped university intranets.

---

## 8. Complete Page-by-Page Design Specification (All 18 Front-End Screens)

All 18 front-end screens share the identical `.app-layout` shell with `#appSidebar`, `.app-header`, and `.app-content-body`:

| Screen / Route | Template / View | AKSİS Layout & Components |
| :--- | :--- | :--- |
| **Home Portal** (`/`) | [`public/index.html`](./public/index.html) | Left sidebar + top bar + hero card + 4-column KPI strip + 3-column action cards (`.portal-action-card`) with icon box and arrow + live API latency test. |
| **About & Heritage** (`/about`) | [`public/about.html`](./public/about.html) | Left sidebar + top bar + 1453 heritage showcase card + architecture tiles + MVC technology stack overview. |
| **Member Login** (`/login`) | [`views/login.html`](./views/login.html) | Left sidebar + top bar + centered login card + soft gray `#F5F7FA` inputs + primary blue submit + Quick Demo sign-in buttons. |
| **Member Register** (`/register`) | [`views/register.html`](./views/register.html) | Left sidebar + top bar + 3-role selector cards + 2-column registration form on soft gray inputs + right-aligned submit button. |
| **User Profile** (`/profile`, `/me`) | [`views/profile.html`](./views/profile.html) | Left sidebar + top bar + profile hero card + horizontal tabs (Profil, İlanlarım, Başvurularım, Güvenlik, Rol Araçları) + 2-column edit form. |
| **Alumni Directory** (`/users`) | [`views/users.html`](./views/users.html) | Left sidebar + top bar + search toolbar + spacious graduate table with hover + right-aligned enrollment form. |
| **Alumni Detail** (`/users/:id`) | [`views/userDetail.html`](./views/userDetail.html) | Left sidebar + top bar + graduate academic dossier + role-adaptive activity card + right-aligned action buttons. |
| **Alumni Edit** (`/users/:id/edit`) | [`views/userEdit.html`](./views/userEdit.html) | Left sidebar + top bar + 2-column form card with `#F5F7FA` inputs + right-aligned Kaydet / İptal buttons. |
| **Job Postings** (`/jobs`) | [`views/jobs.html`](./views/jobs.html) | Left sidebar + top bar + job filter chips + career table + 2-column job posting card with right-aligned button. |
| **Job Detail** (`/jobs/:id`) | [`views/jobDetail.html`](./views/jobDetail.html) | Left sidebar + top bar + role header card + description box + Quick Apply with Alumni Profile card. |
| **Job Edit** (`/jobs/:id/edit`) | [`views/jobEdit.html`](./views/jobEdit.html) | Left sidebar + top bar + 2-column opportunity editor card + right-aligned Güncelle button. |
| **Announcements** (`/announcements`) | [`views/announcements.html`](./views/announcements.html) | Left sidebar + top bar + category filter chips + bulletin table + publishing form card. |
| **Announcement Detail** (`/announcements/:id`) | [`views/announcementDetail.html`](./views/announcementDetail.html) | Left sidebar + top bar + editorial article card + author metadata + right-aligned edit/delete buttons. |
| **Announcement Edit** (`/announcements/:id/edit`) | [`views/announcementEdit.html`](./views/announcementEdit.html) | Left sidebar + top bar + pre-filled bulletin editor + right-aligned save button. |
| **Applications ATS** (`/applications`) | [`views/applications.html`](./views/applications.html) | Left sidebar + top bar + 4 KPI cards + filter chips + applications table + direct submission form. |
| **Application Detail** (`/applications/:id`) | [`views/applicationDetail.html`](./views/applicationDetail.html) | Left sidebar + top bar + candidate academic dossier + CV button + status update card. |
| **Admin Panel** (`/admin`) | [`views/admin.html`](./views/admin.html) | Left sidebar + top bar + 4 KPI metrics + Fast Direct Data Manipulation console + RBAC governance table. |
| **404 / 5xx Guardian** (`/404`) | [`views/404.html`](./views/404.html) | Left sidebar + top bar + diagnostic card + incident telemetry + safe navigation pills. |

---

*This document is the authoritative visual design and UI/UX specification for the Istanbul University Alumni Tracking System.*
