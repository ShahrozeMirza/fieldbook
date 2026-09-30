import { db } from "@/lib/db";
import { STATUSES, isStatus, type Status } from "@/lib/contacts";
import { OPEN_STAGES, STAGES, type Stage } from "@/lib/deals";

export type StageSummary = { stage: Stage; count: number; value: number };
export type RevenueMonth = { key: string; short: string; long: string; value: number; count: number };

const MONTHS = 12;

/** "2026-03" in the server's local time zone, matching how the user reads their calendar. */
function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getDashboard() {
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1), 1);

  const [contactGroups, stageGroups, wonDeals] = await Promise.all([
    db.contact.groupBy({ by: ["status"], _count: { _all: true } }),
    db.deal.groupBy({ by: ["stage"], _count: { _all: true }, _sum: { value: true } }),
    db.deal.findMany({
      where: { stage: "won", closedAt: { gte: windowStart } },
      select: { value: true, closedAt: true },
    }),
  ]);

  const contactsByStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const g of contactGroups) if (isStatus(g.status)) contactsByStatus[g.status] = g._count._all;
  const totalContacts = contactGroups.reduce((t, g) => t + g._count._all, 0);

  const stages: StageSummary[] = STAGES.map((stage) => {
    const g = stageGroups.find((row) => row.stage === stage);
    return { stage, count: g?._count._all ?? 0, value: g?._sum.value ?? 0 };
  });
  const open = stages.filter((s) => OPEN_STAGES.includes(s.stage));
  const openValue = open.reduce((t, s) => t + s.value, 0);
  const openCount = open.reduce((t, s) => t + s.count, 0);

  const revenue: RevenueMonth[] = Array.from({ length: MONTHS }, (_, i) => {
    const date = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1);
    return {
      key: monthKey(date),
      short: date.toLocaleString("en-US", { month: "short" }),
      long: date.toLocaleString("en-US", { month: "long", year: "numeric" }),
      value: 0,
      count: 0,
    };
  });
  for (const deal of wonDeals) {
    if (!deal.closedAt) continue;
    const month = revenue.find((m) => m.key === monthKey(deal.closedAt!));
    if (!month) continue;
    month.value += deal.value;
    month.count += 1;
  }

  return {
    totalContacts,
    contactsByStatus,
    stages,
    openValue,
    openCount,
    revenue,
    revenueTotal: revenue.reduce((t, m) => t + m.value, 0),
  };
}
