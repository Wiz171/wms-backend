# Role-Based User Management Backend

This is the backend for a role-based user management system, built with Node.js, Express, and MongoDB. It provides RESTful APIs for user, product, customer, order, and task management, with robust role-based access control (RBAC).

## Features
- User authentication with JWT
- Role-based access control (Super Admin, Manager, User)
- CRUD APIs for users, products, customers, orders, and tasks
- Dashboard statistics and stock endpoints
- Rate limiting, input validation, and security best practices
- EJS views for basic user management UI

## Project Structure
```
backend/
  server.js                # Main server entry point
  config.env               # Environment variables
  package.json             # Dependencies and scripts
  server/
    controller/            # Route controllers
    database/              # MongoDB connection
    middleware/            # Auth, RBAC, validation, rate limiting
    model/                 # Mongoose models
    routes/                # Express routers
    scripts/               # DB seeding and test user scripts
    utils/                 # Utility functions
  services/                # EJS view renderers
  views/                   # EJS templates
  assets/                  # Static assets (CSS, JS)
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or remote)

### Installation
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment variables in `config.env`:
   ```env
   PORT=8080
   MONGO_URI=mongodb://127.0.0.1:27017/test_RBAC
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```
3. (Optional) Seed roles and create test users:
   ```bash
   node server/scripts/seedRolePermissions.js
   node server/scripts/createTestUser.js
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   The server will run at http://localhost:8080

## API Overview
- All API routes are prefixed with `/api` and require JWT authentication.
- Role-based permissions are enforced for all endpoints.

### Auth
- `POST /login` — User login, returns JWT

### Users
- `GET /api/users` — List users
- `POST /api/users` — Create user
- `PUT/PATCH /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user
- `GET /api/users/me` — Get current user info and permissions

### Products, Customers, Orders, Tasks
- Standard CRUD endpoints under `/api/products`, `/api/customers`, `/api/orders`, `/api/tasks`

### Dashboard
- `GET /api/dashboard/stats` — Get dashboard statistics
- `GET /api/dashboard/tasks` — Get dashboard tasks
- `GET /api/dashboard/stock` — Get stock info

## Role-Based Access Control (RBAC)
- **superadmin**: Full access to all modules
- **manager**: Manage most modules, limited user management
- **user**: Read-only access to most modules
- Permissions are defined in `server/middleware/rbac.js` and can be seeded in the database

## EJS Views
- Basic user management UI available at `/` (for demo/testing)

## Scripts
- `server/scripts/seedRolePermissions.js` — Seed default role permissions
- `server/scripts/createTestUser.js` — Create test and superadmin users
- `hash-passwords.js`, `update-users.js`, `check-user.js` — Utility scripts for user management

## Security
- Uses Helmet, CORS, rate limiting, and input sanitization
- Passwords are hashed with bcrypt
- JWT secrets must be kept safe

## License
MIT

---
*Generated on May 25, 2025*
