import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { DashboardHomeData } from "@/components/dashboard/dashboard-shared";

export type { DashboardStat, DashboardUpcoming } from "@/components/dashboard/dashboard-shared";

type DashboardHomeProps = DashboardHomeData;

export function DashboardHome(props: DashboardHomeProps) {
  return <DashboardShell data={props} />;
}
