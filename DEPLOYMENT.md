# Deployment Preparation

## Backend Environment

Required:

- `PORT`: Provided by the host, or `5000` locally.
- `MONGO_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Strong random secret for signing user sessions.
- `CLIENT_URL`: Deployed frontend origin, for example `https://your-app.vercel.app`. Use a comma-separated list only if multiple frontend origins are needed.
- `NODE_ENV`: `production` in deployment.

Optional:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `ALLOW_RAZORPAY_DEV_STUB=false`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_PHONE`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

Razorpay remains disabled when keys are missing unless `ALLOW_RAZORPAY_DEV_STUB=true` in non-production.

## Frontend Environment

Required for production:

- `VITE_API_URL=https://your-backend.example.com/api`
- `VITE_SOCKET_URL=https://your-backend.example.com`

Optional:

- `VITE_RAZORPAY_KEY_ID`

## Hosting Notes

Frontend:

- Build command: `npm run build`
- Publish directory: `dist`
- Copy `client/.env.production.example` to the deployment provider's environment settings and replace the backend URL values.
- Vercel: `client/vercel.json` rewrites all routes to `index.html`.
- Netlify: `client/netlify.toml` rewrites all routes to `index.html`.

Backend:

- Start command: `npm start`
- Health check: `/api/health`
- Copy `server/.env.production.example` to the deployment provider's environment settings and replace all secrets/placeholders.
- Socket.io shares the same backend HTTPS origin.
- Render: `render.yaml` includes a backend web service blueprint with Socket.io-compatible Node hosting.
- MongoDB Atlas must allow the deployment provider's outbound IP, or temporarily `0.0.0.0/0` with strong database credentials.

## Production Smoke Checklist

- `/api/health` returns `200`.
- Frontend loads over HTTPS.
- Direct refresh works for `/admin/dashboard`, `/delivery/orders/:id`, and `/track-order/:id`.
- Customer can register/login and place COD/UPI order.
- Admin can see and update the order.
- Admin can assign delivery boy.
- Delivery boy can see assigned order.
- Delivery boy can start live tracking from a real phone over HTTPS.
- Customer and admin receive live location updates.
- Delivery status delivered stops tracking.
- Manifest, icons, service worker, offline page, and install prompt pass browser checks.
