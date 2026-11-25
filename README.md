# 🎓 Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0_Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3000/api/swagger)
[![Architecture](https://img.shields.io/badge/Architecture-MVC_Pattern-blueviolet?style=flat)](#-mvc-model-view-controller-architecture)
[![Data Design](https://img.shields.io/badge/Documentation-DDD_Specification-orange?style=flat)](./ddd.md)
[![Brand & Vision](https://img.shields.io/badge/Brand%20%26%20Vision-Istanbul%20University-c0392b?style=flat)](./brand.md)
[![Design System](https://img.shields.io/badge/Design%20System-Refero%20%26%20Awesome--Design--MD-0284c7?style=flat)](./design.md)

A modular, production-ready alumni tracking and management web application designed for **Istanbul University (İstanbul Üniversitesi)** to organize, search, publish announcements for, and manage university alumni profiles, career opportunities, and applications.

> 📚 **Core Documentation & Architecture Guides:**
> - [**`brand.md`**](./brand.md) — Institutional Brand Identity, 1453 Heritage, Vision, Mission & 5 Community Pillars
> - [**`design.md`**](./design.md) — UI/UX Design System, Refero Styles, Tokens, Grid Metrics & Component Guidelines
> - [**`ddd.md`**](./ddd.md) — Data Design Documentation, Domain Models, Rules (`JP-R1`..`JP-R7`, `APP-R1`..`APP-R6`) & Schemas

---

## 📑 Table of Contents

- [💻 Tech Stack & Languages](#-tech-stack--languages)
- [🏛️ Brand Identity & Mission (Istanbul University)](#brand-identity-mission)
- [🎨 Design System & UI Specification (`design.md`)](#design-system-ui-specification)
- [📚 Data Design & Architecture Documentation (DDD)](#-data-design--architecture-documentation-ddd)
- [🏛️ MVC (Model-View-Controller) Architecture](#️-mvc-model-view-controller-architecture)
  - [1. 🚦 Routing Layer (`routes/`)](#1--routing-layer-routes)
  - [2. ⚙️ Controller Layer (`controllers/`)](#2-️-controller-layer-controllers)
  - [3. 📦 Model Layer (`models/`)](#3--model-layer-models)
  - [4. 🖥️ View Layer (`views/` & Presentation)](#4-️-view-layer-views--presentation)
- [🔐 Authentication, Authorization & Security Architecture](#-authentication-authorization--security-architecture)
- [👤 User-Specific Pages & Personal Workspaces](#-user-specific-pages--personal-workspaces)
- [🛡️ Central Administration Console & Governance](#️-central-administration-console--governance)
- [🛡️ Middleware, Logging & Error Guardian Pipeline (`middleware/`)](#️-middleware-logging--error-guardian-pipeline-middleware)
- [🧠 The Forgetting Test (Data Volatility Demonstration)](#-the-forgetting-test-data-volatility-demonstration)
- [🗄️ Database, Migrations & Seeding Layer](#-database-migrations--seeding-layer)
  - [Environment Variables & Configuration](#environment-variables--configuration)
  - [PostgreSQL Database Migrations (`npm run migrate`)](#postgresql-database-migrations-npm-run-migrate)
  - [Data Factories & Seeding Pattern (`npm run seed`)](#data-factories--seeding-pattern-npm-run-seed)
  - [Centralized Database Connection Pool (`models/db.js`)](#centralized-database-connection-pool-modelsdbjs)
- [📋 Complete Route & API Reference Matrix](#-complete-route--api-reference-matrix)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally with Node.js](#running-locally-with-nodejs)
  - [Running with Docker Compose](#running-with-docker-compose)
- [🧪 Automated Testing Suite](#-automated-testing-suite)
- [📖 API Documentation (Swagger)](#-api-documentation-swagger)
- [📁 Project Directory Tree](#-project-directory-tree)
- [🤖 AI Agent & Developer Contribution Rules](#-ai-agent--developer-contribution-rules)

---

## 💻 Tech Stack & Languages

This application is built with a modern, decoupled JavaScript architecture prepared for relational database persistence:

- **Frontend — HTML5, CSS3, Client-side JavaScript**
  - **Role:** Client-side interface & user interaction.
  - **Specifics:** Dynamic UI rendering, responsive form validations, interactive flash notifications, and asynchronous API communication (`fetch`) for seamless record filtering without full page reloads.

- **Backend — Node.js & Express.js 5 (JavaScript / CommonJS)**
  - **Role:** Server-side application runtime, routing & REST API.
  - **Specifics:** Manages business logic, middleware pipeline, URL parameter sanitization, template rendering, and error handling with complete separation of concerns.

- **Database / Storage — PostgreSQL 16 & Resilient In-Memory Fallback**
  - **Role:** Relational database management system (RDBMS) & domain data store.
  - **Specifics:** Persistent storage powered by PostgreSQL 16 with Docker Named Volume (`pgdata`), centralized connection pooling via `pg.Pool` ([`models/db.js`](./models/db.js)), automated SQL schema migrations (`npm run migrate`), Mock Data Factories (`factories/`), and seeder automation (`npm run seed`), accompanied by a graceful in-memory fallback for isolated testing environments.

---

<a id="brand-identity-mission"></a>
<a id="brand"></a>
## 🏛️ Brand Identity & Mission (Istanbul University)

A dedicated, comprehensive brand vision, institutional mission, and community specification tailored for **Istanbul University (İstanbul Üniversitesi)** is maintained in **[`brand.md`](./brand.md)**:

👉 **[Read the Full Brand Identity & Platform Vision Guide (brand.md)](./brand.md)**

### Key Highlights Covered in `brand.md`:
1. **Institutional Legacy & Heritage:** Grounded in Istanbul University's foundation dating back to 1453, connecting graduates across Computer & Software Engineering, Law, Medicine, Economics, Science, Letters, and all sister faculties.
2. **Vision & Mission Statements:** Formalized strategic objectives for uniting global alumni cohorts, empowering early-career graduates, and facilitating peer-to-peer mentorship.
3. **5 Core Platform Pillars:** Living Alumni Directory (`/users`), Campus Announcements & Homecoming Days (`/announcements`), Career & Job Board (`/jobs`), Candidate Tracking ATS (`/applications`), and Guardian Fault Observability (`/404` & `logs/error.logs`).
4. **Target Audience Personas:** Tailored workflows for recent graduates, senior alumni recruiters, current students seeking internships, and university administrators.
5. **Brand Tone & Visual System:** Prestige, warmth, clarity, and an IU Navy & Bosphorus Cobalt design language.
6. **Complete 14-Screen Page Ecosystem:** Full institutional mapping of every front-end view across the portal ([see Section 10 in `brand.md`](./brand.md#10-complete-front-end-experience--page-ecosystem-14-screens)).

---

<a id="design-system-ui-specification"></a>
<a id="design-system"></a>
<a id="design"></a>
## 🎨 Design System & UI Specification (`design.md`)

A comprehensive, production-grade UI design specification inspired by **[Refero Styles](https://refero.design)** and the **[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** standard is documented in **[`design.md`](./design.md)**:

👉 **[Read the Full Design System Specification (design.md)](./design.md)**

### Key Highlights Covered in `design.md`:
1. **Design Tokens:** Strict CSS variables for Istanbul University Navy (`#0f172a`), Bosphorus Cobalt (`#2563eb`), Golden Amber (`#d97706`), Emerald Green (`#059669`), Royal Purple (`#7c3aed`), Crimson Rose (`#e11d48`), surface canvases, and border tokens.
2. **Typography Scale:** System-font typography hierarchy (`-apple-system`, `Segoe UI`, `Roboto`) with responsive fluid sizing from 2.85rem display heroes to micro-badges.
3. **8-Point Spatial Grid:** Standardized margins, gap metrics, and container geometry (`max-width: 1140px`).
4. **Core Component Standards:** Navigation bar, hero showcase, live KPI bar, debounced search & filter toolbars, core module cards, Guardian observability banner, and terminal cURL simulator.
5. **Micro-Interactions & a11y:** Smooth hover elevations, focus ring accessibility, WCAG AA/AAA color contrast, zero cumulative layout shift (CLS), and completely self-contained offline CSS.
6. **Page-by-Page Specification (All 14 Screens):** Detailed visual, interactive, and SSR layout breakdown for every page in `public/`, `views/`, and `middleware/guardianShared.js` ([see Section 8 in `design.md`](./design.md#8-complete-page-by-page-design-specification-all-14-front-end-screens)).

---

## 📚 Data Design & Architecture Documentation (DDD)

A dedicated, comprehensive data architecture specification is maintained in **[`ddd.md`](./ddd.md)**:

👉 **[Read the Full Data Design Documentation (ddd.md)](./ddd.md)**

### Key Highlights Covered in `ddd.md`:
1. **Domain Entities:** Exact schema definitions, constraints, defaults, and JSON payloads for [`UserModel`](./models/User.js), [`AnnouncementModel`](./models/Announcement.js), [`JobPostingModel`](./models/JobPosting.js), and [`ApplicationModel`](./models/Application.js) ([`applications` action table](./ddd.md#24-application-action-entity)).
2. **Entity-Relationship Diagram (ERD):** Visualized entity models and logical relationships (`users`, `announcements`, `job_postings`, `applications`).
3. **In-Memory Store Architecture & Lifecycle:** Heap allocation, singleton pattern, and concurrency characteristics.
4. **The Forgetting Test Analysis:** Comprehensive technical evaluation of data volatility during container recreation.
5. **Model CRUD Contracts:** TypeScript-style signatures for all data access methods (`create`, `findAll`, `findById`, `update`, `delete`).
6. **MVC Data Flow (Sequence Diagrams):** Visualized lifecycles for RESTful JSON API requests and Server-Side HTML Form submissions.
7. **PostgreSQL Migration Blueprint:** Complete SQL DDL schemas (`CREATE TABLE users`, `CREATE TABLE announcements`, `CREATE TABLE job_postings`, `CREATE TABLE applications`), composite unique index strategies, automated `updated_at` triggers, and Docker Compose persistent volume (`pgdata`) setup.
8. **Validation, Business Rules & Observability Contracts:** Entity validation matrix, formalized domain rules (`JP-R1`–`JP-R7`, `APP-R1`–`APP-R6`, `USR-R1`–`USR-R2`, `ANN-R1`–`ANN-R2`), `/404` generic redirect & 5xx Incident ID error contract, and `logs/error.logs` audit persistence rules.
9. **AI Agent Query & Reference Matrix:** Rapid lookup table mapping domain CRUD actions, generic `/404` handling, and health endpoints to routes, controllers, views, and models.

---

## 🏛️ MVC (Model-View-Controller) Architecture

The application strictly implements the **Model-View-Controller (MVC)** design pattern, augmented by dedicated Routing and View Engine layers:

```mermaid
flowchart TD
    Client["Client (Browser / Postman / cURL)"]

    subgraph Middleware ["Middleware & Observability Pipeline (middleware/)"]
        ReqLogger["Request Logger (middleware/logger.js)"]
        NotFoundGuard["404 Guardian Middleware (middleware/notFoundGuardian.js)"]
        ServerGuard["5xx Server Guardian (middleware/serverErrorGuardian.js)"]
        LogWriter["Dual Log Writer (middleware/logWriter.js)"]
        ErrorLogFile[("logs/error.logs")]
    end

    subgraph Routing ["Routing Layer (routes/)"]
        AppIndex["Express App (index.js)"]
        UserRouter["user Router (routes/user.js)"]
        ApiUserRouter["apiUser Router (routes/apiUser.js)"]
        AnnounceRouter["announcement Router (routes/announcement.js)"]
        ApiAnnounceRouter["apiAnnouncement Router (routes/apiAnnouncement.js)"]
        JobRouter["jobPosting Router (routes/jobPosting.js)"]
        ApiJobRouter["apiJobPosting Router (routes/apiJobPosting.js)"]
        AppRouter["application Router (routes/application.js)"]
        ApiAppRouter["apiApplication Router (routes/apiApplication.js)"]
        Generic404Route["Generic 404 Route (/404, /404.html)"]
    end

    subgraph Controller ["Controller Layer (controllers/)"]
        UserCtrl["UserController (Web / View Layer)"]
        ApiUserCtrl["ApiUserController (RESTful JSON API)"]
        AnnounceCtrl["AnnouncementController (Management Interface)"]
        ApiAnnounceCtrl["ApiAnnouncementController (RESTful JSON API)"]
        JobCtrl["JobPostingController (Web View)"]
        ApiJobCtrl["ApiJobPostingController (RESTful JSON API)"]
        AppCtrl["ApplicationController (Web View)"]
        ApiAppCtrl["ApiApplicationController (RESTful JSON API)"]
        UtilHandlers["Utility Handlers (/api/health, /hello, /sum)"]
    end

    subgraph Model ["Model Layer (models/)"]
        UserModel["UserModel (models/User.js)"]
        AnnounceModel["AnnouncementModel (models/Announcement.js)"]
        JobPostingModel["JobPostingModel (models/JobPosting.js)"]
        AppModel["ApplicationModel (models/Application.js)"]
        DBPool["Database Connection Pool (models/db.js - pg.Pool)"]
        PostgresDB[("PostgreSQL 16 (Docker pgdata Volume)")]
        MemoryStore[("In-Memory Mock Store (Fallback)")]
    end

    subgraph View ["View Layer (Presentation)"]
        UserViews["User Views (views/users.html, detail, edit)"]
        AnnounceViews["Announcement Views (views/announcements.html, detail, edit)"]
        JobViews["Job Views (views/jobs.html, jobDetail.html, jobEdit.html)"]
        AppViews["Application Views (views/applications.html, applicationDetail.html)"]
        NotFoundView["NotFoundView (views/404.html)"]
        SwaggerView["Interactive Swagger UI (/api/swagger)"]
        JSONView["JSON API Responses (application/json)"]
    end

    Client -->|"HTTP Request"| ReqLogger
    ReqLogger --> AppIndex
    ReqLogger --> LogWriter
    AppIndex --> UserRouter
    AppIndex --> ApiUserRouter
    AppIndex --> AnnounceRouter
    AppIndex --> ApiAnnounceRouter
    AppIndex --> JobRouter
    AppIndex --> ApiJobRouter
    AppIndex --> AppRouter
    AppIndex --> ApiAppRouter
    AppIndex --> UtilHandlers
    AppIndex --> Generic404Route
    AppIndex -.->|"Unmatched Route"| NotFoundGuard
    UserRouter --> UserCtrl
    ApiUserRouter --> ApiUserCtrl
    AnnounceRouter --> AnnounceCtrl
    ApiAnnounceRouter --> ApiAnnounceCtrl
    JobRouter --> JobCtrl
    ApiJobRouter --> ApiJobCtrl
    AppRouter --> AppCtrl
    ApiAppRouter --> ApiAppCtrl
    UserCtrl -->|"Async CRUD"| UserModel
    ApiUserCtrl -->|"Async CRUD"| UserModel
    AnnounceCtrl -->|"Async CRUD"| AnnounceModel
    ApiAnnounceCtrl -->|"Async CRUD"| AnnounceModel
    JobCtrl -->|"Async CRUD"| JobPostingModel
    ApiJobCtrl -->|"Async CRUD"| JobPostingModel
    AppCtrl -->|"Async CRUD"| AppModel
    ApiAppCtrl -->|"Async CRUD"| AppModel
    UserModel --> DBPool
    AnnounceModel --> DBPool
    JobPostingModel --> DBPool
    AppModel --> DBPool
    DBPool --> PostgresDB
    UserModel -.->|"Fallback if DB offline"| MemoryStore
    AnnounceModel -.->|"Fallback if DB offline"| MemoryStore
    JobPostingModel -.->|"Fallback if DB offline"| MemoryStore
    AppModel -.->|"Fallback if DB offline"| MemoryStore
    UserCtrl -->|"Render HTML"| UserViews
    AnnounceCtrl -->|"Render HTML"| AnnounceViews
    JobCtrl -->|"Render HTML"| JobViews
    AppCtrl -->|"Render HTML"| AppViews
    Generic404Route -->|"Render Generic 404"| NotFoundView
    NotFoundGuard -->|"302 Redirect Web to /404"| Generic404Route
    NotFoundGuard -->|"API 404 JSON"| JSONView
    NotFoundGuard --> LogWriter
    UserCtrl -.->|"5xx Exception"| ServerGuard
    ApiUserCtrl -.->|"5xx Exception"| ServerGuard
    JobCtrl -.->|"5xx Exception"| ServerGuard
    AppCtrl -.->|"5xx Exception"| ServerGuard
    ServerGuard --> LogWriter
    LogWriter --> ErrorLogFile
    ApiUserCtrl --> JSONView
    ApiAnnounceCtrl --> JSONView
    ApiJobCtrl --> JSONView
    ApiAppCtrl --> JSONView
    UtilHandlers --> SwaggerView
    UtilHandlers --> JSONView
    UserViews -->|"HTML Response"| Client
    AnnounceViews -->|"HTML Response"| Client
    JobViews -->|"HTML Response"| Client
    AppViews -->|"HTML Response"| Client
    NotFoundView -->|"404 HTML Response"| Client
    SwaggerView -->|"HTML Response"| Client
    JSONView -->|"JSON Response"| Client
```

### 1. 🚦 Routing Layer (`routes/`)
Routes decouple URLs and HTTP methods from controller execution, supporting both direct entity endpoints and nested parent-child routing:
- **`routes/user.js` (`/user`, `/users`)**: Bound to [`UserController`](./controllers/UserController.js) for full SSR web interface navigation and nested `/users/:userId/jobs` and `/users/:userId/applications` listings.
- **`routes/apiUser.js` (`/apiuser`, `/api/users`)**: Bound to [`ApiUserController`](./controllers/ApiUserController.js) for RESTful JSON operations, mounting nested `/api/users/:userId/jobs` and `/api/users/:userId/applications` routes.
- **`routes/announcement.js` (`/announcements`)**: Bound to [`AnnouncementController`](./controllers/AnnouncementController.js) for the web management dashboard.
- **`routes/apiAnnouncement.js` (`/api/announcements`)**: Bound to [`ApiAnnouncementController`](./controllers/ApiAnnouncementController.js) for JSON API consumption.
- **`routes/jobPosting.js` (`/jobs`, `/job-postings`)**: Bound to [`JobPostingController`](./controllers/JobPostingController.js) for career board presentation and nested `/jobs/:jobId/applications` candidate reviews.
- **`routes/apiJobPosting.js` (`/api/jobs`, `/api/users/:userId/jobs`)**: Bound to [`ApiJobPostingController`](./controllers/ApiJobPostingController.js) with `mergeParams: true`, handling direct job operations, publisher relationship lookup, and nested `/api/jobs/:jobId/applications` candidate routes.
- **`routes/application.js` (`/applications`)**: Bound to [`ApplicationController`](./controllers/ApplicationController.js) for direct applications web overview.
- **`routes/apiApplication.js` (`/api/applications`)**: Bound to [`ApiApplicationController`](./controllers/ApiApplicationController.js) with `mergeParams: true`, handling direct job applications, user-nested applications (`/api/users/:userId/applications`), and job-nested applications (`/api/jobs/:jobId/applications`).
- **`routes/index.js`**: Central router aggregation module.

### 2. ⚙️ Controller Layer (`controllers/`)
Controllers handle request parsing, invoke model domain logic asynchronously (`await`), format responses, integrate structured 404/5xx guardian helpers (`sendResourceNotFound` and `sendServerError`), and route output to views:
- **[`controllers/UserController.js`](./controllers/UserController.js)**: Asynchronous web controller for alumni directory, profile detail views, edit forms, creation, and redirection with flash query params; integrates `sendResourceNotFound` and `sendServerError`.
- **[`controllers/ApiUserController.js`](./controllers/ApiUserController.js)**: Asynchronous RESTful controller returning semantic HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `500`–`504` via `sendServerError`).
- **[`controllers/AnnouncementController.js`](./controllers/AnnouncementController.js)**: Asynchronous controller for web dashboard, detail cards, edit views, creation, updates, and deletion redirects; integrates `sendResourceNotFound` and `sendServerError`.
- **[`controllers/ApiAnnouncementController.js`](./controllers/ApiAnnouncementController.js)**: Asynchronous RESTful controller for announcements (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with `sendServerError` incident tracking.
- **[`controllers/JobPostingController.js`](./controllers/JobPostingController.js)**: Asynchronous web controller for career opportunities and alumni-nested job views; integrates `sendResourceNotFound` and `sendServerError`.
- **[`controllers/ApiJobPostingController.js`](./controllers/ApiJobPostingController.js)**: Asynchronous RESTful controller handling direct (`/api/jobs`) and nested (`/api/users/:userId/jobs`) job operations with foreign key integrity and `sendServerError`.
- **[`controllers/ApplicationController.js`](./controllers/ApplicationController.js)**: Asynchronous web controller for direct job applications (`/applications`), candidate submissions review (`/jobs/:jobId/applications`), and alumni submissions (`/users/:userId/applications`); integrates `sendResourceNotFound` and `sendServerError`.
- **[`controllers/ApiApplicationController.js`](./controllers/ApiApplicationController.js)**: Asynchronous RESTful controller handling direct applications (`/api/applications`) and nested user/job application lifecycles with foreign key/status checks and `sendServerError`.
- **Utility & Fallback Controllers (in `index.js`)**: Handles `/api/health`, `/health`, greetings (`/hello`, `/hello/:name`), arithmetic (`/sum/:number1/:number2`), generic 404 rendering (`/404`, `/404.html`), and guardian middleware error orchestration.

### 3. 📦 Model Layer (`models/`)
The **Model** encapsulates all domain state, validation, and data mutations with asynchronous interfaces connected to PostgreSQL and resilient in-memory fallback:
- **[`models/db.js`](./models/db.js)**: Centralized PostgreSQL connection pool using `pg.Pool`, configuring dynamic connection strings (`process.env.DATABASE_URL`), `allowExitOnIdle: true` (ensuring clean test suite termination), and graceful error logging.
- **[`models/User.js`](./models/User.js) (`UserModel`)**: Asynchronous singleton repository implementing `create`, `findAll`, `findById`, `update`, `delete`, and relational methods (`getJobPostings`, `findByIdWithJobPostings`, `getApplications`, `findByIdWithApplications`). Executes parameterized SQL queries against `users`, handles column aliasing (`graduation_year AS "graduationYear"`), `ON CONFLICT (email)` safety, and falls back to in-memory arrays when running offline.
- **[`models/Announcement.js`](./models/Announcement.js) (`AnnouncementModel`)**: Asynchronous singleton repository implementing `create`, `findAll`, `findById`, `update`, and `delete`. Executes parameterized SQL queries against `announcements`, formats date timestamps (`YYYY-MM-DD`), and provides seamless fallback.
- **[`models/JobPosting.js`](./models/JobPosting.js) (`JobPostingModel`)**: Asynchronous singleton repository implementing full CRUD and relationship operations (`create`, `findAll`, `findById`, `findByIdWithUser`, `getPostedByUser`, `findByPostedBy`, `findByCompany`, `findByJobType`, `getApplications`, `findByIdWithApplications`, `update`, `delete`). Connects to `job_postings` table with foreign key resolution (`posted_by -> users.id`) and in-memory fallback.
- **[`models/Application.js`](./models/Application.js) (`ApplicationModel`)**: Asynchronous singleton action entity repository connecting `users` and `job_postings`. Implements `create` (with composite uniqueness `ON CONFLICT (user_id, job_posting_id) DO UPDATE`), `findAll`, `findById`, `findByIdWithDetails` (eager loads candidate profile and job details), `findByUser`, `findByJob`, `update`, and `delete`.
- **[`models/index.js`](./models/index.js)**: Centralized aggregator exporting all domain models (`User`, `Announcement`, `JobPosting`, `Application`) and the shared database pool.

> 💡 *Ayrıntılı veri tasarımı, CRUD kontratları, PostgreSQL şemaları ve ER diyagramı için [Data Design Documentation (ddd.md)](./ddd.md) dokümanını inceleyin.*

### 4. 🖥️ View Layer (`views/` & Presentation)
All 14 front-end screens share the unified **Istanbul University (`İstanbul Üniversitesi • Mezun Portalı`)** design system documented in [`design.md`](./design.md) and [`brand.md`](./brand.md), featuring a top service status bar, sticky backdrop-blur navigation, semantic pillar color accents, client-side instant search/filter toolbars, breadcrumb trails, and responsive layouts:
- **User Views (Bosphorus Cobalt Theme — `#2563eb`):**
  - [`views/users.html`](./views/users.html): Alumni Directory with real-time search/cohort filter toolbar, live record counter, CRUD table, and graduate enrollment form (`POST /users`).
  - [`views/userDetail.html`](./views/userDetail.html): 2-column graduate dossier card with avatar emblem, academic metadata, and nested relational cards (`/users/:id/jobs`, `/users/:id/applications`).
  - [`views/userEdit.html`](./views/userEdit.html): Breadcrumb-guided pre-populated alumni profile editor (`POST /users/:id/edit`).
  - [`views/UserView.js`](./views/UserView.js): HTML rendering engine helper for user templates.
- **Announcement Views (IU Golden Amber Theme — `#d97706`):**
  - [`views/announcements.html`](./views/announcements.html): Campus & Beyazıt Homecoming bulletin board with interactive category filter chips (*Event, Career, Academic, General*), live search, and publishing form (`POST /announcements`).
  - [`views/announcementDetail.html`](./views/announcementDetail.html): Editorial bulletin article view with category badge, author metadata, and management actions.
  - [`views/announcementEdit.html`](./views/announcementEdit.html): Pre-populated announcement editor (`POST /announcements/:id/edit`).
  - [`views/AnnouncementView.js`](./views/AnnouncementView.js): HTML rendering engine helper for announcement templates.
- **Job Posting Views (Emerald Green Theme — `#059669`):**
  - [`views/jobs.html`](./views/jobs.html): Career & Opportunities Board with instant search, employment-type filter chips (*Full-time, Remote, Internship, Contract*), and `JP-R1`–`JP-R7` job creation form (`POST /jobs`).
  - [`views/jobDetail.html`](./views/jobDetail.html): Role specification card with publisher link, compensation pill, and inline **Quick Apply with Alumni Profile** form (`POST /applications`).
  - [`views/jobEdit.html`](./views/jobEdit.html): Pre-populated opportunity editor (`POST /jobs/:id/edit`).
  - [`views/JobPostingView.js`](./views/JobPostingView.js): HTML rendering engine helper for job posting templates.
- **Application Views (Royal Purple Theme — `#7c3aed`):**
  - [`views/applications.html`](./views/applications.html): ATS dashboard with 4 KPI metric cards (*Total, Submitted, In Review, Accepted*), status filter chips, live search, inline status switcher, and direct submission form.
  - [`views/applicationDetail.html`](./views/applicationDetail.html): 2-column candidate review dossier pairing candidate academic info with target job specs, CV link, cover note, and evaluation status updater (`POST /applications/:id/status`).
  - [`views/ApplicationView.js`](./views/ApplicationView.js): HTML rendering engine helper for application templates.
- **Guardian Diagnostic Views (Crimson Rose Theme — `#e11d48`):**
  - [`views/404.html`](./views/404.html) & [`views/NotFoundView.js`](./views/NotFoundView.js): Branded generic `/404` diagnostic template and SSR helper (`NotFoundView.renderNotFound`, `NotFoundView.buildViewModel`, `sanitizeLocalHref`).
  - [`middleware/guardianShared.js`](./middleware/guardianShared.js): Dynamic 404/5xx Guardian diagnostic screen renderer (`renderGuardianScreen`) with `ERR-*` Incident IDs and route suggestions.
- **Static Portal Pages (`public/`):**
  - [`public/index.html`](./public/index.html): Unified Istanbul University homepage with gradient hero, KPI bar, live module search, 4 pillar cards, Guardian banner, and live `/api/health` latency playground.
  - [`public/about.html`](./public/about.html): Institutional 1453 Beyazıt heritage showcase, 5 platform pillars, and MVC/PostgreSQL/Guardian tech stack manual.
- **API Documentation:** Interactive Swagger UI rendered at `/api/swagger`.

---

## 🔐 Authentication, Authorization & Security Architecture

The Istanbul University Alumni Tracking System implements a hardened, production-grade authentication and authorization subsystem operating seamlessly across both Server-Side Rendered (SSR) HTML views and stateless RESTful JSON APIs.

### 1. Identity & Credential Security Principles
- **Normalized Identity Handling:** Email addresses are normalized using `trim().toLowerCase()` prior to verification or storage, guaranteeing case-insensitive identity lookup (`AUTH-R1`).
- **Cryptographic Password Hashing:** Passwords are never stored in plaintext. They are protected using:
  - Cryptographically secure per-user random salts generated via Node's `crypto.randomBytes(16)`.
  - PBKDF2 (Password-Based Key Derivation Function 2) with 1,000 iterations, 64-byte key length, and SHA-512 digest (`crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')`).
  - Constant-time verification using `crypto.timingSafeEqual` to eliminate timing-attack vulnerabilities.
- **Strict Password Validation (`USR-R1`):** Minimum length of 8 characters enforced on both user registration and profile updates.

### 2. Stateless HMAC-SHA256 Session Tokens
- **Compact Token Architecture (`AUTH-R3`):** Session tokens format as `<base64url(payload)>.<base64url(hmacSignature)>`, signed with HMAC-SHA256 using `SESSION_SECRET`.
- **Payload Claims:**
  ```json
  {
    "userId": 1,
    "id": 1,
    "email": "hakan@alumni.edu",
    "name": "Hakan Ural",
    "role": "admin",
    "accountStatus": "active",
    "iat": 1732525600000,
    "exp": 1732612000000
  }
  ```
- **Flexible Expiration Policy:**
  - Standard Session: 24 hours (`86400` seconds).
  - Extended Session ("Remember Me" checkbox enabled): 30 days (`2592000` seconds).

### 3. Hardened HTTP Cookie & Header Strategy (RFC 6265)
- **`Set-Cookie` Directives:** `session=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=<seconds>`
  - `HttpOnly`: Protects session tokens from client-side script inspection (XSS defense).
  - `SameSite=Lax`: Prevents cross-site request forgery (CSRF defense) during third-party site navigation.
  - `Path=/`: Ensures universal session availability across all portal routes.
- **Session Termination:** Handled by `clearSessionCookie(res)`, which sets `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`.
- **Dual Bearer & Cookie Support:** REST API clients can pass tokens via `Authorization: Bearer <token>` or session cookies interchangeably.

### 4. Role-Based Access Control (RBAC) Matrix
The system enforces 6 canonical actor personas with strictly segregated domain capabilities:

| Role Identifier | Icon & Title | Primary Responsibilities | Access Privileges |
| :--- | :--- | :--- | :--- |
| **`guest`** | 🌐 Ziyaretçi | Prospective students, public visitors, health probes | Read-only browsing (`/`, `/about`, `/users`, `/jobs`, `/announcements`), member registration (`/register`), and portal sign-in (`/login`). Cannot mutate state. |
| **`student`** | 🎓 Öğrenci | Currently enrolled undergraduate & graduate students | Browse Alumni Directory for mentors, apply to active jobs/internships (`POST /applications`), track personal applications (`/users/:id/applications`), view personal student workspace. |
| **`alumni`** | 🎓 Mezun | Verified graduates of Istanbul University | Maintain alumni profile dossier, publish career opportunities (`POST /jobs`), review candidate applications to own jobs, apply to peer postings, opt into mentorship (`isMentor=true`). |
| **`employer`** | 💼 İşveren | Partner recruiters, corporate hiring managers | Post and manage corporate job listings (`/jobs#post-job-form`), review applicant dossiers (`/applications`), search verified talent pool (`/users`). |
| **`moderator`** | ⚖️ Moderatör | Academic & faculty coordinators | Oversight and moderation of public announcements and job listings across the ecosystem. |
| **`admin`** | 👑 Yönetici | System superusers and platform administrators | Full governance authority, user role reassignment, account status mutation (`active`, `pending_verification`, `suspended`, `archived`), user deletion, direct entity field manipulation (`/admin`, `/api/admin/*`). |

### 5. Authentication & Authorization Middleware Suite ([`middleware/auth.js`](./middleware/auth.js))
- **`authMiddleware`:** Global request hydrator mounted after body parsers in `index.js`. Inspects cookies and Bearer headers, verifies HMAC signatures, and populates `req.user`, `res.locals.currentUser`, and `res.locals.isAuthenticated`.
- **`requireAuth`:** Route guard for protected endpoints. Web requests receive a `302 Found` redirect to `/login?returnUrl=<originalUrl>`; API requests receive `401 Unauthorized` JSON.
- **`requireRole(...roles)`:** Enforces role permissions. Returns `403 Forbidden` (`{"error": "Forbidden: Requires one of [roles]"}`) if the user's role is not authorized.
- **`requireActive`:** Enforces `accountStatus === 'active'` (`USR-R7`), preventing suspended or unverified accounts from mutating data.
- **`requireOwnershipOrAdmin(getOwnerIdFn)`:** Ensures members can only edit or delete their own resources unless holding administrative privileges.
- **`guestOnly`:** Anti-reauthentication guard on `/login` and `/register`, redirecting logged-in users to `/users`.

---

## 👤 User-Specific Pages & Personal Workspaces

The platform provides tailored, user-specific pages and personalized workspaces based on the viewing member's identity and active role:

### 1. Personal Profile & Workspace (`/profile`, `/me`, `/users/:id`)
- **Direct Jump (`/profile` & `/me`):** Authenticated users visiting `/profile` or `/me` are immediately redirected (`302`) to their own individual dossier (`/users/:id`). Unauthenticated visitors are redirected to `/login?returnUrl=/profile`.
- **Personal Workspace Banner:** When members view their own profile, a high-contrast dark indigo banner (`✨ Kişisel Profil & Çalışma Alanı`) welcomes them by name, displays their member ID, and provides quick shortcuts to edit their profile (`/users/:id/edit`) or sign out (`/logout`).
- **Role-Adaptive Activity Widgets:**
  - **Student View:** Displays "📝 Başvurularım & Staj Takibi" (`/users/:id/applications`), "💼 Açık İş & Staj İlanları" (`/jobs`), and "👥 Mezun Rehberleri & Mentorlar" (`/users`).
  - **Alumni View:** Displays "💼 Yayınladığım İlanlar" (`/users/:id/jobs`), "📝 Başvurularım" (`/users/:id/applications`), and mentorship status.
  - **Employer View:** Displays "📢 Yeni İlan Yayınla" (`/jobs#post-job-form`), "📋 Yayınlanan İlanlarım" (`/users/:id/jobs`), and "👥 Aday Başvuruları" (`/applications`).
  - **Admin View:** Displays "🛡️ Yönetim Konsolu" (`/admin`) and links to user activity logs.
- **Contextual Badging:** Displays role badge (`👑`, `⚖️`, `💼`, `🎓`), account status badge (`● Active`, `⏳ Pending`, `⚠️ Suspended`), and verified alumni mentor badge.
- **Professional Headline:** Automatically displays company and title (e.g. `🏢 Senior Software Engineer at Google`) when populated.

### 2. Nested User Job Listings (`/users/:userId/jobs`)
- Displays all career opportunities published by the specific user.
- If viewed by the publisher themselves, displays owner-tailored subtitles and quick actions to add new positions.

### 3. Nested User Applications Tracker (`/users/:userId/applications`)
- Displays candidate applications submitted by the member across all job postings.
- Shows real-time application status badges (`Submitted`, `Under Review`, `Accepted`, `Rejected`) and cover note review.

---

## 🛡️ Central Administration Console & Governance

Accessible exclusively to administrators (`role === 'admin'`) at [`/admin`](http://localhost:3000/admin) and [`/api/admin/*`](http://localhost:3000/api/admin/overview):
- **KPI Metrics Dashboard:** Real-time counts for Total Users, Job Postings, Announcements, and Applications.
- **User Directory & RBAC Governance Table:** Inline dropdowns to mutate user roles (`student`, `alumni`, `employer`, `moderator`, `admin`) and account statuses (`active`, `pending_verification`, `suspended`, `archived`), plus permanent user deletion.
- **Career & Announcement Oversight:** Review, change status, and purge any listing or campus bulletin.
- **Fast Direct Data Manipulation Engine:** Direct field mutation command card (`POST /admin/manipulate` and `POST /api/admin/manipulate`) allowing immediate updates to any entity field.

---

## 🛡️ Middleware, Logging & Error Guardian Pipeline (`middleware/`)

Express 5 mounts a centralized observability and fault-handling pipeline via [`middleware/index.js`](./middleware/index.js) and [`index.js`](./index.js) so every request is traced and every `404` or `5xx` error produces structured diagnostics instead of bare stack traces or default Express text:

### Request Execution & Fallback Flow

1. **Global Request Telemetry ([`middleware/logger.js`](./middleware/logger.js))** — mounted first in `index.js` via `app.use(logger)`:
   - Measures high-resolution request duration and hooks `finish` / `close` events (tagging premature disconnects with `ABORTED(...)`).
   - Emits formatted single-line telemetry:
     `[ISO] METHOD route | status | mime | duration | size | ip`
   - Strips CRLF/ANSI control characters from user-controlled fields and forwards output via [`middleware/logWriter.js`](./middleware/logWriter.js).
   - Exported helpers: `logger`, `createLogger`, `formatLogEntry`, `extractResponseType`, `extractContentLength`, `extractClientIp`.

2. **Dual-Sink Log Writer ([`middleware/logWriter.js`](./middleware/logWriter.js))**:
   - Writes sanitized log lines to terminal (`stdout`/`stderr`) **and** persists them to disk (`DEFAULT_LOG_FILE_PATH = logs/error.logs`, configurable via `ERROR_LOG_PATH`).
   - Strips ANSI escape sequences (`stripAnsi`), creates missing parent directories automatically, and ignores disk write failures gracefully so logging never breaks request handling.
   - Exported helpers: `DEFAULT_LOG_FILE_PATH`, `stripAnsi`, `formatFileLogLine`, `appendLogLine`, `writeDualLog`, `emitLogEvent`.

3. **Authentication & RBAC Middleware Suite ([`middleware/auth.js`](./middleware/auth.js))** — mounted after body parsers via `app.use(authMiddleware)`:
   - **Identity Hydration (`authMiddleware`):** Inspects incoming requests for Bearer tokens (`Authorization: Bearer <token>`) or HttpOnly cookies (`session=<token>`). Validates HMAC-SHA256 signatures, checks expiration (`exp > Date.now()`), and populates `req.user`, `res.locals.currentUser`, and `res.locals.isAuthenticated`.
   - **Authentication Guard (`requireAuth`):** Protects routes requiring sign-in; redirects web users (`302`) to `/login?returnUrl=...` and returns `401 Unauthorized` for REST clients.
   - **Role Gate (`requireRole(...roles)`):** Enforces RBAC permissions (`USR-R3`..`USR-R6`), returning `403 Forbidden` if the authenticated member lacks sufficient privileges.
   - **Account Status Guard (`requireActive`):** Enforces `accountStatus === 'active'` (`USR-R7`), blocking suspended or unverified members from performing state mutations (`403 Forbidden`).
   - **Data Ownership Guard (`requireOwnershipOrAdmin(ownerExtractor)`):** Protects sensitive data so members can only edit/delete their own job postings or applications unless carrying administrative authority.
   - **Guest Gate (`guestOnly`):** Redirects already signed-in members away from `/login` or `/register` to `/users`.
   - **Cookie Helpers:** `setSessionCookie` (supports 24-hour and 30-day extended sessions), `clearSessionCookie`, and `parseCookies`.

4. **Generic `/404` Page & 404 Guardian ([`middleware/notFoundGuardian.js`](./middleware/notFoundGuardian.js))**:
   - **Redirect-on-Invalid-Web-Request:** Unmatched non-API web requests reaching `notFoundGuardian` receive a `302 Found` redirect to `/404?from=...` (constructed by `buildNotFoundRedirectUrl` and `sanitizeFromPath` to prevent open redirects or protocol-relative targets).
   - **Generic `/404` & `/404.html` Route:** Mounted before `notFoundGuardian` in `index.js` using `genericNotFoundPageHandler`, rendering [`views/404.html`](./views/404.html) via [`views/NotFoundView.js`](./views/NotFoundView.js) with HTTP `404` status, probable-cause diagnosis (`diagnoseNotFound`), safe `from` backlink sanitization (`sanitizeLocalHref`), known route hints (`KNOWN_ROUTES`), and quick navigation cards.
   - **REST API & Explicit Missing Resource 404s:** Unmatched `/api/*` paths (or JSON-negotiated requests) bypass the redirect and return structured diagnostic JSON (`sendGuardian404`). Missing entity lookups inside web controllers (`UserController`, `AnnouncementController`, `JobPostingController`, `ApplicationController`) invoke `sendResourceNotFound` to render rich HTML 404 diagnostics directly without losing context. `guardian404ErrorHandler` also intercepts errors explicitly thrown with status `404`.

5. **5xx Server Error Guardian ([`middleware/serverErrorGuardian.js`](./middleware/serverErrorGuardian.js))**:
   - Classifies unexpected `5xx` errors from controllers (`sendServerError`) or Express middleware (`serverErrorGuardian`) into structured diagnostic categories:
     - `DB_CONNECTION_ERROR` (`503`)
     - `DB_SCHEMA_ERROR` (`500`)
     - `DB_QUERY_FAILURE` (`500`)
     - `VIEW_TEMPLATE_ERROR` (`500`)
     - `BAD_GATEWAY` (`502`)
     - `SERVICE_UNAVAILABLE` (`503`)
     - `GATEWAY_TIMEOUT` (`504`)
     - `INTERNAL_SERVER_ERROR` (`500`)
   - Generates unique per-incident identifiers (`ERR-<base36>-<rand>`), suppresses raw stack traces in HTTP responses when `NODE_ENV=production`, negotiates HTML vs. JSON output via `shouldRenderHtml`, and writes `[5XX GUARDIAN]` / `[5XX STACK]` entries to both console and `logs/error.logs`.

6. **Shared Guardian Utilities ([`middleware/guardianShared.js`](./middleware/guardianShared.js))**:
   - Centralizes `KNOWN_ROUTES`, `QUICK_NAV_LINKS`, `escapeHtml`, `normalizePath`, `shouldRenderHtml`, and `renderGuardianScreen` across both 404 and 5xx screens.

7. **Dynamic Role-Based Navigation & Menu Generator ([`views/navHelper.js`](./views/navHelper.js))**:
   - Centralized Single Source of Truth for role-specific navigation menus, user identity badges, and authentication/exit actions based on user role (`guest`, `student`, `alumni`, `employer`, `moderator`, `admin`).
   - Guarantees `🛡️ Admin Panel` visibility exclusively for administrators, student/employer specific career shortcuts, and an always-available `🚪 Çıkış Yap` (logout) button for all authenticated sessions.
   - Integrates seamlessly with all server-side rendered HTML views (`UserView`, `JobPostingView`, `AnnouncementView`, `ApplicationView`, `AdminView`) and hydrates static landing pages (`index.html`, `about.html`) via client-side `/api/me` probing.

---

## 🧠 The Forgetting Test (Data Volatility Demonstration)

To demonstrate why an in-memory database is insufficient for production systems and to prove the necessity of persistent storage (PostgreSQL with Docker volumes), **The Forgetting Test** was performed.

### Test Workflow & Execution:

```
Step 1: Check Seed State (GET /api/users) -> 3 Users (IDs 1, 2, 3)
Step 2: Create Record (POST /api/users)    -> User ID 4 Created ("Forgetting Test User")
Step 3: Verify Persistence in Memory      -> 4 Users present in RAM
Step 4: Stop Container                    -> docker compose down (Removes alumni-web-1)
Step 5: Restart Container                  -> docker compose up -d (Fresh container)
Step 6: Query State (GET /api/users)       -> ONLY IDs 1, 2, 3 exist! ID 4 WAS FORGOTTEN!
```

### Empirical Demonstration:
```bash
# 1. Create a new user in memory
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Forgetting Test User","department":"Software Engineering","graduationYear":2026,"email":"forgetting.test@alumni.edu"}'
# Output: {"id":4,"name":"Forgetting Test User",...} (201 Created)

# 2. Tear down the container
docker compose down
# Output: Container alumni-web-1 Removed

# 3. Bring the container back up
docker compose up -d
# Output: Container alumni-web-1 Started

# 4. Verify that data was forgotten
curl http://localhost:3000/api/users
# Output: Only records 1, 2, 3 returned! User 4 has been erased.
```

### Conclusion:
Node.js heap memory is volatile and lifecycle-bound to the running container process. This experiment serves as the pedagogical and architectural justification for the **PostgreSQL + Docker Named Volume (`pgdata`)** transition detailed in [`ddd.md`](./ddd.md#6-relational-database-postgresql-transition-blueprint).

---

## 🗄️ Database, Migrations & Seeding Layer

To overcome memory volatility proven by **The Forgetting Test**, the application is fully equipped with an industrial-grade PostgreSQL persistence layer, automated migration scripts, and mock data factories.

### Environment Variables & Configuration

The project follows the Twelve-Factor App methodology for configuration:
- **[`.example.env`](./.example.env)**: Committed template defining all required environment keys (`PORT`, `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).
- **`.env`**: Local secrets file, strictly ignored in [`.gitignore`](./.gitignore) and [`.dockerignore`](./.dockerignore).

```bash
# Setup local environment from template
cp .example.env .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Express HTTP server listen port |
| `DATABASE_URL` | `postgres://alumni_user:alumni_password@localhost:5432/alumni_db` | PostgreSQL connection URI |
| `POSTGRES_USER` | `alumni_user` | PostgreSQL superuser username |
| `POSTGRES_PASSWORD` | `alumni_password` | PostgreSQL superuser password |
| `POSTGRES_DB` | `alumni_db` | Target PostgreSQL database name |

---

### PostgreSQL Database Migrations (`npm run migrate`)

Migrations are managed with idempotency tracking via a dedicated `schema_migrations` table:
- **[`migrations/001_create_tables.sql`](./migrations/001_create_tables.sql)**: Creates `users`, `announcements`, auto-update trigger function `update_updated_at_column()`, and performance B-Tree indexes (`idx_users_email`, `idx_announcements_category`, `idx_announcements_pubdate`).
- **[`migrations/002_seed_data.sql`](./migrations/002_seed_data.sql)**: Seeds default benchmark records for verification.
- **[`migrations/003_create_job_postings_table.sql`](./migrations/003_create_job_postings_table.sql)**: Creates `job_postings` table, foreign keys (`posted_by` -> `users.id`), status/job_type constraints, indexes, and automated update triggers.
- **[`scripts/migrate.js`](./scripts/migrate.js)**: Node.js migration runner that scans `migrations/*.sql` alphabetically, records applied migrations, and executes unapplied migrations inside atomic transactions.

```bash
# Run database migrations
npm run migrate
```

---

### Data Factories & Seeding Pattern (`npm run seed`)

To enable realistic, automated, and deterministic test data generation, the application adopts the **Factory & Seeding** design pattern:
- **[`factories/UserFactory.js`](./factories/UserFactory.js)**: Produces randomized or customized alumni records adhering to domain validation rules (e.g., email format, departments, graduation years).
- **[`factories/AnnouncementFactory.js`](./factories/AnnouncementFactory.js)**: Generates structured announcements across valid categories (`General`, `Event`, `Career`, `Academic`).
- **[`factories/JobPostingFactory.js`](./factories/JobPostingFactory.js)**: Generates structured career postings across varied job types (`Full-time`, `Remote`, `Contract`, `Internship`) and salaries.
- **[`factories/ApplicationFactory.js`](./factories/ApplicationFactory.js)**: Generates candidate applications connecting users and job postings with realistic cover notes, resume URLs, and evaluation statuses.
- **[`factories/index.js`](./factories/index.js)**: Aggregates all model factories.
- **[`scripts/seed.js`](./scripts/seed.js)**: High-speed seeder executing `UserFactory.createInDb()`, `AnnouncementFactory.createInDb()`, `JobPostingFactory.createInDb()`, and `ApplicationFactory.createInDb()` to populate the database and sync in-memory stores.

```bash
# Run data seeder
npm run seed
# or
npm run db:seed
```

---

### Centralized Database Connection Pool (`models/db.js`)

Database operations utilize the PostgreSQL client pool (`pg.Pool`):
- **Resource Management**: Automatically creates, reuses, and cleans up client connections.
- **`allowExitOnIdle: true`**: Allows idle connections to release cleanly, guaranteeing automated test suites (`node --test`) exit immediately without lingering open sockets.
- **Resilient Fallback**: If PostgreSQL is unreachable (e.g. during offline unit tests), models gracefully operate against their internal fallback store with zero crashes.

---

## 📋 Complete Route & API Reference Matrix

### 🌐 Web Presentation Routes (HTML Views)

| Endpoint | Method | Controller Action | Description | View Rendered |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | Static File | Temporary landing page | `public/index.html` |
| `/about` | `GET` | Static File | About page | `public/about.html` |
| `/register` / `/signup` | `GET` | `UserController.getRegisterForm` | Member onboarding registration page with role selector | `views/register.html` |
| `/register` / `/signup` | `POST` | `UserController.register` | Validates registration (`USR-R1..USR-R7`) and creates user | Flash redirect |
| `/login` | `GET` | `UserController.getLoginForm` | Member portal login page with quick credentials | `views/login.html` |
| `/login` | `POST` | `UserController.login` | Authenticates user & issues session cookie (`Set-Cookie`) | Flash redirect / Token |
| `/logout` | `GET` / `POST` | `UserController.logout` | Terminates session, clears cookie, redirects to `/login` | Flash redirect |
| `/profile` / `/me` | `GET` | `UserController.getProfile` | Redirects authenticated member to their profile dossier (`/users/:id`) | `302` Redirect |
| `/users` / `/user` | `GET` | `UserController.getAll` | Alumni directory list with creation form | `views/users.html` |
| `/users/:id` | `GET` | `UserController.getById` | Alumni profile card view | `views/userDetail.html` |
| `/users/:id/edit` | `GET` | `UserController.getEditForm` | Alumni edit form view | `views/userEdit.html` |
| `/users` | `POST` | `UserController.create` | Submits new alumni member, redirects to `/users` | Flash redirect |
| `/users/:id/edit` | `POST` | `UserController.update` | Submits edited alumni member, redirects to `/users` | Flash redirect |
| `/users/:id/delete` | `POST` | `UserController.delete` | Deletes alumni member, redirects to `/users` | Flash redirect |
| `/announcements` | `GET` | `AnnouncementController.getAll` | Management dashboard with creation form | `views/announcements.html` |
| `/announcements/:id` | `GET` | `AnnouncementController.getById` | Announcement detail card view | `views/announcementDetail.html` |
| `/announcements/:id/edit` | `GET` | `AnnouncementController.getEditForm` | Announcement edit form view | `views/announcementEdit.html` |
| `/announcements` | `POST` | `AnnouncementController.create` | Publishes announcement, redirects to `/announcements` | Flash redirect |
| `/announcements/:id/edit` | `POST` | `AnnouncementController.update` | Updates announcement, redirects to `/announcements` | Flash redirect |
| `/announcements/:id/delete` | `POST` | `AnnouncementController.delete` | Deletes announcement, redirects to `/announcements` | Flash redirect |
| `/jobs` | `GET` | `JobPostingController.getAll` | Career board dashboard | `views/jobs.html` |
| `/jobs/:id` | `GET` | `JobPostingController.getById` | Career opportunity detail view with publisher | `views/jobDetail.html` |
| `/jobs/:id/edit` | `GET` | `JobPostingController.getEditForm` | Job posting edit form view | `views/jobEdit.html` |
| `/jobs` | `POST` | `JobPostingController.create` | Creates job posting, redirects to `/jobs` | Flash redirect |
| `/jobs/:id/edit` | `POST` | `JobPostingController.update` | Updates job posting, redirects to `/jobs` | Flash redirect |
| `/jobs/:id/delete` | `POST` | `JobPostingController.delete` | Deletes job posting, redirects to `/jobs` | Flash redirect |
| `/users/:userId/jobs` | `GET` | `JobPostingController.getByUser` | Nested web view of all jobs by specific alumni | `views/jobs.html` |
| `/applications` | `GET` | `ApplicationController.getAll` | Job applications overview dashboard | `views/applications.html` |
| `/applications/:id` | `GET` | `ApplicationController.getById` | Single candidate application review card | `views/applicationDetail.html` |
| `/applications` | `POST` | `ApplicationController.create` | Submits new job application, redirects with flash status | Flash redirect |
| `/applications/:id/status` | `POST` | `ApplicationController.updateStatus` | Updates application review status | Flash redirect |
| `/applications/:id/delete` | `POST` | `ApplicationController.delete` | Deletes application record | Flash redirect |
| `/users/:userId/applications` | `GET` | `ApplicationController.getByUser` | Nested web view: applications submitted by user ("My Applications") | `views/applications.html` |
| `/jobs/:jobId/applications` | `GET` | `ApplicationController.getByJob` | Nested web view: candidate review for job posting | `views/applications.html` |
| `/admin` | `GET` | `AdminController.getDashboard` | Central administration console & metrics (Guarded: requires `admin` role) | `views/admin.html` |
| `/admin/users/:id/role` | `POST` | `AdminController.updateUserRole` | Reassigns user role (admin only) | Flash redirect |
| `/admin/users/:id/status` | `POST` | `AdminController.updateUserStatus` | Updates account status (admin only) | Flash redirect |
| `/admin/users/:id/delete` | `POST` | `AdminController.deleteUser` | Permanently deletes user record (admin only) | Flash redirect |
| `/admin/jobs/:id/status` | `POST` | `AdminController.updateJobStatus` | Updates job posting status (admin only) | Flash redirect |
| `/admin/jobs/:id/delete` | `POST` | `AdminController.deleteJob` | Permanently deletes job posting (admin only) | Flash redirect |
| `/admin/announcements/:id/delete` | `POST` | `AdminController.deleteAnnouncement` | Permanently deletes announcement (admin only) | Flash redirect |
| `/admin/manipulate` | `POST` | `AdminController.manipulate` | Direct entity field mutation engine (admin only) | Flash redirect |
| `/404`, `/404.html` | `ALL` | `genericNotFoundPageHandler` | Generic diagnostic 404 screen (`from` sanitized, quick nav, probable cause) | `views/404.html` |
| `*` *(unmatched web)* | `ALL` | `notFoundGuardian` | Redirects invalid browser routes (`302`) to `/404?from=...` (JSON 404 for `/api/*`) | Redirect / Guardian JSON |

### ⚡ RESTful JSON API Routes

#### Authentication & Direct Entity Endpoints
| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Utility | None | `200 OK` (`{"status":"ok"}`) |
| `/api/login` | `POST` | `ApiUserController.login` | `{ email, password, rememberMe? }` | `200 OK` (token & user) / `401 Unauthorized` |
| `/api/logout` | `POST` | `ApiUserController.logout` | None | `200 OK` (`{"message":"Logged out successfully"}`) |
| `/api/me` / `/api/profile` | `GET` | `ApiUserController.me` | Bearer token / Cookie | `200 OK` (user profile) / `401 Unauthorized` |
| `/api/register` | `POST` | `UserController.register` | `{ name, email, department, graduationYear, ... }` | `201 Created` / `400 Bad Request` |
| `/api/users` | `GET` | `ApiUserController.getAll` | None | `200 OK` (Array of users) |
| `/api/users/:id` | `GET` | `ApiUserController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/users` | `POST` | `ApiUserController.create` | `{ name, department, graduationYear, email }` | `201 Created` / `400 Bad Request` |
| `/api/users/:id` | `PUT` | `ApiUserController.update` | Full user object | `200 OK` / `404 Not Found` |
| `/api/users/:id` | `PATCH` | `ApiUserController.update` | Partial user fields | `200 OK` / `404 Not Found` |
| `/api/users/:id` | `DELETE` | `ApiUserController.delete` | None | `200 OK` / `404 Not Found` |
| `/api/announcements` | `GET` | `ApiAnnouncementController.getAll` | None | `200 OK` (Array of announcements) |
| `/api/announcements/:id` | `GET` | `ApiAnnouncementController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/announcements` | `POST` | `ApiAnnouncementController.create` | `{ title, content, category, author, date }` | `201 Created` / `400 Bad Request` |
| `/api/announcements/:id` | `PUT` | `ApiAnnouncementController.update` | Full announcement object | `200 OK` / `404 Not Found` |
| `/api/announcements/:id` | `PATCH` | `ApiAnnouncementController.update` | Partial fields | `200 OK` / `404 Not Found` |
| `/api/announcements/:id` | `DELETE` | `ApiAnnouncementController.delete` | None | `200 OK` / `404 Not Found` |
| `/api/jobs` | `GET` | `ApiJobPostingController.getAll` | Query filters: `status, jobType, company` | `200 OK` (Array of jobs) |
| `/api/jobs/:id` | `GET` | `ApiJobPostingController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/jobs` | `POST` | `ApiJobPostingController.create` | `{ title, company, location, jobType, contactEmail, ... }` | `201 Created` / `500 Error` |
| `/api/jobs/:id` | `PUT` | `ApiJobPostingController.update` | Full job posting object | `200 OK` / `404 Not Found` |
| `/api/jobs/:id` | `PATCH` | `ApiJobPostingController.partialUpdate` | Partial job posting fields | `200 OK` / `404 Not Found` |
| `/api/jobs/:id` | `DELETE` | `ApiJobPostingController.delete` | None | `200 OK` / `404 Not Found` |
| `/api/jobs/:id/user` | `GET` | `ApiJobPostingController.getUser` | None | `200 OK` (Publisher user) / `404` |
| `/api/applications` | `GET` | `ApiApplicationController.getAll` | Query filters: `userId, jobPostingId, status` | `200 OK` (Array of applications) |
| `/api/applications/:id` | `GET` | `ApiApplicationController.getById` | None | `200 OK` (With user & job details) / `404` |
| `/api/applications` | `POST` | `ApiApplicationController.create` | `{ userId, jobPostingId, resumeUrl, coverNote, status }` | `201 Created` / `400 Bad Request` |
| `/api/applications/:id` | `PUT` | `ApiApplicationController.update` | Full application object | `200 OK` / `404 Not Found` |
| `/api/applications/:id` | `PATCH` | `ApiApplicationController.partialUpdate` | Partial fields (`status, resumeUrl, coverNote`) | `200 OK` / `404 Not Found` |
| `/api/applications/:id` | `DELETE` | `ApiApplicationController.delete` | None | `200 OK` / `404 Not Found` |

#### Nested Parent-Child Endpoints (User ➔ Job Postings)
| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/users/:userId/jobs` | `GET` | `ApiJobPostingController.getAll` | None | `200 OK` (Jobs by user) / `404` |
| `/api/users/:userId/jobs` | `POST` | `ApiJobPostingController.create` | `{ title, company, contactEmail, ... }` | `201 Created` (Binds `postedBy`) |
| `/api/users/:userId/jobs/:id`| `GET` | `ApiJobPostingController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/users/:userId/jobs/:id`| `PUT` | `ApiJobPostingController.update` | Full job posting object | `200 OK` / `404 Not Found` |
| `/api/users/:userId/jobs/:id`| `PATCH` | `ApiJobPostingController.partialUpdate` | Partial fields | `200 OK` / `404 Not Found` |
| `/api/users/:userId/jobs/:id`| `DELETE` | `ApiJobPostingController.delete` | None | `200 OK` / `404 Not Found` |

#### Nested Parent-Child Endpoints (User ➔ Applications)
| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/users/:userId/applications` | `GET` | `ApiApplicationController.getAll` | None | `200 OK` (Applications by user) / `404` |
| `/api/users/:userId/applications` | `POST` | `ApiApplicationController.create` | `{ jobPostingId, resumeUrl, coverNote }` | `201 Created` (Binds `userId`) |
| `/api/users/:userId/applications/:id`| `GET` | `ApiApplicationController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/users/:userId/applications/:id`| `PUT` | `ApiApplicationController.update` | Full application object | `200 OK` / `404 Not Found` |
| `/api/users/:userId/applications/:id`| `PATCH` | `ApiApplicationController.partialUpdate`| Partial fields (`status, resumeUrl, coverNote`) | `200 OK` / `404 Not Found` |
| `/api/users/:userId/applications/:id`| `DELETE` | `ApiApplicationController.delete` | None | `200 OK` / `404 Not Found` |

#### Nested Parent-Child Endpoints (Job Posting ➔ Candidate Applications)
| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/jobs/:jobId/applications` | `GET` | `ApiApplicationController.getAll` | None | `200 OK` (Candidates for job) / `404` |
| `/api/jobs/:jobId/applications` | `POST` | `ApiApplicationController.create` | `{ userId, resumeUrl, coverNote }` | `201 Created` (Binds `jobPostingId`) |
| `/api/jobs/:jobId/applications/:id`| `GET` | `ApiApplicationController.getById` | None | `200 OK` / `404 Not Found` |
| `/api/jobs/:jobId/applications/:id`| `PATCH` | `ApiApplicationController.partialUpdate`| `{ status: 'Accepted' }` | `200 OK` / `404 Not Found` |
| `/api/jobs/:jobId/applications/:id`| `DELETE` | `ApiApplicationController.delete` | None | `200 OK` / `404 Not Found` |

#### Administration & Governance Endpoints (Requires `admin` Role)
| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/admin/overview` | `GET` | `AdminController.getDashboard` | None | `200 OK` (Aggregated metrics & all records) / `403` |
| `/api/admin/users/:id/role` | `PATCH` | `AdminController.updateUserRole` | `{ role: 'moderator' }` | `200 OK` / `400` / `404` |
| `/api/admin/users/:id/status`| `PATCH` | `AdminController.updateUserStatus` | `{ status: 'suspended' }` | `200 OK` / `400` / `404` |
| `/api/admin/users/:id` | `DELETE` | `AdminController.deleteUser` | None | `200 OK` / `404` |
| `/api/admin/jobs/:id/status` | `PATCH` | `AdminController.updateJobStatus` | `{ status: 'Closed' }` | `200 OK` / `404` |
| `/api/admin/jobs/:id` | `DELETE` | `AdminController.deleteJob` | None | `200 OK` / `404` |
| `/api/admin/announcements/:id`| `DELETE` | `AdminController.deleteAnnouncement` | None | `200 OK` / `404` |
| `/api/admin/manipulate` | `POST` | `AdminController.manipulate` | `{ entity, id, field, value }` | `200 OK` (Mutated record) / `400` / `404` |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- `curl` or [Postman](https://www.postman.com/) for API testing

### Running Locally with Node.js

1. **Configure environment variables:**
   ```bash
   cp .example.env .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run database migrations and seed baseline data:**
   ```bash
   # Run pending migrations:
   npm run migrate

   # Seed baseline records using Data Factories:
   npm run seed
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Verify the running instance:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   # Returns: {"status":"ok"}

   # View Alumni REST API
   curl http://localhost:3000/api/users
   
   # View Announcements REST API
   curl http://localhost:3000/api/announcements

   # Arithmetic utility
   curl http://localhost:3000/sum/10/25
   # Returns: toplam= 35
   ```

4. **Access web interfaces in your browser:**
   - **Unified Portal Landing:** [http://localhost:3000/](http://localhost:3000/)
   - **Alumni Directory:** [http://localhost:3000/users](http://localhost:3000/users)
   - **Announcements Dashboard:** [http://localhost:3000/announcements](http://localhost:3000/announcements)
   - **Career & Job Postings Board:** [http://localhost:3000/jobs](http://localhost:3000/jobs)
   - **Applications Dashboard:** [http://localhost:3000/applications](http://localhost:3000/applications)
   - **Generic 404 Diagnostic Screen:** [http://localhost:3000/404](http://localhost:3000/404)
   - **Interactive Swagger Docs:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)

### Running with Docker Compose

1. **Start the services in detached mode:**
   ```bash
   docker compose up -d --build
   ```

2. **View running container logs (and persistent `logs/error.logs`):**
   ```bash
   docker compose logs -f web
   # Local / container persistent request & guardian log file:
   tail -f logs/error.logs
   ```

3. **Stop and remove containers:**
   ```bash
   docker compose down
   ```

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive automated test suite built with the native Node.js test runner (`node:test` and `node:assert`):

### Running All Tests:
```bash
npm test
```

### Running Specific Test Suites:
```bash
# Model & Factory Unit Tests
node --test test/user.model.test.js
node --test test/announcement.model.test.js
node --test test/jobPosting.model.test.js
node --test test/application.model.test.js
node --test test/factories.test.js

# Controller & View Tests
node --test test/controllers.test.js
node --test test/announcement.controller.test.js
node --test test/views.test.js

# Authentication, RBAC & Role Navigation Tests
node --test test/auth.middleware.test.js
node --test test/nav.test.js

# Middleware, Logging & Error Guardian Tests
node --test test/logger.middleware.test.js
node --test test/logWriter.middleware.test.js
node --test test/notFoundGuardian.middleware.test.js
node --test test/serverErrorGuardian.middleware.test.js

# Route & Integration Tests
node --test test/routes.test.js
node --test test/announcement.routes.test.js
node --test test/jobPosting.routes.test.js
node --test test/application.routes.test.js
node --test test/index.test.js
```

---

## 📖 API Documentation (Swagger)

All REST API endpoints are documented with interactive OpenAPI 3.0 specifications:

- **Interactive Swagger UI:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **Raw OpenAPI JSON Spec:** [http://localhost:3000/api/swagger.json](http://localhost:3000/api/swagger.json)

> ⚠️ **Swagger Maintenance Rule (Zorunlu Güncelleme Kuralı)**  
> Bu projeye eklenen veya güncellenen her yeni API route'u, parametreleri, request body alanları ve response formatı için **`swagger.json` (`/api/swagger`) eşzamanlı olarak güncellenmelidir**.

---

## 📁 Project Directory Tree

```text
alumni/
├── controllers/                     # Controller Layer (Request handling & orchestration)
│   ├── AdminController.js           # Web & REST Controller for Administration Console
│   ├── AnnouncementController.js    # Web Controller for Announcements UI
│   ├── ApiAnnouncementController.js # RESTful JSON API Controller for Announcements
│   ├── ApiApplicationController.js   # RESTful JSON API Controller for Applications (Direct & Nested)
│   ├── ApiJobPostingController.js   # RESTful JSON API Controller for Jobs (Direct & Nested)
│   ├── ApiUserController.js         # RESTful JSON API Controller for Users
│   ├── ApplicationController.js     # Web Controller for Applications UI
│   ├── JobPostingController.js      # Web Controller for Job Postings
│   └── UserController.js            # Web Controller for Alumni UI & Auth Pages
├── factories/                       # Data Factory Layer (Test data & seed generators)
│   ├── AnnouncementFactory.js       # Generates announcement mock records
│   ├── ApplicationFactory.js        # Generates job application mock records
│   ├── JobPostingFactory.js         # Generates career and job posting mock records
│   ├── UserFactory.js               # Generates alumni user mock records
│   └── index.js                     # Factory module aggregator
├── logs/                            # Persistent runtime & error telemetry logs
│   └── error.logs                   # Dual-sink request telemetry, 404 & 5xx logs
├── middleware/                      # Observability & Error Guardian Middleware Pipeline
│   ├── auth.js                      # Authentication, session cookies & RBAC guards
│   ├── guardianShared.js            # Shared route hints, HTML escaping, content negotiation
│   ├── index.js                     # Middleware barrel exports
│   ├── logWriter.js                 # Dual-sink terminal + logs/error.logs writer
│   ├── logger.js                    # Request telemetry middleware ([ISO] METHOD route ...)
│   ├── notFoundGuardian.js          # Generic /404 handler, invalid-web redirect & API 404 JSON
│   └── serverErrorGuardian.js       # Structured 5xx diagnosis & Incident ID tracking
├── migrations/                      # Database Migration Layer (PostgreSQL SQL DDL/DML)
│   ├── 001_create_tables.sql        # Creates users, announcements, indexes, triggers
│   ├── 002_seed_data.sql            # Seeds initial users and announcements
│   ├── 003_create_job_postings_table.sql # Creates job_postings, foreign keys, triggers
│   └── 004_create_applications_table.sql # Creates applications action table & composite indexes
├── models/                          # Model Layer (Domain logic, pg.Pool & in-memory stores)
│   ├── Announcement.js              # AnnouncementModel singleton (PostgreSQL & fallback)
│   ├── Application.js               # ApplicationModel singleton (PostgreSQL & fallback)
│   ├── JobPosting.js                # JobPostingModel singleton (PostgreSQL & fallback)
│   ├── User.js                      # UserModel singleton (PostgreSQL & fallback)
│   ├── db.js                        # Centralized PostgreSQL connection pool (pg.Pool)
│   └── index.js                     # Centralized models aggregator export
├── public/                          # Static web assets
│   ├── about.html                   # Static About page
│   └── index.html                   # Static Home page
├── routes/                          # Routing Layer (Path mapping & HTTP verbs)
│   ├── admin.js                     # Administration Console Web routes (/admin)
│   ├── announcement.js              # Announcements Web routes (/announcements)
│   ├── announcementRoutes.js        # Announcement alias route module
│   ├── apiAdmin.js                  # Administration REST routes (/api/admin)
│   ├── apiAnnouncement.js           # Announcements REST routes (/api/announcements)
│   ├── apiAnnouncementRoutes.js     # ApiAnnouncement alias route module
│   ├── apiApplication.js            # Application REST routes (Direct & Nested)
│   ├── apiApplicationRoutes.js       # ApiApplication alias route module
│   ├── apiJobPosting.js             # Job REST routes (Direct /api/jobs & Nested /api/users/:id/jobs)
│   ├── apiJobPostingRoutes.js       # ApiJobPosting alias route module
│   ├── apiUser.js                   # Users REST routes (/apiuser, /api/users)
│   ├── apiUserRoutes.js             # ApiUser alias route module
│   ├── application.js               # Applications Web routes (/applications)
│   ├── applicationRoutes.js          # Application alias route module
│   ├── index.js                     # Central router aggregator
│   ├── jobPosting.js                # Job Web routes (/jobs)
│   ├── jobPostingRoutes.js          # JobPosting alias route module
│   ├── user.js                      # Users Web routes (/user, /users, /users/:id/jobs)
│   └── userRoutes.js                # User alias route module
├── scripts/                         # Automation & database operational scripts
│   ├── migrate.js                   # SQL migration runner (npm run migrate)
│   └── seed.js                      # Database seeder using factories (npm run seed)
├── test/                            # Automated test suite (node:test)
│   ├── announcement.controller.test.js
│   ├── announcement.model.test.js
│   ├── announcement.routes.test.js
│   ├── application.model.test.js
│   ├── application.routes.test.js
│   ├── auth.middleware.test.js
│   ├── controllers.test.js
│   ├── factories.test.js
│   ├── index.test.js
│   ├── jobPosting.model.test.js
│   ├── jobPosting.routes.test.js
│   ├── logWriter.middleware.test.js
│   ├── logger.middleware.test.js
│   ├── nav.test.js
│   ├── notFoundGuardian.middleware.test.js
│   ├── routes.test.js
│   ├── serverErrorGuardian.middleware.test.js
│   ├── user.model.test.js
│   └── views.test.js
├── views/                           # View Layer (HTML templates & View helpers)
│   ├── 404.html                     # Generic diagnostic 404 HTML template
│   ├── AdminView.js                 # Helper rendering administration dashboard
│   ├── AnnouncementView.js          # Helper rendering announcement templates
│   ├── ApplicationView.js           # Helper rendering application templates
│   ├── JobPostingView.js            # Helper rendering job posting templates
│   ├── NotFoundView.js              # Helper rendering /404 generic error template
│   ├── UserView.js                  # Helper rendering user templates
│   ├── admin.html                   # Central administration console template
│   ├── announcementDetail.html      # Announcement detail card template
│   ├── announcementEdit.html        # Announcement edit form template
│   ├── announcements.html           # Announcements management dashboard template
│   ├── applicationDetail.html       # Candidate application review template
│   ├── applications.html            # Job applications dashboard template
│   ├── jobDetail.html               # Job opportunity detail & application form template
│   ├── jobEdit.html                 # Job opportunity edit form template
│   ├── jobs.html                    # Career board & job postings dashboard template
│   ├── login.html                   # Member portal authentication template
│   ├── navHelper.js                 # Central role-based dynamic navigation generator
│   ├── register.html                # Member registration & onboarding template
│   ├── userDetail.html              # Alumni profile & personal workspace template
│   ├── userEdit.html                # Alumni edit form template
│   └── users.html                   # Alumni directory list & form template
├── .example.env                     # Environment variable template (committed)
├── .env                             # Local environment secrets (git-ignored)
├── .dockerignore                    # Excludes secrets and node_modules from images
├── .gitignore                       # Git exclusions (ignores .env)
├── brand.md                         # Brand Identity, Purpose & Platform Vision Guide (Istanbul University)
├── design.md                        # UI Design System & Component Specification (Refero / Awesome-Design-MD)
├── ddd.md                           # Comprehensive Data Design Documentation
├── docker-compose.yml               # Container orchestration configuration
├── Dockerfile                       # Container image build manifest
├── index.js                         # Application entrypoint & Express bootstrap
├── package.json                     # NPM dependencies & test scripts
├── README.md                        # Primary architectural & operational manual
└── swagger.json                     # OpenAPI 3.0 specification
```

---

## 🤖 AI Agent & Developer Contribution Rules

To ensure total code quality, consistency, and compliance across human developers and autonomous AI coding agents:

1. **Strict Data Design (`ddd.md`) Adherence:**
   - Any modification or addition to entity structures, attributes, default values, or relational bindings MUST be updated first or concurrently in [`ddd.md`](./ddd.md).
2. **Synchronous Swagger Documentation:**
   - Whenever an API route is added or modified in `routes/` or `controllers/`, [`swagger.json`](./swagger.json) MUST be updated in the same change set.
3. **Strict MVC Separation:**
   - Controllers must never store state or perform direct array mutations; all data interactions must route through the respective Model method.
   - Views must never invoke models directly; they receive parsed context from controllers.
4. **Decoupled Persistence:**
   - Maintain the singleton pattern for Model classes until the PostgreSQL driver is explicitly connected.
5. **Clean Git Hygiene:**
   - Never stage, commit, or push changes unless explicitly instructed by the project owner.
