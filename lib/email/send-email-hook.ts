import { Webhook } from "standardwebhooks";
import {
  authEmailSubject,
  buildAuthVerifyUrl,
  buildMagicLinkEmailHtml,
  sendAuthEmailViaResend,
  type AuthEmailAction,
} from "@/lib/email/auth-email";

type SendEmailHookPayload = {
  user: {
    email: string;
    new_email?: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: AuthEmailAction;
    site_url: string;
  };
};

const LINK_ACTIONS = new Set<AuthEmailAction>([
  "magiclink",
  "signup",
  "recovery",
  "invite",
  "email",
  "email_change",
]);

export async function handleSendEmailHook(request: Request): Promise<Response> {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!secret) {
    return Response.json(
      { error: "SEND_EMAIL_HOOK_SECRET is not configured" },
      { status: 503 }
    );
  }

  if (!supabaseUrl) {
    return Response.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL is not configured" },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let data: SendEmailHookPayload;
  try {
    const wh = new Webhook(secret);
    data = wh.verify(payload, headers) as SendEmailHookPayload;
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const { user, email_data } = data;
  const action = email_data.email_action_type;
  const to = user.email;

  if (!to) {
    return Response.json({ error: "Missing recipient email" }, { status: 400 });
  }

  const confirmationUrl = buildAuthVerifyUrl({
    supabaseUrl,
    tokenHash: email_data.token_hash,
    emailActionType: action,
    redirectTo: email_data.redirect_to,
  });

  const html = buildMagicLinkEmailHtml({
    confirmationUrl,
    action,
    otpToken: LINK_ACTIONS.has(action) ? undefined : email_data.token,
  });

  try {
    await sendAuthEmailViaResend({
      to,
      subject: authEmailSubject(action),
      html,
    });
  } catch (error) {
    console.error("send-email hook:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send auth email",
      },
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
