# Deploying the org directory → workforce.synergitech.co.in

This app runs on the **same server** as BenchTime/SynergiTech, as its **own
compose stack** — exactly like OPT-ATS (`optm.`) and ATS India (`atsindia.`).
The bench_time Caddy keeps terminating HTTPS for everything; it reaches this
app over a shared Docker network.

```
GoDaddy DNS ── workforce.synergitech.co.in ──▶ server IP
                                                │
                                   benchtime-caddy (HTTPS)
                                                │  workforce-edge network
                                   workforce-app (Next.js :3000)
                                                │  this stack's own network
                                   workforce-postgres
```

## 1. On the server — create the shared network (once)

```bash
docker network create workforce-edge
```

## 2. Get the code and configure secrets

```bash
cd /opt
git clone https://github.com/rugvailabs/Work-Force.git
cd Work-Force
cp deploy/.env.example .env
nano .env
```

Fill in the two values (generate with `openssl rand -hex 16` and
`openssl rand -hex 32`).

## 3. Start the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First boot creates the database from `db/schema.sql` automatically (tables,
starter departments, default admin). Check health:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app   # Ctrl+C to stop
```

## 4. Wire it into the bench_time Caddy

In the **bench_time** repo (`/opt/bench_time` or wherever it lives), two small
edits:

**`deploy/Caddyfile`** — add a site block:

```caddyfile
# Org directory — a SEPARATE app (its own repo, DB and login) running in its
# own compose stack from /opt/Work-Force. Reachable via the shared external
# `workforce-edge` network; workforce-app is its Next.js server.
workforce.{$DOMAIN} {
	reverse_proxy workforce-app:3000
}
```

**`docker-compose.prod.yml`** — let Caddy join the network. Under the `caddy`
service's `networks:` add `- workforce-edge`, and under the top-level
`networks:` add:

```yaml
  workforce-edge:
    external: true
```

Commit both edits — the compose change is what keeps the network attachment
across future bench_time deploys (`auto-deploy.sh` / `up -d --build` recreate
the caddy container from the compose file).

Then activate **without recreating Caddy** — a live attach + graceful reload,
so the four existing sites are never bounced (same zero-downtime approach the
ATS India install used):

```bash
docker network connect workforce-edge benchtime-caddy
docker exec benchtime-caddy caddy validate --config /etc/caddy/Caddyfile
docker exec benchtime-caddy caddy reload --config /etc/caddy/Caddyfile
```

(If `network connect` says the endpoint already exists, the running container
already has the network — fine, continue with validate + reload.)

## 5. Point the domain (GoDaddy)

GoDaddy → synergitech.co.in → **DNS** → add:

| Type | Name        | Value (points to) |
|------|-------------|-------------------|
| A    | `workforce` | `<server IP>`     |

Once DNS propagates, Caddy auto-issues the certificate and
https://workforce.synergitech.co.in goes live.

## 6. Change the default admin password

The schema seeds `admin` / `orgadmin2026` (and it's public on GitHub). Rotate
it immediately:

```bash
cd /opt/Work-Force
# 1) generate a scrypt hash for the new password
docker compose -f docker-compose.prod.yml exec app node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(process.argv[1],s,64).toString('hex'))" 'NEW_PASSWORD'
# 2) store it
docker compose -f docker-compose.prod.yml exec postgres psql -U orgdirectory -d orgdirectory -c "UPDATE admins SET password_hash = '<paste hash>' WHERE username = 'admin';"
```

## Everyday commands

```bash
# Update to the latest code
cd /opt/Work-Force && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Stop / start
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Back up the database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U orgdirectory orgdirectory > backup.sql
```
