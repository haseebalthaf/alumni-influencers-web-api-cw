# Alumni Influencers

A web app for University of Westminster alumni. Verified alumni place blind monthly bids to be featured as the **Alumnus of the Day** on a public-facing API. Admins manage API tokens and trigger / observe winner selection. Anyone with a server-side API token (or a logged-in session) can hit the analytics endpoints to see aggregate stats over the alumni network.

> **Stack at a glance:** Node 22 · Express 4 · MongoDB / Mongoose 7 · vanilla-JS frontend (no bundler) · Chart.js 4 · Swagger UI · node-cron · Nodemailer

---

## Quick start

### 1. Prerequisites

- **Node 22.x** (a `.nvmrc` is provided — `nvm use` will pick the right version)
- **MongoDB 6+** running somewhere you can connect to (local, Atlas, etc.)
- *Optional:* an SMTP account if you want real verification + password-reset emails. Without one, the API just returns the verification/reset URL in the response — fine for development.

### 2. Install

```bash
git clone <this repo>
cd alumni-influencers-web-api-cw
nvm use            # optional: align Node version
npm install
```

### 3. Configure

```bash
cp .env.example .env
$EDITOR .env       # fill in MONGODB_URI, JWT_SECRET, etc.
mkdir -p uploads   # multer writes profile images here
```

