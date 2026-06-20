export type AdminAIDailyPoint = {
  date: string;
  costUsd: number;
  actionCount: number;
};

export type AdminAIMonthlyPoint = {
  periodStart: string;
  costUsd: number;
  actionCount: number;
  activeUsers: number;
};

export type AdminAIUserCostRow = {
  userId: string;
  email: string;
  fullName: string | null;
  costUsd: number;
  actionCount: number;
};

export type AdminAIRecentEvent = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  action: string;
  model: string;
  costUsd: number;
  createdAt: string;
};

export type AdminAIUsageDashboard = {
  available: boolean;
  costTodayUsd: number;
  costLast7DaysUsd: number;
  costMonthToDateUsd: number;
  costAllTimeUsd: number;
  actionsToday: number;
  actionsMonthToDate: number;
  actionsAllTime: number;
  dailyLast30Days: AdminAIDailyPoint[];
  monthlyHistory: AdminAIMonthlyPoint[];
  topUsersThisMonth: AdminAIUserCostRow[];
  recentEvents: AdminAIRecentEvent[];
};

export function formatUsdCost(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "$0.00";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

export function formatActionLabel(action: string): string {
  return action.replace(/_/g, " ");
}
