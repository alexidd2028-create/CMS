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

## API overview

- `POST /api/auth/register` / `POST /api/auth/login`
- `GET/POST /api/content-types`, `PUT/DELETE /api/content-types/:id` (admin only for write)
- `GET/POST /api/entries/:contentType`, `GET/PUT/DELETE /api/entries/:contentType/:id`
