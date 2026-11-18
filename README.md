# Bitnbin Organization Directory

A staff directory for the whole organization — from the CEO to support staff —
built with Next.js, PostgreSQL and Tailwind CSS.

## How it works

- **Public form** (`/`) — share this one link with all employees. They tap
  "Add my details", fill in a short mobile-friendly form (no login needed), and
  their submission lands in the admin's pending queue.
- **Admin dashboard** (`/admin`) — login-protected. The admin reviews pending
  submissions, approves/edits/removes people, links managers that employees
  typed by name, browses the org chart, searches and filters the full list, and
  exports everything to CSV (opens in Excel).

## Stack

- Next.js (App Router, TypeScript, server actions)
- PostgreSQL (hosted on Neon; any Postgres works — just change `DATABASE_URL`)
- Tailwind CSS v4 with a custom design system
- `pg` with plain SQL — no ORM

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Configuration lives in `.env.local`:

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — random hex string used to sign admin session cookies

## Admin login

- URL: `/admin`
- Username: `admin`
- Password: `orgadmin2026`

**Change this password** before sharing the app. Generate a new hash and update
the `admins` table:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync('NEW_PASSWORD',s,64).toString('hex'))"
```

```sql
UPDATE admins SET password_hash = '<output>' WHERE username = 'admin';
```

## Database schema

- `departments` — department list
- `employees` — one row per person; `status` is `pending` until approved;
  `reports_to_id` links to their manager, or `reports_to_name` holds a typed
  name until the admin links it
- `work_assigners` — who gives each person their day-to-day work (many per
  person; linked by id or kept as a typed name until resolved)
- `admins` — dashboard users (scrypt-hashed passwords)

Approving a person auto-links anyone who typed that person's name as their
manager or work-giver.

The database is seeded with ~16 sample employees (two of them pending) so every
screen has realistic data. Delete them from the `employees` table when going
live.
