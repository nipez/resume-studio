import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { ExitViewAsFailedNotice } from "@/components/admin/exit-view-as-failed-notice";
import { getApplicationsList } from "@/lib/applications/actions";
import { computeInsights } from "@/lib/applications/insights";
import { getUserProfileContext } from "@/lib/profile/actions";
import { resolveFirstName } from "@/lib/profile/utils";
import { getLibraryData } from "@/lib/resume/actions";
import { getSavedJobsList } from "@/lib/saved-jobs/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [library, appsList, profile, savedJobs] = await Promise.all([
    getLibraryData(),
    getApplicationsList(),
    getUserProfileContext(),
    getSavedJobsList(),
  ]);

  const { applications, versionCounts } = appsList;
  const insights = computeInsights(applications);
  const versions = library.versions;
  const primaryVersionId =
    library.defaultVersionId ?? versions[0]?.id ?? null;
  const hasTailored = versions.some((v) => v.tailored_for);
  const firstName = resolveFirstName(library.userName);

  const recentVersions = versions.slice(0, 8).map((v) => ({
    id: v.id,
    name: v.name,
    updatedAt: v.updated_at,
    createdAt: v.created_at,
    tailoredLabel: v.tailored_for
      ? `${v.tailored_for.role ?? "Role"}${
          v.tailored_for.company ? ` @ ${v.tailored_for.company}` : ""
        }`
      : null,
  }));

  const prepCandidates = applications
    .filter((app) => !app.archived_at)
    .slice(0, 6)
    .map((app) => ({
      id: app.id,
      role: app.role,
      company: app.company,
      status: app.status,
      appliedAt: app.applied_at,
      hasPrep: Boolean(app.prep),
    }));

  return (
    <>
      <ExitViewAsFailedNotice />
      <DashboardHome
        firstName={firstName}
        persona={profile.persona}
        onboardingPersonaSet={profile.onboardingPersonaSet}
        isStudent={profile.isStudent}
        versionsCount={versions.length}
        applicationsCount={insights.stats.total}
        hasTailored={hasTailored}
        primaryVersionId={primaryVersionId}
        versions={versions}
        versionCounts={versionCounts}
        stats={{
          respRate: insights.stats.respRate,
          interviewRate: insights.interviewRate,
          offers: insights.stats.offerCount,
        }}
        upcoming={insights.upcoming.slice(0, 3)}
        suggestedFollowUps={insights.suggestedFollowUps.slice(0, 3)}
        recentVersions={recentVersions}
        savedJobs={savedJobs.slice(0, 6).map((job) => ({
          id: job.id,
          role: job.role,
          company: job.company,
        }))}
        prepCandidates={prepCandidates}
      />
    </>
  );
}
