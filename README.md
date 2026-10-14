# 🎓 Alumni Tracking System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0_Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)](http://localhost:3000/api/swagger)
[![Architecture](https://img.shields.io/badge/Architecture-MVC_Pattern-blueviolet?style=flat)](#-mvc-model-view-controller-architecture)
[![Data Design](https://img.shields.io/badge/Documentation-DDD_Specification-orange?style=flat)](./ddd.md)

A modular, production-ready alumni tracking and management web application designed to organize, search, publish announcements for, and manage university alumni profiles and records.

---

## 📑 Table of Contents

- [💻 Tech Stack & Languages](#-tech-stack--languages)
- [📚 Data Design & Architecture Documentation (DDD)](#-data-design--architecture-documentation-ddd)
- [🏛️ MVC (Model-View-Controller) Architecture](#️-mvc-model-view-controller-architecture)
  - [1. 🚦 Routing Layer (`routes/`)](#1--routing-layer-routes)
  - [2. ⚙️ Controller Layer (`controllers/`)](#2-️-controller-layer-controllers)
  - [3. 📦 Model Layer (`models/`)](#3--model-layer-models)
  - [4. 🖥️ View Layer (`views/` & Presentation)](#4-️-view-layer-views--presentation)
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

## 📚 Data Design & Architecture Documentation (DDD)

A dedicated, comprehensive data architecture specification is maintained in **[`ddd.md`](./ddd.md)**:

👉 **[Read the Full Data Design Documentation (ddd.md)](./ddd.md)**

### Key Highlights Covered in `ddd.md`:
1. **Domain Entities:** Exact schema definitions, constraints, defaults, and JSON payloads for [`UserModel`](./models/User.js) and [`AnnouncementModel`](./models/Announcement.js).
2. **Entity-Relationship Diagram (ERD):** Visualized entity models and logical relationships.
3. **In-Memory Store Architecture & Lifecycle:** Heap allocation, singleton pattern, and concurrency characteristics.
4. **The Forgetting Test Analysis:** Comprehensive technical evaluation of data volatility during container recreation.
5. **Model CRUD Contracts:** TypeScript-style signatures for all data access methods (`create`, `findAll`, `findById`, `update`, `delete`).
6. **MVC Veri Akışı (Sequence Diagrams):** Visualized lifecycles for RESTful JSON API requests and Server-Side HTML Form submissions.
7. **PostgreSQL Migration Blueprint:** Complete SQL DDL schemas (`CREATE TABLE users`, `CREATE TABLE announcements`), B-Tree index strategies, automated `updated_at` triggers, and Docker Compose persistent volume (`pgdata`) setup.
8. **Validation, Sanitization & Security Rules:** Form sanitization, regex patterns, XSS prevention, and error status mappings.
9. **AI Agent Query & Reference Matrix:** Rapid lookup table for machine agents mapping domain actions to routes, controllers, and models.

---

## 🏛️ MVC (Model-View-Controller) Architecture

The application strictly implements the **Model-View-Controller (MVC)** design pattern, augmented by dedicated Routing and View Engine layers:

```mermaid
flowchart TD
    Client["Client (Browser / Postman / cURL)"]
    
    subgraph Routing ["Routing Layer (routes/)"]
        AppIndex["Express App (index.js)"]
        UserRouter["user Router (routes/user.js) -> /user, /users"]
        ApiUserRouter["apiUser Router (routes/apiUser.js) -> /apiuser, /api/users"]
        AnnounceRouter["announcement Router (routes/announcement.js) -> /announcements"]
        ApiAnnounceRouter["apiAnnouncement Router (routes/apiAnnouncement.js) -> /api/announcements"]
    end

    subgraph Controller ["Controller Layer (controllers/)"]
        UserCtrl["UserController (Web / View Layer)"]
        ApiUserCtrl["ApiUserController (RESTful JSON API)"]
        AnnounceCtrl["AnnouncementController (Management Interface)"]
        ApiAnnounceCtrl["ApiAnnouncementController (RESTful JSON API)"]
        UtilHandlers["Utility Handlers (/health, /hello, /sum)"]
    end
    
    subgraph Model ["Model Layer (models/)"]
        UserModel["UserModel (models/User.js - DB & In-Memory CRUD)"]
        AnnounceModel["AnnouncementModel (models/Announcement.js - DB & In-Memory CRUD)"]
        DBPool["Database Connection Pool (models/db.js - pg.Pool)"]
        PostgresDB[("PostgreSQL 16 (Docker pgdata Volume)")]
        MemoryStore[("In-Memory Mock Store (Fallback)")]
    end
    
    subgraph View ["View Layer (Presentation)"]
        UserViews["User Views (views/users.html, userDetail.html, userEdit.html)"]
        AnnounceViews["Announcement Views (views/announcements.html, detail, edit)"]
        SwaggerView["Interactive Swagger UI (/api/swagger)"]
        JSONView["JSON API Responses (Content-Type: application/json)"]
    end

    Client -->|HTTP Request| AppIndex
    AppIndex --> UserRouter
    AppIndex --> ApiUserRouter
    AppIndex --> AnnounceRouter
    AppIndex --> ApiAnnounceRouter
    AppIndex --> UtilHandlers
    UserRouter --> UserCtrl
    ApiUserRouter --> ApiUserCtrl
    AnnounceRouter --> AnnounceCtrl
    ApiAnnounceRouter --> ApiAnnounceCtrl
    UserCtrl -->|Async CRUD Operations| UserModel
    ApiUserCtrl -->|Async CRUD Operations| UserModel
    AnnounceCtrl -->|Async CRUD Operations| AnnounceModel
    ApiAnnounceCtrl -->|Async CRUD Operations| AnnounceModel
    UserModel --> DBPool
    AnnounceModel --> DBPool
    DBPool --> PostgresDB
    UserModel -.->|Fallback if DB offline| MemoryStore
    AnnounceModel -.->|Fallback if DB offline| MemoryStore
    UserCtrl -->|Render HTML / View Helper| UserViews
    AnnounceCtrl -->|Render HTML / View Helper| AnnounceViews
    ApiUserCtrl -->|Render JSON| JSONView
    ApiAnnounceCtrl -->|Render JSON| JSONView
    UtilHandlers --> SwaggerView
    UtilHandlers --> JSONView
    UserViews -->|HTTP Response (HTML)| Client
    AnnounceViews -->|HTTP Response (HTML)| Client
    SwaggerView -->|HTTP Response (HTML)| Client
    JSONView -->|HTTP Response (JSON)| Client
```

### 1. 🚦 Routing Layer (`routes/`)
Routes decouple URLs and HTTP methods from controller execution:
- **`routes/user.js` (`/user`, `/users`)**: Bound to [`UserController`](./controllers/UserController.js) for full SSR web interface navigation.
- **`routes/apiUser.js` (`/apiuser`, `/api/users`)**: Bound to [`ApiUserController`](./controllers/ApiUserController.js) for RESTful JSON operations.
- **`routes/announcement.js` (`/announcements`)**: Bound to [`AnnouncementController`](./controllers/AnnouncementController.js) for the web management dashboard.
- **`routes/apiAnnouncement.js` (`/api/announcements`)**: Bound to [`ApiAnnouncementController`](./controllers/ApiAnnouncementController.js) for JSON API consumption.
- **`routes/index.js`**: Central router aggregation module.

### 2. ⚙️ Controller Layer (`controllers/`)
Controllers handle request parsing, invoke model domain logic asynchronously (`await`), format responses, and route output to views:
- **[`controllers/UserController.js`](./controllers/UserController.js)**: Asynchronous web controller for alumni directory, profile detail views, edit forms, creation, and redirection with flash query params.
- **[`controllers/ApiUserController.js`](./controllers/ApiUserController.js)**: Asynchronous RESTful controller returning semantic HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- **[`controllers/AnnouncementController.js`](./controllers/AnnouncementController.js)**: Asynchronous controller for web dashboard, detail cards, edit views, creation, updates, and deletion redirects.
- **[`controllers/ApiAnnouncementController.js`](./controllers/ApiAnnouncementController.js)**: Asynchronous RESTful controller for announcements (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Utility Controllers (in `index.js`)**: Handles `/api/health`, greetings (`/hello`), and arithmetic (`/sum`).

### 3. 📦 Model Layer (`models/`)
The **Model** encapsulates all domain state, validation, and data mutations with asynchronous interfaces connected to PostgreSQL and resilient in-memory fallback:
- **[`models/db.js`](./models/db.js)**: Centralized PostgreSQL connection pool using `pg.Pool`, configuring dynamic connection strings (`process.env.DATABASE_URL`), `allowExitOnIdle: true` (ensuring clean test suite termination), and graceful error logging.
- **[`models/User.js`](./models/User.js) (`UserModel`)**: Asynchronous singleton repository implementing `create`, `findAll`, `findById`, `update`, and `delete`. Executes parameterized SQL queries against `users`, handles column aliasing (`graduation_year AS "graduationYear"`), `ON CONFLICT (email)` safety, and falls back to in-memory arrays when running offline.
- **[`models/Announcement.js`](./models/Announcement.js) (`AnnouncementModel`)**: Asynchronous singleton repository implementing `create`, `findAll`, `findById`, `update`, and `delete`. Executes parameterized SQL queries against `announcements`, formats date timestamps (`YYYY-MM-DD`), and provides seamless fallback.

> 💡 *Ayrıntılı veri tasarımı, CRUD kontratları, PostgreSQL şemaları ve ER diyagramı için [Data Design Documentation (ddd.md)](./ddd.md) dokümanını inceleyin.*

### 4. 🖥️ View Layer (`views/` & Presentation)
The presentation layer separates visual structure from application control:
- **User Views:**
  - `views/users.html`: Alumni Directory table with Search/Create/Edit/Delete actions.
  - `views/userDetail.html`: Individual alumni profile card.
  - `views/userEdit.html`: Pre-populated edit form.
  - `views/UserView.js`: HTML rendering engine helper for user templates.
- **Announcement Views:**
  - `views/announcements.html`: Management dashboard table and publishing form.
  - `views/announcementDetail.html`: Full announcement detail card.
  - `views/announcementEdit.html`: Pre-populated announcement edit form.
  - `views/AnnouncementView.js`: HTML rendering engine helper for announcement templates.
- **Static Pages:** Stored in `public/` ([`index.html`](./public/index.html), [`about.html`](./public/about.html)).
- **API Documentation:** Interactive Swagger UI rendered at `/api/swagger`.

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
- **[`factories/index.js`](./factories/index.js)**: Aggregates all model factories.
- **[`scripts/seed.js`](./scripts/seed.js)**: High-speed seeder executing `UserFactory.create()` and `AnnouncementFactory.create()` to populate the database with parameterized batch inserts.

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

### ⚡ RESTful JSON API Routes

| Endpoint | Method | Controller Action | Expected Payload | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Utility | None | `200 OK` (`{"status":"ok"}`) |
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
   - **Alumni Directory:** [http://localhost:3000/users](http://localhost:3000/users)
   - **Announcements Dashboard:** [http://localhost:3000/announcements](http://localhost:3000/announcements)
   - **Interactive Swagger Docs:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)

### Running with Docker Compose

1. **Start the services in detached mode:**
   ```bash
   docker compose up -d --build
   ```

2. **View running container logs:**
   ```bash
   docker compose logs -f web
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
node --test test/factories.test.js

# Controller Tests
node --test test/controllers.test.js
node --test test/announcement.controller.test.js

# Route & Integration Tests
node --test test/routes.test.js
node --test test/announcement.routes.test.js
node --test test/index.test.js
node --test test/views.test.js
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
│   ├── AnnouncementController.js    # Web Controller for Announcements UI
│   ├── ApiAnnouncementController.js # RESTful JSON API Controller for Announcements
│   ├── ApiUserController.js         # RESTful JSON API Controller for Users
│   └── UserController.js            # Web Controller for Alumni UI
├── factories/                       # Data Factory Layer (Test data & seed generators)
│   ├── AnnouncementFactory.js       # Generates announcement mock records
│   ├── UserFactory.js               # Generates alumni user mock records
│   └── index.js                     # Factory module aggregator
├── migrations/                      # Database Migration Layer (PostgreSQL SQL DDL/DML)
│   ├── 001_create_tables.sql        # Creates users, announcements, indexes, triggers
│   └── 002_seed_data.sql            # Seeds initial users and announcements
├── models/                          # Model Layer (Domain logic, pg.Pool & in-memory stores)
│   ├── Announcement.js              # AnnouncementModel singleton (PostgreSQL & fallback)
│   ├── User.js                      # UserModel singleton (PostgreSQL & fallback)
│   └── db.js                        # Centralized PostgreSQL connection pool (pg.Pool)
├── public/                          # Static web assets
│   ├── about.html                   # Static About page
│   └── index.html                   # Static Home page
├── routes/                          # Routing Layer (Path mapping & HTTP verbs)
│   ├── announcement.js              # Announcements Web routes (/announcements)
│   ├── apiAnnouncement.js           # Announcements REST routes (/api/announcements)
│   ├── apiUser.js                   # Users REST routes (/apiuser, /api/users)
│   ├── index.js                     # Central router aggregator
│   └── user.js                      # Users Web routes (/user, /users)
├── scripts/                         # Automation & database operational scripts
│   ├── migrate.js                   # SQL migration runner (npm run migrate)
│   └── seed.js                      # Database seeder using factories (npm run seed)
├── test/                            # Automated test suite (node:test)
│   ├── announcement.controller.test.js
│   ├── announcement.model.test.js
│   ├── announcement.routes.test.js
│   ├── controllers.test.js
│   ├── factories.test.js
│   ├── index.test.js
│   ├── routes.test.js
│   ├── user.model.test.js
│   └── views.test.js
├── views/                           # View Layer (HTML templates & View helpers)
│   ├── AnnouncementView.js          # Helper rendering announcement templates
│   ├── UserView.js                  # Helper rendering user templates
│   ├── announcementDetail.html      # Announcement detail card template
│   ├── announcementEdit.html        # Announcement edit form template
│   ├── announcements.html           # Announcements management dashboard template
│   ├── userDetail.html              # Alumni profile card template
│   ├── userEdit.html                # Alumni edit form template
│   └── users.html                   # Alumni directory list & form template
├── .example.env                     # Environment variable template (committed)
├── .env                             # Local environment secrets (git-ignored)
├── .dockerignore                    # Excludes secrets and node_modules from images
├── .gitignore                       # Git exclusions (ignores .env)
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
