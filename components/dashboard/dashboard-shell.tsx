"use client";

import {
  type DashboardHomeData,
} from "@/components/dashboard/dashboard-shared";
import { DashboardHomeFull } from "@/components/dashboard/dashboard-home-full";
import { DashboardHomeSimple } from "@/components/dashboard/dashboard-home-simple";

/**
 * Students get the focused simple home; everyone else gets the full
 * dashboard composition. No floating view toggle — keeps the chrome clean.
 */
export function DashboardShell({ data }: { data: DashboardHomeData }) {
  if (data.isStudent) {
    return <DashboardHomeSimple data={data} />;
  }
  return <DashboardHomeFull data={data} />;
}
