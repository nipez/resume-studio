# Branded magic-link email

By default, Supabase sends auth emails from its own mailer (`Supabase Auth`). To have sign-in emails come from **ResumeTrakr** with branded HTML, use one of the options below.

## Option A — Send Email hook + Resend (recommended for production)

This app includes a webhook at `/api/auth/send-email` that sends branded magic-link emails through [Resend](https://resend.com).

### 1. Resend

1. Create a Resend account and verify your domain (e.g. `resumetrakr.com`).
2. Create an API key.
3. Set Railway / `.env.local` variables:

| Variable | Example |
|---|---|
| `RESEND_API_KEY` | `re_...` |
| `AUTH_EMAIL_FROM` | `ResumeTrakr <noreply@resumetrakr.com>` |
| `SEND_EMAIL_HOOK_SECRET` | from Supabase hook settings |

### 2. Supabase (hosted project)

1. Open **Authentication → Hooks → Send Email**.
2. Enable the hook.
3. **HTTP endpoint:** `https://YOUR_APP_URL/api/auth/send-email`
4. Copy the generated **secret** into `SEND_EMAIL_HOOK_SECRET` on Railway.
5. Save. Supabase will stop using its default mailer for auth emails.

### 3. Redeploy

Redeploy the app so the new env vars are live, then send a test magic link from `/login`.

---

## Option B — Custom SMTP in Supabase (no app hook)

If you prefer not to use the webhook:

1. In Supabase: **Project Settings → Authentication → SMTP**.
2. Enable custom SMTP (Resend, SendGrid, Postmark, etc.).
3. Set **Sender name** to `ResumeTrakr` and **Sender email** to your verified address.
4. Under **Authentication → Email Templates → Magic Link**, paste the subject/body from `supabase/templates/magic_link.html` or customize in the dashboard.

Emails will use your SMTP From address but Supabase still renders the template unless you customize it in the dashboard.

---

## Local development

- **Mailpit** (default with `supabase start`): open `http://127.0.0.1:54324` after requesting a magic link.
- `supabase/config.toml` already points the magic-link template to `supabase/templates/magic_link.html` for a branded subject/body in Mailpit.
- To test the Resend hook locally, uncomment `[auth.hook.send_email]` in `config.toml`, set the three env vars, and use `http://host.docker.internal:3000/api/auth/send-email` as the hook URI.

---

## Files

| File | Purpose |
|---|---|
| `lib/email/auth-email.ts` | HTML template + Resend sender |
| `lib/email/send-email-hook.ts` | Webhook verification + dispatch |
| `app/api/auth/send-email/route.ts` | Supabase hook endpoint |
| `supabase/templates/magic_link.html` | Fallback template for SMTP / local Mailpit |
