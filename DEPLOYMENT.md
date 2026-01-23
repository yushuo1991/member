# Deployment (Server + GitHub Actions)

This repo deploys the **Next.js app in `member-system/`** to a Linux server using **PM2** and **Nginx**, triggered by **GitHub Actions**.

## One-time server setup

1) **Create a dedicated deploy user (recommended)** and install prerequisites:

- Node.js (LTS), npm
- PM2 (`npm i -g pm2`)
- Nginx
- MySQL (if you use the DB-backed API routes)

2) **Prepare app directory** (example path used by the workflow):

- Create `/opt/member-system`
- Make sure the deploy user can write to it
- Create `/opt/member-system/.env` from `member-system/.env.example` (do not commit secrets)

3) **Initialize database (if applicable)**

- Run one of: `member-system/database-init.sql`, `member-system/database-init-v3.sql`, `member-system/database-init-v2.1-FIXED.sql`
- Confirm `.env` DB settings match the schema you picked

4) **Configure Nginx reverse proxy**

- Use `ops/nginx-member-system.conf` as a starting point
- Reload: `sudo nginx -t && sudo systemctl reload nginx`

## GitHub Actions auto-deploy

Workflow: `.github/workflows/deploy-member-system.yml`

It rsyncs `member-system/` to the server (excluding `.env`) and then runs:
- `npm ci`
- `npm run build`
- `pm2 startOrReload ecosystem.config.js --env production`

### Required GitHub Secrets

Create these in **GitHub → Settings → Secrets and variables → Actions**:

- `DEPLOY_HOST`: server IP / hostname
- `DEPLOY_USER`: SSH user (prefer a non-root deploy user)
- `DEPLOY_SSH_KEY`: private key for that user (ed25519 recommended)

Optional (defaults are shown):
- `DEPLOY_PORT`: `22`
- `DEPLOY_PATH`: `/opt/member-system`

## Notes

- Keep `.env` **only on the server**; the workflow will not overwrite it.
- If you change runtime port, update both `member-system/ecosystem.config.js` and Nginx.
