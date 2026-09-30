"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: DashboardIcon, count: null },
  { href: "/contacts", label: "Contacts", icon: ContactsIcon, count: "contacts" },
  { href: "/deals", label: "Deals", icon: DealsIcon, count: "deals" },
] as const;

type Counts = Record<NonNullable<(typeof NAV)[number]["count"]>, number>;

export function Sidebar({ counts }: { counts: Counts }) {
  return (
    <>
      {/* Desktop: fixed ink column. */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-ink px-3 pt-5 text-ink-text md:flex">
        <Wordmark />
        <NavList counts={counts} className="mt-6" />
      </aside>

      {/* Phones and small tablets: top bar with a menu button that opens a drawer. */}
      <MobileNav counts={counts} />
    </>
  );
}

function MobileNav({ counts }: { counts: Counts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const current = NAV.find((item) => isActive(item.href, pathname));

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close if the window grows past the breakpoint while the drawer is open.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = () => wide.matches && setOpen(false);
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-ink px-2 text-ink-text md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="grid size-11 place-items-center rounded-control text-white hover:bg-ink-soft"
      >
        <span className="sr-only">Open menu</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <Wordmark />
      {current && (
        <span className="ml-auto truncate pr-3 text-sm text-ink-text" aria-hidden="true">
          {current.label}
        </span>
      )}

      <dialog
        ref={ref}
        id="mobile-nav"
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="drawer bg-ink p-0 text-ink-text"
      >
        <div className="flex h-full flex-col px-3 pt-3 pb-6">
          <div className="flex items-center justify-between">
            <Wordmark onNavigate={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center rounded-control text-white hover:bg-ink-soft"
            >
              <span className="sr-only">Close menu</span>
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <NavList counts={counts} className="mt-4" onNavigate={() => setOpen(false)} />
        </div>
      </dialog>
    </header>
  );
}

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex h-11 items-center gap-2.5 rounded-control px-2 text-base font-semibold text-white"
    >
      <Mark />
      Fieldbook
    </Link>
  );
}

function NavList({
  counts,
  className = "",
  onNavigate,
}: {
  counts: Counts;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, count }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={isActive(href, pathname) ? "page" : undefined}
              className="group flex h-11 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium transition-colors hover:bg-ink-soft hover:text-white aria-[current=page]:bg-ink-soft aria-[current=page]:text-white md:h-10"
            >
              <Icon />
              {label}
              {count && (
                <span className="ml-auto pl-3 text-xs tabular-nums text-ink-text/70 group-aria-[current=page]:text-ink-text">
                  {counts[count]}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
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
