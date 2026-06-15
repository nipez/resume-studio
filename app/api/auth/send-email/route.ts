import { handleSendEmailHook } from "@/lib/email/send-email-hook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleSendEmailHook(request);
}
