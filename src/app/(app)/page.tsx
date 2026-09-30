import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { STATUSES, STATUS_LABELS } from "@/lib/contacts";
import { requireUser } from "@/lib/auth";
import { getDashboard, type StageSummary } from "@/lib/dashboard";
import { OPEN_STAGES, STAGE_LABELS, formatMoney } from "@/lib/deals";
import { RevenueChart } from "./_components/revenue-chart";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireUser();
  await connection();
  const data = await getDashboard();

  const open = data.stages.filter((s) => OPEN_STAGES.includes(s.stage));
  const closed = data.stages.filter((s) => !OPEN_STAGES.includes(s.stage));
  const scale = Math.max(1, ...data.stages.map((s) => s.value));

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-6 pb-16 md:px-10 md:pt-10">
      <h1 className="text-xl font-semibold tracking-[-0.01em]">Dashboard</h1>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section aria-labelledby="pipeline-title" className="rounded-panel border border-rule bg-sheet p-6">
          <h2 id="pipeline-title" className="text-sm font-medium text-muted">
            Open pipeline
          </h2>
          <p className="mt-2 text-[48px] leading-none font-semibold tracking-[-0.02em] text-text">
            {formatMoney(data.openValue)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {data.openCount === 1 ? "1 deal" : `${data.openCount} deals`} in Lead, Contacted and Proposal
          </p>

          <h3 className="sr-only">Deals by stage</h3>
          <ul className="mt-8 space-y-1">
            {open.map((s) => (
              <StageRow key={s.stage} summary={s} scale={scale} />
            ))}
          </ul>
          <ul className="mt-3 space-y-1 border-t border-rule pt-3">
            {closed.map((s) => (
              <StageRow key={s.stage} summary={s} scale={scale} muted={s.stage === "lost"} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="contacts-title" className="rounded-panel border border-rule bg-sheet p-6">
          <h2 id="contacts-title" className="text-sm font-medium text-muted">
            Contacts
          </h2>
          <p className="mt-2 text-[40px] leading-none font-semibold tracking-[-0.02em] text-text">
            {data.totalContacts.toLocaleString("en-US")}
          </p>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {STATUSES.map((status) => (
              <li key={status}>
                <Link
                  href={`/contacts?status=${status}`}
                  data-status={status}
                  className="-mx-2 flex h-11 items-center gap-2.5 rounded-control px-2 text-sm text-text hover:bg-paper"
                >
                  <span aria-hidden="true" className="h-3.5 w-[3px] rounded-full bg-(--tab)" />
                  {STATUS_LABELS[status]}
                  <span className="ml-auto tabular-nums text-muted">{data.contactsByStatus[status]}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contacts"
            className="mt-4 inline-flex h-9 items-center rounded-control text-sm font-medium text-signal hover:underline"
          >
            View all contacts
          </Link>
        </section>
      </div>

      <RevenueChart months={data.revenue} total={data.revenueTotal} />
    </div>
  );
}

function StageRow({
  summary: { stage, count, value },
  scale,
  muted = false,
}: {
  summary: StageSummary;
  scale: number;
  muted?: boolean;
}) {
  const width = value > 0 ? Math.max(1.5, (value / scale) * 100) : 0;
  return (
    <li>
      <Link
        href="/deals"
        data-stage={stage}
        aria-label={`${STAGE_LABELS[stage]}: ${count} ${count === 1 ? "deal" : "deals"}, ${formatMoney(value)}`}
        className="-mx-2 grid h-10 grid-cols-[108px_minmax(0,1fr)_76px] items-center gap-2 sm:gap-3 rounded-control px-2 hover:bg-paper sm:grid-cols-[140px_minmax(0,1fr)_96px]"
      >
        <span className="flex items-center gap-2.5 text-sm text-text">
          <span aria-hidden="true" className="h-3.5 w-[3px] rounded-full bg-(--tab)" />
          {STAGE_LABELS[stage]}
          <span className="text-xs tabular-nums text-muted">{count}</span>
        </span>
        <span aria-hidden="true" className="h-2.5">
          {width > 0 && (
            <span
              className={`block h-full rounded-r-[4px] ${muted ? "bg-[#a3adbb]" : "bg-signal"}`}
              style={{ width: `${width}%` }}
            />
          )}
        </span>
        <span className={`text-right text-sm tabular-nums ${muted ? "text-muted" : "text-text"}`}>
          {formatMoney(value)}
        </span>
      </Link>
    </li>
  );
}
