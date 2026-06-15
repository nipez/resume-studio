import { SITE_NAME, SITE_URL } from "@/lib/marketing/content";

export type AuthEmailAction =
  | "magiclink"
  | "signup"
  | "recovery"
  | "invite"
  | "email"
  | "email_change"
  | "reauthentication";

const SUBJECTS: Partial<Record<AuthEmailAction, string>> = {
  magiclink: `Sign in to ${SITE_NAME}`,
  signup: `Welcome to ${SITE_NAME}`,
  recovery: `Reset your ${SITE_NAME} password`,
  invite: `You're invited to ${SITE_NAME}`,
  email: `Sign in to ${SITE_NAME}`,
  email_change: `Confirm your new email for ${SITE_NAME}`,
  reauthentication: `Your ${SITE_NAME} verification code`,
};

export function authEmailSubject(action: AuthEmailAction): string {
  return SUBJECTS[action] ?? `Message from ${SITE_NAME}`;
}

export function buildAuthVerifyUrl(input: {
  supabaseUrl: string;
  tokenHash: string;
  emailActionType: string;
  redirectTo: string;
}): string {
  const params = new URLSearchParams({
    token: input.tokenHash,
    type: input.emailActionType,
    redirect_to: input.redirectTo,
  });
  return `${input.supabaseUrl.replace(/\/$/, "")}/auth/v1/verify?${params.toString()}`;
}

export function buildMagicLinkEmailHtml(input: {
  confirmationUrl: string;
  action: AuthEmailAction;
  otpToken?: string;
}): string {
  const { confirmationUrl, action, otpToken } = input;
  const isCode = action === "reauthentication" && otpToken;

  const headline = isCode
    ? "Your sign-in code"
    : action === "recovery"
      ? "Reset your password"
      : action === "invite"
        ? "You're invited"
        : `Sign in to ${SITE_NAME}`;

  const lead = isCode
    ? `Use this one-time code to finish signing in. It expires soon.`
    : action === "recovery"
      ? "We received a request to reset your password. Click below to choose a new one."
      : action === "invite"
        ? "You've been invited to create an account. Click below to accept."
        : `Click the button below to sign in to ${SITE_NAME}. This link expires in about an hour and works once.`;

  const ctaLabel = isCode
    ? otpToken
    : action === "recovery"
      ? "Reset password"
      : action === "invite"
        ? "Accept invitation"
        : "Sign in to ResumeTrakr";

  const ctaBlock = isCode
    ? `<p style="margin:24px 0 0;font-family:'SF Mono',Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:0.2em;color:#0E1116;">${otpToken}</p>`
    : `<a href="${confirmationUrl}" style="display:inline-block;margin-top:24px;background:#2F6BFF;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:11px;box-shadow:0 4px 14px rgba(47,107,255,0.32);">${ctaLabel}</a>`;

  const fallback = isCode
    ? ""
    : `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8A92A0;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${confirmationUrl}" style="color:#2F6BFF;word-break:break-all;">${confirmationUrl}</a></p>`;

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#F5F6F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0E1116;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F6F8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #E6E8EC;border-radius:16px;overflow:hidden;box-shadow:0 8px 26px rgba(15,17,22,0.07);">
            <tr>
              <td style="padding:28px 28px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#2F6BFF,#7A53FF);color:#fff;font-weight:700;font-size:18px;text-align:center;line-height:40px;">R</td>
                    <td style="padding-left:12px;font-size:16px;font-weight:700;letter-spacing:-0.02em;">${SITE_NAME}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 32px;">
                <h1 style="margin:0;font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;">${headline}</h1>
                <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#5A6573;">${lead}</p>
                ${ctaBlock}
                ${fallback}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 24px;border-top:1px solid #F0F1F4;font-size:12px;line-height:1.6;color:#8A92A0;">
                If you didn't request this email, you can safely ignore it.
                <br />
                <a href="${SITE_URL}" style="color:#2F6BFF;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendAuthEmailViaResend(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.AUTH_EMAIL_FROM ?? `ResumeTrakr <noreply@resumetrakr.com>`;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend error (${res.status}): ${body}`);
  }
}
