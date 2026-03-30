# RepairShopr Revenue Console

An internal Next.js 16 app for operating a simple CRM and invoice recovery workflow on top of RepairShopr.

## What this MVP does

- Reads customers from RepairShopr
- Reads paid or unpaid invoices from RepairShopr
- Shows a recovery queue grouped by reminder stage
- Resends native invoice emails through RepairShopr
- Sends custom reminder emails through SMTP
- Falls back to demo data when RepairShopr credentials are not configured

## Screens included

- `/` overview dashboard
- `/customers` searchable customer directory
- `/invoices` invoice list with resend action
- `/recovery` email-first billing follow-up console

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

- `REPAIRSHOPR_SUBDOMAIN`
- `REPAIRSHOPR_API_KEY`
- `REPAIRSHOPR_MAX_PAGES`
- `APP_CURRENCY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `APP_BASIC_AUTH_USER`
- `APP_BASIC_AUTH_PASSWORD`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If `APP_BASIC_AUTH_USER` and `APP_BASIC_AUTH_PASSWORD` are set, the app will ask for HTTP Basic Auth before loading.

## Notes

- This is an internal-ops MVP, not a public multi-user CRM.
- Server-side actions can resend invoice emails and send reminder emails, so keep the app behind auth before deployment.
- The dashboard intentionally avoids Slack and stays focused on Email + RepairShopr only.
- Public RepairShopr docs paginate invoices by page, so the dashboard uses a configurable `REPAIRSHOPR_MAX_PAGES` cap to stay API-safe.

## Useful commands

```bash
npm run lint
npm run build
```
