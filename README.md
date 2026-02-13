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

3. Start command:

```bash
npm start
```

This serves both UI and API from one domain.

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
