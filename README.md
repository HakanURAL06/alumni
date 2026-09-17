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
