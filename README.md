# TechStore — E-commerce project (NestJS + React + MySQL)

A learning-oriented full-stack starter for a final-project submission. It includes a NestJS REST API, React + React-Bootstrap frontend, MySQL schema/seed data, JWT authentication, product search/filtering, cart, orders, and project documentation.

## Important
- This is a starter implementation, not proof that the project has passed testing or been deployed.
- Change the development JWT secret and database credentials before any real deployment.
- Payment processing is intentionally not implemented; orders use a demo checkout flow.
- Admin role must be assigned deliberately in the database. Never expose an admin registration endpoint.

## Prerequisites
- Node.js 20+
- MySQL 8+
- npm

## 1. Database
Create a database and load the schema:
```bash
mysql -u root -p < database/init.sql
```
The SQL creates `techstore` and inserts demo products. Set `DB_*` environment variables in `backend/.env`.

## 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```
API base URL: `http://localhost:3000/api`

## 3. Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite (normally `http://localhost:5173`).

## Demo accounts
No plaintext demo account is seeded. Register through the UI, then promote a user to admin only in a local development database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```
Sign out and sign in again to receive a token with the updated role.

## Project layout
- `backend/`: NestJS API, TypeORM entities, JWT auth, product/cart/order endpoints
- `frontend/`: React UI with React-Bootstrap
- `database/`: schema and demo products
- `docs/`: user stories, UML, wireframe, API, testing, report outline

## Before submission
1. Run the project locally and fix environment-specific issues.
2. Add screenshots and real test evidence to `docs/Testing.md`.
3. Add your own GitHub repository URL, commit history, demo link and report details.
4. Do not claim tests/deployment passed unless you have actually run them.
