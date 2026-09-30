"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/contacts";

function contactsHref(q: string, status: Status | null) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const qs = params.toString();
  return qs ? `/contacts?${qs}` : "/contacts";
}

export function FilterBar({
  query,
  status,
  counts,
}: {
  query: string;
  status: Status | null;
  counts: Record<Status, number>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Follow the URL when it changes from elsewhere (e.g. a "clear search" link).
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    if (query !== value.trim()) setValue(query);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.replace(contactsHref(next.trim(), status), { scroll: false });
    }, 250);
  }

  const all = STATUSES.reduce((sum, s) => sum + counts[s], 0);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex gap-1">
          <li>
            <Chip href={contactsHref(query, null)} active={status === null} label="All" count={all} />
          </li>
          {STATUSES.map((s) => (
            <li key={s}>
              <Chip
                href={contactsHref(query, s)}
                active={status === s}
                label={STATUS_LABELS[s]}
                count={counts[s]}
                status={s}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative md:w-72">
        <label htmlFor="contact-search" className="sr-only">
          Search contacts
        </label>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          fill="none"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          id="contact-search"
          type="search"
          value={value}
          onChange={(e) => search(e.target.value)}
          placeholder="Search name, email, company"
          autoComplete="off"
          className="h-10 w-full rounded-control border border-rule bg-sheet pr-3 pl-9 text-sm text-text placeholder:text-muted/80 hover:border-rule-strong focus:border-signal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-signal/30"
        />
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  label,
  count,
  status,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
  status?: Status;
}) {
  return (
    <Link
      href={href}
      replace
      scroll={false}
      aria-current={active ? "true" : undefined}
      data-status={status}
      className="flex h-9 items-center gap-2 rounded-control px-3 text-sm whitespace-nowrap text-muted transition-colors hover:bg-sheet hover:text-text aria-[current=true]:bg-sheet aria-[current=true]:font-medium aria-[current=true]:text-text aria-[current=true]:shadow-[inset_0_0_0_1px_var(--rule)]"
    >
      {status && <span aria-hidden="true" className="h-3 w-[3px] rounded-full bg-(--tab)" />}
      {label}
      <span className="text-xs tabular-nums text-muted">{count}</span>
    </Link>
  );
}
