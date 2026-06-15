import { InsightsDashboard } from "@/components/insights/insights-dashboard";
import { getApplicationsList } from "@/lib/applications/actions";
import { computeInsights } from "@/lib/applications/insights";

export default async function InsightsPage() {
  const { applications } = await getApplicationsList();
  const data = computeInsights(applications);

  return <InsightsDashboard data={data} />;
}
