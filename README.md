# Restaurant Caterer PWA

Clean starter structure for a restaurant and catering Progressive Web App.

This scaffold intentionally includes only folder structure, route wiring, placeholders, and API skeletons. It does not implement the full UI, backend business logic, payments, order flow, or role-selection screens.

## Project Areas

- `client/` - React with Vite frontend.
- `client/src/customer/` - Public customer PWA pages, customer layout, customer-only bottom navigation, and customer components.
- `client/src/admin/` - Admin dashboard layout, pages, and dashboard components under `/admin`.
- `client/src/delivery/` - Delivery panel layout, pages, and delivery components under `/delivery`.
- `client/src/auth/` - Shared login/register placeholders and protected route structure.
- `client/src/context/` - Context API placeholders for auth and cart state.
- `client/src/services/` - API service placeholders for future backend integration.
- `client/public/` - PWA files including manifest, service worker, offline page, icons, and public images.
- `server/` - Node.js, Express.js, MongoDB, Mongoose, and JWT API skeleton.
- `server/models/` - Shared MongoDB data models for users, menu items, orders, catering bookings, payments, and delivery staff.
- `server/controllers/` - Placeholder controllers for future API logic.
- `server/routes/` - Express route files grouped by domain.
- `server/middleware/` - Auth, admin role, delivery role, and error middleware placeholders.

## Routing Structure

Customer public routes:

- `/`
- `/menu`
- `/food/:id`
- `/catering`
- `/login`
- `/register`

Customer protected routes:

- `/cart`
- `/checkout`
- `/order-success`
- `/track-order/:id`
- `/my-orders`
- `/profile`

Admin routes start with `/admin` and use `AdminLayout`.

Delivery routes start with `/delivery` and use `DeliveryLayout`.

The customer layout does not include admin or delivery links. The customer bottom navigation only includes Home, Menu, Catering, Orders, and Profile.

## PWA Setup

PWA placeholders are located in `client/public/`:

- `manifest.json`
- `service-worker.js`
- `offline.html`
- `icons/icon-192.png`
- `icons/icon-512.png`

The icon files are placeholders only and should be replaced with real PNG assets later.

## Getting Started Later

Install and run the client:

```bash
cd client
npm install
npm run dev
```

Install and run the server:

```bash
cd server
npm install
npm run dev
```

Create `server/.env` from `server/.env.example` before running the API.
