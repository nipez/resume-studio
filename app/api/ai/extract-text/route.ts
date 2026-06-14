import { requireAIUser } from "@/lib/ai/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAIUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let parser: { getText: () => Promise<{ text?: string }>; destroy: () => Promise<void> } | null = null;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { PDFParse } = await import("pdf-parse");
    parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    const text = parsed.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json(
        { error: "Could not extract text from PDF — paste the text instead." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Could not read PDF — paste the text instead." },
      { status: 422 }
    );
  } finally {
    await parser?.destroy().catch(() => {});
  }
}
