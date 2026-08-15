import { createServiceClient } from "@/lib/supabase/server";
import { buildCoverHTML } from "@/lib/resume/build-cover-html";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import type { ResumeVersion } from "@/lib/resume/db-types";

const BUCKET = "generated-pdfs";

async function ensureBucket() {
  const supabase = createServiceClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
  });
  // Race / already-exists is fine.
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new Error(`Could not create ${BUCKET} storage bucket: ${error.message}`);
  }
}

async function uploadExport(
  userId: string,
  applicationId: string,
  filename: string,
  body: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const supabase = createServiceClient();
  const path = `${userId}/${applicationId}/${filename}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Export upload failed: ${error.message}`);

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError || !data?.signedUrl) {
    throw new Error(signError?.message ?? "Could not create signed export URL");
  }
  return data.signedUrl;
}

/**
 * Store print-ready HTML exports (same builders as the UI Print → PDF flow)
 * in the generated-pdfs bucket and return signed URLs.
 */
export async function exportResumeAndCover(input: {
  userId: string;
  applicationId: string;
  version: ResumeVersion;
  coverBody: string;
}): Promise<{ resumePdfUrl: string; coverPdfUrl: string }> {
  const resumeHtml = buildResumeHTML(
    {
      templateStyle: input.version.template_style,
      data: input.version.data,
    },
    { forPrint: true }
  );
  const coverHtml = buildCoverHTML(input.coverBody, {
    name: input.version.data.name,
    phone: input.version.data.phone,
    email: input.version.data.email,
    location: input.version.data.location,
  });

  const [resumePdfUrl, coverPdfUrl] = await Promise.all([
    uploadExport(
      input.userId,
      input.applicationId,
      "resume.html",
      resumeHtml,
      "text/html; charset=utf-8"
    ),
    uploadExport(
      input.userId,
      input.applicationId,
      "cover.html",
      coverHtml,
      "text/html; charset=utf-8"
    ),
  ]);

  return { resumePdfUrl, coverPdfUrl };
}
