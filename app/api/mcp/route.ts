import { createMcpHandler } from "mcp-handler";
import {
  agentUserFromAuth,
} from "@/lib/mcp/auth";
import { withAgentKeyAuth } from "@/lib/mcp/with-agent-auth";
import { runAsUser } from "@/lib/auth/run-as-user";
import {
  draftCoverLetter,
  draftCoverLetterSchema,
  exportAndTrack,
  exportAndTrackSchema,
  getDefaultResume,
  getDefaultResumeSchema,
  tailorForJob,
  tailorForJobSchema,
  updateResume,
  updateResumeSchema,
} from "@/lib/mcp/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Deep tailor + cover + export can exceed the default serverless limit. */
export const maxDuration = 300;

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_default_resume",
      {
        title: "Get default resume",
        description:
          "Return the user's default/master resume id and structured content from the ResumeTrakr library.",
        inputSchema: getDefaultResumeSchema,
      },
      async (_args, ctx) => {
        const user = agentUserFromAuth(ctx.http?.authInfo);
        if (!user) {
          return {
            isError: true,
            content: [{ type: "text", text: "Unauthorized" }],
          };
        }
        return runAsUser(user, () => getDefaultResume());
      }
    );

    server.registerTool(
      "tailor_for_job",
      {
        title: "Tailor resume for job",
        description:
          "Clone the default resume and run the product deep-tailor flow for a job. Pass job_url, or title/company/description. Returns the new tailored resume id and content. Does not invent credentials, employers, or dates.",
        inputSchema: tailorForJobSchema,
      },
      async (args, ctx) => {
        const user = agentUserFromAuth(ctx.http?.authInfo);
        if (!user) {
          return {
            isError: true,
            content: [{ type: "text", text: "Unauthorized" }],
          };
        }
        try {
          return await runAsUser(user, () => tailorForJob(args));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Tailor failed.";
          return {
            isError: true,
            content: [{ type: "text", text: message }],
          };
        }
      }
    );

    server.registerTool(
      "draft_cover_letter",
      {
        title: "Draft cover letter",
        description:
          "Generate and save a cover letter for a tailored resume using the product cover-letter flow. Pass resume_version_id from tailor_for_job; job fields are optional if the resume already stores job context.",
        inputSchema: draftCoverLetterSchema,
      },
      async (args, ctx) => {
        const user = agentUserFromAuth(ctx.http?.authInfo);
        if (!user) {
          return {
            isError: true,
            content: [{ type: "text", text: "Unauthorized" }],
          };
        }
        try {
          return await runAsUser(user, () => draftCoverLetter(args));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Cover letter failed.";
          return {
            isError: true,
            content: [{ type: "text", text: message }],
          };
        }
      }
    );

    server.registerTool(
      "export_and_track",
      {
        title: "Export PDFs and track application",
        description:
          "Export print-ready resume and cover letter files to storage, log one tracked application with a resume snapshot, and return signed export URLs plus the application URL. One job = one tailored resume + one cover + one application.",
        inputSchema: exportAndTrackSchema,
      },
      async (args, ctx) => {
        const user = agentUserFromAuth(ctx.http?.authInfo);
        if (!user) {
          return {
            isError: true,
            content: [{ type: "text", text: "Unauthorized" }],
          };
        }
        try {
          return await runAsUser(user, () => exportAndTrack(args));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Export/track failed.";
          return {
            isError: true,
            content: [{ type: "text", text: message }],
          };
        }
      }
    );

    server.registerTool(
      "update_resume",
      {
        title: "Update resume data",
        description:
          "Persist structured ResumeData onto an existing resume version owned by the authenticated user (e.g. after a section rewrite). Pass resume_version_id and the full data object.",
        inputSchema: updateResumeSchema,
      },
      async (args, ctx) => {
        const user = agentUserFromAuth(ctx.http?.authInfo);
        if (!user) {
          return {
            isError: true,
            content: [{ type: "text", text: "Unauthorized" }],
          };
        }
        try {
          return await runAsUser(user, () => updateResume(args));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Update resume failed.";
          return {
            isError: true,
            content: [{ type: "text", text: message }],
          };
        }
      }
    );
  },
  {
    serverInfo: {
      name: "resumetrakr",
      version: "1.0.0",
    },
    instructions:
      "ResumeTrakr apply-loop tools. Typical order: get_default_resume → tailor_for_job → (optional update_resume) → draft_cover_letter → export_and_track. Never invent credentials, employers, or dates — only use facts from the user's resume and the job posting.",
  }
);

const handler = withAgentKeyAuth(mcpHandler);

export { handler as GET, handler as POST, handler as DELETE, handler as OPTIONS };
