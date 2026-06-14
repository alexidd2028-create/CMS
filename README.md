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

## API overview

- `POST /api/auth/register` / `POST /api/auth/login`
- `GET/POST /api/content-types`, `PUT/DELETE /api/content-types/:id` (admin only for write)
- `GET/POST /api/entries/:contentType`, `GET/PUT/DELETE /api/entries/:contentType/:id`
