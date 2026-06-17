import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { getApplicationsList } from "@/lib/applications/actions";
import { computeInsights } from "@/lib/applications/insights";
import { getStudentSegment } from "@/lib/profile/actions";
import { resolveFirstName } from "@/lib/profile/utils";
import { getLibraryData } from "@/lib/resume/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [library, { applications }, segment] = await Promise.all([
    getLibraryData(),
    getApplicationsList(),
    getStudentSegment(),
  ]);

  const insights = computeInsights(applications);
  const versions = library.versions;
  const primaryVersionId =
    library.defaultVersionId ?? versions[0]?.id ?? null;
  const hasTailored = versions.some((v) => v.tailored_for);
  const firstName = resolveFirstName(library.userName);

  return (
    <DashboardHome
      firstName={firstName}
      isStudent={segment.isStudent}
      versionsCount={versions.length}
      applicationsCount={insights.stats.total}
      hasTailored={hasTailored}
      primaryVersionId={primaryVersionId}
      stats={{
        respRate: insights.stats.respRate,
        interviewRate: insights.interviewRate,
        offers: insights.stats.offerCount,
      }}
      upcoming={insights.upcoming.slice(0, 3)}
    />
  );
}
