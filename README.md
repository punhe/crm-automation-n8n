# RepairShopr Revenue Console

An internal Next.js 16 app for operating a simple CRM and invoice recovery workflow on top of RepairShopr.

## What this MVP does

- Reads customers from RepairShopr
- Reads paid or unpaid invoices from RepairShopr
- Shows a recovery queue grouped by reminder stage
- Resends native invoice emails through RepairShopr
- Sends custom reminder emails through SMTP
- Lists n8n workflows with publish or pause controls
- Falls back to demo data when RepairShopr credentials are not configured
- Uses Clerk to protect all internal routes

## Screens included

- `/` overview dashboard
- `/customers` searchable customer directory
- `/invoices` invoice list with resend action
- `/recovery` email-first billing follow-up console
- `/workflows` n8n workflow management console

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

- `REPAIRSHOPR_SUBDOMAIN`
- `REPAIRSHOPR_API_KEY`
- `REPAIRSHOPR_MAX_PAGES`
- `APP_CURRENCY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `N8N_BASE_URL`
- `N8N_API_KEY`
- `N8N_WEBHOOK_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If Clerk keys are configured, unauthenticated users are redirected to `/sign-in`.

## Notes

- This is an internal-ops MVP, not a public multi-user CRM.
- Server-side actions can resend invoice emails and send reminder emails, so keep the app behind auth before deployment.
- Clerk now handles app authentication. The old HTTP Basic Auth layer has been removed.
- The dashboard intentionally avoids Slack and stays focused on Email + RepairShopr only.
- Public RepairShopr docs paginate invoices by page, so the dashboard uses a configurable `REPAIRSHOPR_MAX_PAGES` cap to stay API-safe.
- `N8N_BASE_URL` and `N8N_API_KEY` power the in-app workflows screen, including publish or pause controls and recent execution visibility.

## Useful commands

```bash
npm run lint
npm run build
```
