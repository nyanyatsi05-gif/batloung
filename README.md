# Batloung Farm Distribution System

React (Vite) frontend + Express/MySQL backend.

## Setup (Windows PowerShell)
1. Create the database (drops/recreates `batloung_farm_db`, loads sample data):
   `mysql -u root -p -e "source database/schema.sql"`
2. Backend:
   `cd backend` -> copy `.env.example` to `.env` and set DB_PASSWORD and JWT_SECRET
   `npm install` -> `node createUsers.js` -> `npm run dev`   (http://localhost:5000)
3. Frontend (second terminal): `cd frontend` -> `npm install` -> `npm run dev`

## Structure (backend)
config/ (MySQL pool + transactions), routes/, controllers/, models/, middleware/, db.js, server.js

## Key endpoints (all need a login token)
- Suppliers/Fruits/Vendors/Stock CRUD: /api/suppliers, /api/fruits, /api/vendors, /api/stock
- GET /api/stock/low?threshold=10 | GET /api/vendors/search?q= | GET /api/vendors/balances
- POST /api/purchases, POST /api/sales (atomic: all items succeed or everything rolls back)
- POST /api/payments (CASH, MOBILE MONEY, BANK TRANSFER) -> PAID / PARTIALLY_PAID / UNPAID
- GET /api/advanced-reports/{top-fruits,revenue,highest-volume-vendor,stock-by-packaging}
- SQL reports: database/reports.sql