Every variable in `.env.example` is documented inline; key ones are summarised in [Environment variables](#environment-variables) below.

### 4. Run

```bash
npm run dev        # nodemon, auto-reload on save
# or
npm start          # plain node
```

Then open:

| URL                                  | What it is                                              |
|--------------------------------------|---------------------------------------------------------|
| http://localhost:3000/login.html     | Frontend login                                          |
| http://localhost:3000/register.html  | New user signup (`@my.westminster.ac.uk` only)          |
| http://localhost:3000/dashboard.html | Charts + analytics (after login)                        |
| http://localhost:3000/api-docs       | Interactive Swagger UI for the entire API               |
| http://localhost:3000/api-docs.json  | Raw OpenAPI 3 spec (for Postman, codegen, etc.)         |
| http://localhost:3000/api/health     | Liveness probe — `{ status: "OK", timestamp }`          |

If the server starts cleanly you'll see:

```
🚀 Server running on port 3000
📚 API Documentation: http://localhost:3000/api-docs
🌐 Frontend: http://localhost:3000/index.html
```

---

## What you can do with it

### As an alumnus (`role: alumni`)
- Sign up with a `@my.westminster.ac.uk` email and verify via the link
- Fill in your profile (degrees, certifications, licences, courses, employment history, sponsorships)
- Place a blind monthly bid; raise it (only-up rule); cancel it
- See dashboard analytics
- Get featured as Alumnus of the Day if your bid wins

### As an admin (`role: admin`)
- Issue, list, update, and revoke server-side API tokens with scoped permissions
- View per-token usage stats
- Manually trigger a winner selection (handy for testing — see `?forToday=true`)

### As an API consumer (server-to-server)
Use a token created by an admin via `POST /api/admin/tokens` to call:
- `GET /api/bidding/today-winner` — current featured alumnus (needs `read:alumni_of_day`)
- `GET /api/bidding/tomorrow-slot` — preview of tomorrow's pick
- `GET /api/analytics/*` — aggregate stats (needs `read:analytics`)
- `GET /api/profile/*` — alumni directory (needs `read:alumni`)

Send the token as `Authorization: Bearer <token>`.

---

## Environment variables

Full inline documentation lives in [`.env.example`](./.env.example). The short version:

| Var               | Required | Default                  | Purpose                                                            |
|-------------------|----------|--------------------------|--------------------------------------------------------------------|
| `MONGODB_URI`     | yes      | —                        | Mongo connection string                                            |
| `JWT_SECRET`      | yes      | —                        | JWT signing secret — **rotate this in production**                 |
| `JWT_EXPIRE`      | no       | `7d`                     | JWT lifetime (`jsonwebtoken` syntax: `15m`, `2h`, `7d`, …)         |
| `PORT`            | no       | `3000`                   | Express port                                                       |
| `BASE_URL`        | no       | `http://localhost:3000`  | Used to build absolute URLs in emails                              |
| `CLIENT_URL`      | no       | `http://localhost:3000`  | Allowed CORS origin (with credentials)                             |
| `NODE_ENV`        | no       | unset                    | `development` enables verbose error responses + nodemailer logs    |
| `EMAIL_HOST`      | no       | —                        | SMTP host (omit and the API returns the verify/reset URL inline)   |
| `EMAIL_PORT`      | no       | `587`                    | SMTP port (`465` enables implicit TLS)                             |
| `EMAIL_USER`      | no       | —                        | SMTP user / from-address                                           |
| `EMAIL_PASS`      | no       | —                        | SMTP password / app password                                       |
| `EMAIL_FROM_NAME` | no       | `Alumni Influencers`     | Friendly display name in the From header                           |
| `UPLOAD_PATH`     | yes      | —                        | Local folder for profile-image uploads (must exist + be writable)  |

### Generating a `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Bootstrapping an admin user

There is no admin signup flow — admins exist only by direct DB edit. After you've registered + verified an alumnus you want to promote:

```bash
mongosh "$MONGODB_URI"
> db.users.updateOne(
    { email: 'you@my.westminster.ac.uk' },
    { $set: { role: 'admin' } }
  )
```

Log out and back in (the role is read at login time and cached in `localStorage` so the sidebar can hide alumni-only pages from admins).

---

## Project layout

```
.
├── server.js                  # entrypoint: connect DB, schedule cron, listen
├── app.js                     # Express app: middleware, routes, error handlers
├── config/
│   ├── database.js            # mongoose.connect()
│   └── swagger.js             # OpenAPI spec + reusable schemas
├── routes/                    # routes/<resource>.js, JSDoc-documented
├── controllers/               # HTTP handlers
├── middleware/
│   ├── auth.js                # JWT-only protect/isAlumni/isAdmin
│   ├── apiAuth.js             # JWT *or* API-token + permission check
│   └── validation.js          # express-validator chains
├── models/                    # Mongoose schemas (system of record)
├── services/
│   ├── winnerService.js       # core winner-selection logic
│   └── winnerScheduler.js     # node-cron registration
├── public/                    # static frontend (HTML + per-page JS)
├── shared/                    # cross-page assets, mounted at /shared
├── docs/
│   ├── architecture.md        # component & request flow diagrams
│   ├── database-schema.md     # ER diagram + per-collection reference
│   └── analytics-charts.md    # how each dashboard chart is populated
├── .env.example               # documented configuration template
└── README.md                  # you are here
```

For more detail on any of these, start with [`docs/architecture.md`](./docs/architecture.md).

---

## Common tasks

### Run with auto-reload
```bash
npm run dev
```

### Inspect the API
Open `/api-docs` in a browser. Hit "Authorize" and paste either a JWT (from `POST /api/auth/login`) or a server-side API token. The "Try it out" panel will then exercise endpoints with that credential.

### Trigger a manual winner selection
```bash
# As admin:
curl -X POST http://localhost:3000/api/admin/select-winner \
     -H "Authorization: Bearer <admin-jwt>"
# Add ?forToday=true for testing
```

In production the scheduled cron at **18:00 UTC daily** does this for you. See `services/winnerScheduler.js`.

### Reset the database
```bash
mongosh "$MONGODB_URI"
> db.dropDatabase()
```
The schema is recreated implicitly on first write.

---

## Documentation index

- [`docs/architecture.md`](./docs/architecture.md) — component diagrams, request flow, scaling boundaries
- [`docs/database-schema.md`](./docs/database-schema.md) — ER diagram, per-collection field reference, indexes
- [`docs/analytics-charts.md`](./docs/analytics-charts.md) — how each dashboard chart is computed end-to-end
- `/api-docs` — live OpenAPI / Swagger UI (run the server first)

---

## Troubleshooting

**Server crashes on boot with `Database connection error`**
`MONGODB_URI` is wrong, the database is unreachable, or the user lacks permissions. The server intentionally `process.exit(1)`s in this case (`config/database.js`) — fix the URI and restart.

**Charts on the dashboard are empty / show "No data available"**
You need at least a few alumni profiles with certifications, employment history, etc. Either register some test users and fill in their profiles, or seed Mongo directly. The aggregations are documented in `docs/analytics-charts.md`.

**Email verification link never arrives**
SMTP isn't configured. Check the API response from `POST /api/auth/register` — it falls back to returning the URL directly. Set `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASS` to actually send mail.

**`429 Too Many Requests`**
Global rate limit (100 req / 15 min / IP). Restart the server to clear the in-memory counter, or wait it out.

**Profile images return 404**
`UPLOAD_PATH` must exist and be writable. The path is resolved relative to the process's working directory.

**Admin sees the Bidding link in the sidebar**
The role is cached in `localStorage` at login. Log out and back in once after promoting a user to `admin`.
