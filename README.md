# Force Tree Assignment

A simple full-stack application for viewing and searching a hierarchical force structure.

## Overview

The system works with a PostgreSQL `forces` table that represents a tree of military units.

Each force has:

- `id` - unique identifier
- `parent_id` - parent force identifier
- `name` - force name
- `force_type` - force type
- `is_deleted` - logical deletion flag

A force with `parent_id = NULL` is considered a root node.

The application does not load the entire tree at once. It loads only the root forces first, and then loads children only when the user expands a specific node.

## Project Structure

```txt
server/
  src/
    routes/          API routes
    services/        Database queries and tree logic
    db.ts            PostgreSQL connection pool
    app.ts           Express app setup
    index.ts         Server entry point

client/
  src/
    api/             API calls from the frontend
    components/      Tree and search components
    App.tsx          Main application component
```

## How It Works

### Tree Loading

The frontend first calls:

```txt
GET /api/forces/roots
```

This returns only the root forces.

When a user expands a force in the tree, the frontend calls:

```txt
GET /api/forces/:id/children
```

This keeps memory usage low and supports large hierarchical datasets.

### Search

The search API supports searching by:

- `name`
- `force_type`

Endpoint:

```txt
GET /api/forces/search?q=<search-text>
```

Each search result includes the full path from the root force to the matched force, so the frontend can open the relevant branch in the tree.

## Setup

### 1. Database

Create a PostgreSQL database named:

```txt
forces_db
```

Restore the provided PostgreSQL backup into this database.

After restore, verify the table exists:

```sql
SELECT COUNT(*) FROM public.forces;
```

### 2. Server

Create a `.env` file inside the `server` folder:

```env
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=forces_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Install dependencies and start the server:

```bash
cd server
npm install
npm run dev
```

The server runs on:

```txt
http://localhost:4000
```

Health check:

```txt
http://localhost:4000/health
```

### 3. Client

Install dependencies and start the client:

```bash
cd client
npm install
npm run dev
```

The client runs on:

```txt
http://localhost:5173
```

## Main API Endpoints

```txt
GET /health
GET /api/forces/roots
GET /api/forces/:id/children
GET /api/forces/search?q=<search-text>
```

## Notes

- The tree is loaded incrementally.
- The frontend avoids requesting the same node children more than once.
- Search is performed in PostgreSQL, not in the browser.
- Deleted forces are filtered using `is_deleted = false`.
