"use client";

import { useState } from "react";
import type { RevenueMonth } from "@/lib/dashboard";
import { formatMoney, formatMoneyCompact } from "@/lib/deals";

const PLOT_HEIGHT = 200;

/** A round axis maximum with 4 even steps: 0 / 10K / 20K / 30K / 40K. */
function niceScale(max: number) {
  if (max <= 0) return { top: 4, step: 1 };
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)!;
  return { top: step * 4, step };
}

export function RevenueChart({ months, total }: { months: RevenueMonth[]; total: number }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const [active, setActive] = useState<number | null>(null);

  const { top, step } = niceScale(Math.max(...months.map((m) => m.value)));
  const ticks = Array.from({ length: 5 }, (_, i) => i * step);
  const peak = months.reduce((best, m, i) => (m.value > months[best].value ? i : best), 0);
  const last = months.length - 1;
  const range = `${months[0].long} to ${months[last].long}`;

  return (
    <section aria-labelledby="revenue-title" className="mt-4 rounded-panel border border-rule bg-sheet p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="revenue-title" className="text-base font-semibold text-text">
            Revenue by month
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Won deals, {range}: <span className="font-medium text-text">{formatMoney(total)}</span>
          </p>
        </div>
        {total > 0 && (
          <button
            type="button"
            aria-pressed={view === "table"}
            onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
            className="h-9 rounded-control px-3 text-sm font-medium text-muted shadow-[inset_0_0_0_1px_var(--rule)] hover:bg-paper hover:text-text"
          >
            {view === "chart" ? "Show as table" : "Show as chart"}
          </button>
        )}
      </header>

      {total === 0 ? (
        <p className="mt-6 rounded-control border border-dashed border-rule-strong px-4 py-10 text-center text-sm text-muted">
          No deals won in the last 12 months. Deals you move to Won show up here.
        </p>
      ) : view === "table" ? (
        <RevenueTable months={months} total={total} />
      ) : (
        <div className="mt-6 grid grid-cols-[44px_minmax(0,1fr)] gap-x-2">
          {/* Y axis */}
          <div aria-hidden="true" className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-muted"
                style={{ bottom: `${(t / top) * 100}%` }}
              >
                {formatMoneyCompact(t)}
              </span>
            ))}
          </div>

          {/* Plot */}
          <div className="relative" style={{ height: PLOT_HEIGHT }} onPointerLeave={() => setActive(null)}>
            {ticks.map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className={`absolute inset-x-0 h-px ${t === 0 ? "bg-rule-strong" : "bg-rule"}`}
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}

            <ol aria-label="Revenue by month" className="relative grid h-full grid-cols-12">
              {months.map((m, i) => {
                const height = (m.value / top) * 100;
                const labelled = m.value > 0 && (i === peak || i === last);
                const isActive = active === i;
                return (
                  <li
                    key={m.key}
                    tabIndex={0}
                    aria-label={`${m.long}: ${formatMoney(m.value)} from ${m.count} ${m.count === 1 ? "deal" : "deals"}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="group relative flex h-full cursor-default items-end justify-center rounded-sm outline-offset-0"
                  >
                    {m.value > 0 && (
                      <span
                        aria-hidden="true"
                        className={`relative block w-[min(24px,60%)] rounded-t-[4px] transition-colors ${
                          isActive ? "bg-signal-strong" : "bg-signal"
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        {labelled && !isActive && (
                          <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap tabular-nums text-text">
                            {formatMoneyCompact(m.value)}
                          </span>
                        )}
                      </span>
                    )}
                    {isActive && <Tooltip month={m} index={i} count={months.length} height={height} />}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* X axis */}
          <div aria-hidden="true" />
          <div aria-hidden="true" className="grid grid-cols-12 pt-2">
            {months.map((m, i) => (
              <span
                key={m.key}
                className={`text-center text-[11px] text-muted ${(last - i) % 2 === 1 ? "invisible sm:visible" : ""}`}
              >
                {m.short}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Tooltip({
  month,
  index,
  count,
  height,
}: {
  month: RevenueMonth;
  index: number;
  count: number;
  height: number;
}) {
  // Keep the tooltip inside the plot at either edge.
  const align =
    index < 2 ? "left-0" : index > count - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <div
      role="presentation"
      className={`pointer-events-none absolute z-10 mb-2 w-max rounded-control border border-rule bg-sheet px-3 py-2 shadow-[0_8px_24px_rgb(21_35_59/0.12)] ${align}`}
      style={{ bottom: `${Math.min(height, 72)}%` }}
    >
      <p className="text-sm font-semibold tabular-nums text-text">{formatMoney(month.value)}</p>
      <p className="text-xs text-muted">
        {month.long}, {month.count === 1 ? "1 deal" : `${month.count} deals`}
      </p>
    </div>
  );
}

function RevenueTable({ months, total }: { months: RevenueMonth[]; total: number }) {
  return (
    <table className="mt-6 w-full text-sm">
      <caption className="sr-only">Revenue from won deals by month</caption>
      <thead>
        <tr className="border-b border-rule text-left text-xs text-muted">
          <th scope="col" className="py-2 font-medium">Month</th>
          <th scope="col" className="py-2 text-right font-medium">Deals won</th>
          <th scope="col" className="py-2 text-right font-medium">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {months.map((m) => (
          <tr key={m.key} className="border-b border-rule">
            <th scope="row" className="py-2 text-left font-normal text-text">{m.long}</th>
            <td className="py-2 text-right tabular-nums text-muted">{m.count}</td>
            <td className="py-2 text-right tabular-nums text-text">{formatMoney(m.value)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" className="pt-3 text-left font-medium text-text">Total</th>
          <td className="pt-3 text-right tabular-nums text-muted">
            {months.reduce((t, m) => t + m.count, 0)}
          </td>
          <td className="pt-3 text-right font-medium tabular-nums text-text">{formatMoney(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
