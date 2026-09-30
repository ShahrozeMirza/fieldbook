"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: DashboardIcon, count: null },
  { href: "/contacts", label: "Contacts", icon: ContactsIcon, count: "contacts" },
  { href: "/deals", label: "Deals", icon: DealsIcon, count: "deals" },
] as const;

type Counts = Record<NonNullable<(typeof NAV)[number]["count"]>, number>;

export function Sidebar({ counts }: { counts: Counts }) {
  const pathname = usePathname();

  return (
    <aside className="bg-ink text-ink-text md:sticky md:top-0 md:flex md:h-dvh md:flex-col">
      <div className="flex items-center gap-1 px-3 py-3 sm:gap-4 sm:px-4 md:block md:px-3 md:pt-5 md:pb-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-control px-2 py-1.5 text-base font-semibold text-white"
        >
          <Mark />
          <span className="sr-only sm:not-sr-only">Fieldbook</span>
        </Link>

        <nav aria-label="Main" className="min-w-0 md:mt-6">
          <ul className="relative flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map(({ href, label, icon: Icon, count }) => {
              const active =
                href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="group flex h-10 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium transition-colors hover:bg-ink-soft hover:text-white aria-[current=page]:bg-ink-soft aria-[current=page]:text-white"
                  >
                    <Icon />
                    {label}
                    {count && (
                      <span className="ml-auto hidden pl-3 text-xs tabular-nums md:inline text-ink-text/70 group-aria-[current=page]:text-ink-text">
                        {counts[count]}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

/** A ruled notebook page: the Fieldbook mark. */
function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="4" fill="#2b5bd7" />
      <path d="M6 1v20" stroke="#15233b" strokeOpacity=".35" strokeWidth="1.5" />
      <path d="M9 7h8M9 11h8M9 15h5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.75 13.25c.6-2.3 2.2-3.5 4.25-3.5s3.65 1.2 4.25 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 3.25a2.5 2.5 0 0 1 0 4.5M12 9.9c1.2.5 2 1.6 2.3 3.35" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DealsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="2.25" width="3.5" height="11.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.25" y="2.25" width="3.5" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.75" y="2.25" width="3.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.25 13.75h11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.5 11V8M8 11V4.5M11.5 11V6.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
