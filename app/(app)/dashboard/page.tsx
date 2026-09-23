import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { ExitViewAsFailedNotice } from "@/components/admin/exit-view-as-failed-notice";
import { getApplicationsList } from "@/lib/applications/actions";
import { computeInsights } from "@/lib/applications/insights";
import type {
  DashboardSearchApp,
  DashboardSearchDoc,
} from "@/lib/dashboard/search";
import { getUserProfileContext } from "@/lib/profile/actions";
import { resolveGreetingFirstName } from "@/lib/profile/utils";
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

  const { applications, archivedApplications, versionCounts } = appsList;
  const insights = computeInsights(applications);
  const versions = library.versions;
  const archivedVersions = library.archivedVersions;
  const primaryVersionId =
    library.defaultVersionId ?? versions[0]?.id ?? null;
  const hasTailored = versions.some((v) => v.tailored_for);
  const firstName = resolveGreetingFirstName(
    library.userName,
    library.userEmail
  );

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

  const searchApps: DashboardSearchApp[] = [
    ...applications,
    ...archivedApplications,
  ].map((app) => ({
    id: app.id,
    role: app.role,
    company: app.company,
    status: app.status,
    resumeName: app.resume_version_name ?? app.resume_snapshot?.name ?? null,
    appliedAt: app.applied_at,
    archived: Boolean(app.archived_at),
  }));

  const searchDocs: DashboardSearchDoc[] = [...versions, ...archivedVersions].map(
    (version) => ({
      id: version.id,
      name: version.name,
      headline: version.data?.headline ?? "",
      tailoredLabel: version.tailored_for
        ? `${version.tailored_for.role ?? "Role"}${
            version.tailored_for.company
              ? ` @ ${version.tailored_for.company}`
              : ""
          }`
        : null,
      updatedAt: version.updated_at,
      archived: Boolean(version.archived_at),
    })
  );

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
        searchApps={searchApps}
        searchDocs={searchDocs}
      />
    </>
  );
}
