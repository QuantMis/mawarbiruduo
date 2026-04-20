# Phase 8: Release Prep

Production readiness: environment configuration, build pipeline, deployment to VPS, domain and SSL, basic monitoring.

---

## 8.1 Environment Configuration

**Description:** Set up environment variable management for development, staging (optional), and production. Ensure all secrets are properly externalized and validated at startup.

**Acceptance criteria:**
- [ ] `.env.example` file with all required variables documented (no actual secrets)
- [ ] Required variables:
  - `DATABASE_URL` — MySQL connection string
  - `NEXTAUTH_SECRET` — session encryption key
  - `NEXTAUTH_URL` — canonical app URL
  - `NEXT_PUBLIC_WHATSAPP_NUMBER` — WhatsApp contact number
- [ ] App fails fast on startup if required env vars are missing (validation in `env.ts`)
- [ ] Zod-based env validation schema (server-side and public vars separated)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] Production `.env` values documented in a private deployment guide (not in repo)

**Technical notes:**
- Use `@t3-oss/env-nextjs` or manual Zod validation in `lib/env.ts`
- Separate `server` and `client` env schemas
- Import `env.ts` in root layout or `instrumentation.ts` to trigger early validation
- Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`

**Dependencies:** 1.x (Foundation)
**Estimate:** S

---

## 8.2 Production Build Pipeline

**Description:** Configure the Next.js production build process, verify it completes without errors, and set up a basic build script.

**Acceptance criteria:**
- [ ] `npm run build` (or `pnpm build`) completes without errors or warnings
- [ ] Build output is optimized: static pages pre-rendered, dynamic routes properly configured
- [ ] Public pages (`/`, `/pakej`) are statically generated at build time
- [ ] Dynamic pages (`/temujanji`, `/kalendar`) use ISR or SSR as appropriate
- [ ] Admin pages use SSR (not static, since they depend on session)
- [ ] Build size is reasonable (no unexpected large bundles)
- [ ] TypeScript strict mode passes with no type errors
- [ ] Linting passes with no errors

**Technical notes:**
- Verify `next.config.js` output mode: use `standalone` for VPS deployment
- `output: 'standalone'` creates a minimal Node.js server in `.next/standalone/`
- Check that Prisma client is included in standalone output
- Test production build locally: `npm run build && npm start`

**Dependencies:** All phases 1-7 complete
**Estimate:** S

---

## 8.3 Database Setup and Migration

**Description:** Set up the production MySQL database, run Prisma migrations, and seed the initial admin user.

**Acceptance criteria:**
- [ ] Production MySQL database created on VPS (or managed MySQL service)
- [ ] Prisma migrations applied to production database
- [ ] Seed script creates the initial admin user with hashed password
- [ ] Database connection verified from the VPS
- [ ] Backup strategy documented (manual mysqldump script or cron job)
- [ ] Database credentials stored securely (env vars, not in code)

**Technical notes:**
- `npx prisma migrate deploy` for production (not `prisma migrate dev`)
- Seed script: `npx prisma db seed` — must be idempotent (don't duplicate admin user)
- Create a simple backup script: `mysqldump -u user -p db_name > backup_$(date +%Y%m%d).sql`
- Consider setting up a daily cron job for backups

**Dependencies:** 8.1 (environment config)
**Estimate:** S

---

## 8.4 VPS Deployment

**Description:** Deploy the Next.js application to the VPS using PM2 for process management. Set up the deployment workflow for future updates.

**Acceptance criteria:**
- [ ] Application runs on VPS via PM2 (or Docker, if preferred)
- [ ] PM2 ecosystem config file (`ecosystem.config.js`) with proper settings
- [ ] App starts on server boot (PM2 startup configured)
- [ ] App restarts automatically on crash (PM2 default behavior)
- [ ] Node.js version on VPS matches development (use `nvm` or similar)
- [ ] Deployment script or documented manual deployment steps:
  1. `git pull` (or upload build)
  2. `npm install --production`
  3. `npx prisma migrate deploy`
  4. `npm run build`
  5. `pm2 restart mawarbiru`
- [ ] App is accessible on VPS IP at configured port (e.g., 3000)
- [ ] `uploads/` directory exists and is writable for pakej image uploads

**Technical notes:**
- PM2 config:
  ```js
  module.exports = {
    apps: [{
      name: 'mawarbiru',
      script: '.next/standalone/server.js',
      env: { PORT: 3000, NODE_ENV: 'production' }
    }]
  };
  ```
- If using `output: 'standalone'`, copy `public/` and `.next/static/` to `.next/standalone/`
- Alternative: Docker with `Dockerfile` based on Next.js official example
- Ensure file upload directory has correct permissions: `chmod 755 public/uploads/`

**Dependencies:** 8.1, 8.2, 8.3
**Estimate:** M

---

## 8.5 Domain and SSL Configuration

**Description:** Point the domain `mawarbiru.my` to the VPS and configure SSL with Let's Encrypt via Nginx reverse proxy.

**Acceptance criteria:**
- [ ] DNS A record points `mawarbiru.my` and `www.mawarbiru.my` to VPS IP
- [ ] Nginx installed and configured as reverse proxy to Next.js app (port 3000)
- [ ] SSL certificate obtained via Certbot (Let's Encrypt)
- [ ] HTTPS enforced: HTTP requests redirect to HTTPS (301)
- [ ] `www` subdomain redirects to apex domain (or vice versa — pick one)
- [ ] `NEXTAUTH_URL` updated to `https://mawarbiru.my`
- [ ] Nginx config includes:
  - Proxy pass to `localhost:3000`
  - WebSocket support (if needed for HMR in dev — production may not need)
  - Proper headers: `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`
  - Static file caching headers for `/_next/static/`
  - Gzip compression enabled

**Technical notes:**
- Nginx config location: `/etc/nginx/sites-available/mawarbiru`
- Certbot: `sudo certbot --nginx -d mawarbiru.my -d www.mawarbiru.my`
- Auto-renewal: Certbot sets up a cron job by default, verify with `certbot renew --dry-run`
- Consider increasing Nginx `client_max_body_size` for image uploads (e.g., `10M`)

**Dependencies:** 8.4 (app running on VPS)
**Estimate:** M

---

## 8.6 Basic Monitoring and Logging

**Description:** Set up minimal monitoring to know if the site goes down and basic logging for debugging production issues.

**Acceptance criteria:**
- [ ] Uptime monitoring: external ping check on `https://mawarbiru.my` (use free service like UptimeRobot or Better Stack)
- [ ] Alerts: notification (email or WhatsApp/Telegram) when site is down
- [ ] PM2 logs accessible: `pm2 logs mawarbiru` shows application stdout/stderr
- [ ] PM2 log rotation configured (prevent disk fill)
- [ ] Next.js error logging: unhandled errors logged to stdout (PM2 captures them)
- [ ] Basic health check endpoint: `GET /api/health` returns `{ status: "ok", timestamp }` (verifies app + DB connection)

**Technical notes:**
- UptimeRobot free tier: 50 monitors, 5-minute intervals — sufficient for a single site
- PM2 log rotation: `pm2 install pm2-logrotate`
- Health endpoint: simple API route that pings DB with `prisma.$queryRaw('SELECT 1')`
- Future enhancement: add Sentry or similar for structured error tracking (out of scope for MVP)

**Dependencies:** 8.4, 8.5
**Estimate:** S
