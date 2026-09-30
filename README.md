# Alumni

A simple alumni tracking application designed to organize, search, and manage alumni profiles and records.

---

## 💻 Tech Stack & Languages

This application uses JavaScript across the full stack alongside a relational database:

- **Frontend — JavaScript**
  - **Role:** Client-side interface & user interaction.
  - **Specifics:** Powers dynamic UI rendering, DOM manipulation, form inputs/validations, and asynchronous API calls (`fetch`/`axios`) to search, filter, and display alumni profiles without full page reloads.

- **Backend — Node.js (JavaScript)**
  - **Role:** Server-side runtime environment & REST API.
  - **Specifics:** Manages server logic, routing, request parsing, authentication, business rules, and secure communication with the PostgreSQL database.

- **Database — PostgreSQL (SQL)**
  - **Role:** Relational database management system (RDBMS).
  - **Specifics:** Uses Structured Query Language (SQL) for schema definitions, data integrity constraints (primary/foreign keys), indexing, and executing transactional queries to reliably persist alumni records (e.g., graduation year, department, contact info, and employment history).

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)

### Running Locally with Node.js

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Verify the server:**
   Open [http://localhost:3000](http://localhost:3000) or run:
   ```bash
   curl http://localhost:3000/
   # Output: Temporary Home Page (HTML)

   curl http://localhost:3000/about
   # Output: About Page (HTML)

   curl http://localhost:3000/api/health
   # Output: {"status":"ok"}

   curl http://localhost:3000/api/swagger
   # Output: Swagger UI (HTML)

   curl http://localhost:3000/api/users
   # Output: [{"id":1,"name":"Hakan Ural",...}]

   curl http://localhost:3000/hello
   # Output: Hello World

   curl http://localhost:3000/hello/hakan
   # Output: Hello Hakan!

   curl http://localhost:3000/sum/3/5
   # Output: toplam= 8
   ```

---

## 📖 API Documentation (Swagger)

All available REST API endpoints are documented with interactive Swagger UI:

- **Swagger UI URL:** [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **OpenAPI 3.0 Specification (JSON):** [http://localhost:3000/api/swagger.json](http://localhost:3000/api/swagger.json)

> ⚠️ **ÖNEMLİ: Swagger Sürekli Güncellenmelidir (Swagger Maintenance Rule)**  
> Bu projeye eklenen veya güncellenen her yeni API route'u, parametreleri, gövdesi (request body) ve yanıt formatı için **Swagger dokümantasyonu (`swagger.json` / `/api/swagger`) sürekli ve eşzamanlı olarak güncellenmelidir**. Yapılan her API geliştirmesinde Swagger dokümantasyonunun güncel tutulması zorunludur.

### Running with Docker Compose

1. **Clone the repository and navigate to the project directory:**
   ```bash
   git clone https://github.com/HakanURAL06/alumni.git
   cd alumni
   ```

2. **Start the services:**
   Run the following command to build and spin up all containers (frontend, backend, database):
   ```bash
   docker compose up
   ```

   *Optional flags:*
   - **Run in the background (detached mode):**
     ```bash
     docker compose up -d
     ```
   - **Rebuild images before starting:**
     ```bash
     docker compose up --build
     ```

3. **Stop the services:**
   To stop and tear down running containers:
   ```bash
   docker compose down
   ```
