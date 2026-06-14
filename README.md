# CMS

A minimal headless CMS with custom content types.

## Structure

- `server/` — Express + SQLite API (JWT auth, dynamic content types, entries CRUD)
- `client/` — React (Vite) admin panel

## Running

### Server

```sh
cd server
npm install
npm run dev   # http://localhost:4000
```

### Client

```sh
cd client
npm install
npm run dev   # http://localhost:5173
```

The first registered user becomes an admin (can create/edit/delete content types).
Subsequent users are editors (can manage entries).

## Deployment (Render + Supabase + Vercel)

1. **Database**: Create a free [Supabase](https://supabase.com) project. Copy the
   Postgres connection string (Project Settings → Database → Connection string,
   "Transaction" pooler URI recommended).
2. **Backend**: Deploy `server/` to [Render](https://render.com) (uses `render.yaml`).
   Set the `DATABASE_URL` env var to your Supabase connection string. The server
   creates its tables automatically on startup.
3. **Frontend**: Deploy the repo to [Vercel](https://vercel.com) (uses `vercel.json`,
   which builds `client/`). Set the `VITE_API_BASE` env var to
   `https://<your-render-service>.onrender.com/api`.

Because data lives in Supabase Postgres, redeploying or restarting the backend
never loses data.

### Media uploads (Supabase Storage)

1. In Supabase, go to **Storage** and create a bucket (e.g. `media`), set it to **public**.
2. Get your **Project URL** and **service_role key** from Project Settings → API.
3. On Render, set env vars:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_KEY` = the service_role key (keep secret, backend-only)
   - `SUPABASE_BUCKET` = bucket name (defaults to `media`)

`media`-type fields in the admin entry form let you upload an image file (or paste
a URL directly); the public site shows it as a card image and detail image.

## API overview

- `POST /api/auth/register` / `POST /api/auth/login`
- `GET/POST /api/content-types`, `PUT/DELETE /api/content-types/:id` (admin only for write)
- `GET/POST /api/entries/:contentType`, `GET/PUT/DELETE /api/entries/:contentType/:id`
- `POST /api/media/upload` — multipart file upload, returns `{ url }` (requires auth)
- Public (no auth, published only): `GET /api/public/content-types`,
  `GET /api/public/entries/:contentType`, `GET /api/public/entries/:contentType/:id`
