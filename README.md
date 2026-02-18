## Goodrich Farm App

### Local development

1. Install dependencies:

```bash
npm install
```

2. Start backend API server:

```bash
npm run dev:server
```

3. Start frontend dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and API on `http://localhost:5174`.

### Environment variables

Create a `.env` file from `.env.example`.

Required:

- `JWT_SECRET`
- `PORT` (defaults to `5174`)
- `NODE_ENV` (`development` or `production`)
- `APP_BASE_URL` (e.g. `http://localhost:5173` or your production URL)

SMTP (required for password reset emails):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Payment (Paypack):

- `PAYPACK_CLIENT_ID`
- `PAYPACK_CLIENT_SECRET`
- `PAYPACK_WEBHOOK_SECRET`
- `PAYPACK_WEBHOOK_MODE` (`production` or `development`)

Optional for production uploads (recommended):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

If Firebase Storage settings are missing, uploads are stored locally in `server/uploads`.

### Production build

```bash
npm run build
npm start
```

In production mode, backend serves the built frontend (`dist`) and SPA routes.

### Render (single service)

Use one Web Service for both frontend and backend.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Render environment variables (minimum):

- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `APP_BASE_URL=https://<your-render-url>`

If you want password reset emails, also set SMTP variables listed above.

### Firebase Storage deployment (single app)

Use one App Service for both frontend and backend.

1. Build before deploy:

```bash
npm install
npm run build
```

2. Set App Service settings:

- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `FIREBASE_PROJECT_ID=<firebase-project-id>`
- `FIREBASE_CLIENT_EMAIL=<service-account-email>`
- `FIREBASE_PRIVATE_KEY=<service-account-private-key-with-escaped-newlines>`
- `FIREBASE_STORAGE_BUCKET=<your-bucket-name>`
- `FIREBASE_USE_DB=true` (optional, enables Firestore data persistence)

3. Start command:

```bash
npm start
```

This serves both UI and API from one domain.

### Data persistence mode

Backend supports two data modes:

1. File mode (default)
- Data is stored in split JSON files under `server/data/`:
  - `users.json`, `customers.json`, `products.json`, `orders.json`,
  - `pendingPayments.json`, `passwordResets.json`, `announcements.json`, `messages.json`, `gallery.json`
- On first run, legacy `server/data.json` is automatically migrated to these files.

2. Firebase Firestore mode
- Enable with `FIREBASE_USE_DB=true` and Firebase credentials.
- Data is stored in Firestore collection `goodrich_data_parts` (one doc per data part).
- If Firestore is empty on first run, backend auto-seeds it from file data.

### Paypack webhook

Register this webhook URL in your Paypack dashboard:

```
https://goodrich-farm.web.app/api/paypack/webhook
```

For local testing, expose `http://localhost:5174` with a tunnel and use:

```
https://<your-tunnel-domain>/api/paypack/webhook
```

Local testing URLs:

```
App: http://localhost:5173
API: http://localhost:5174
Webhook: http://localhost:5174/api/paypack/webhook
```
