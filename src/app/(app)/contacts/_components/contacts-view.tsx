"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { ContactRow } from "@/lib/contacts";
import { deleteContact } from "../actions";
import { Avatar } from "@/components/avatar";
import { DeleteButton } from "@/components/delete-button";
import { Sheet } from "@/components/sheet";
import { ContactForm } from "./contact-form";
import { StatusBadge } from "./status-badge";

type Editing = { mode: "create" } | { mode: "edit"; contact: ContactRow };

export function ContactsView({
  contacts,
  total,
  query,
  filters,
}: {
  contacts: ContactRow[];
  total: number;
  query: string;
  filters: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Kept after closing so the sheet's content stays put while it slides out.
  const [editing, setEditing] = useState<Editing>({ mode: "create" });
  // Bumped on every open so the form remounts with fresh state.
  const [formKey, setFormKey] = useState(0);
  const [flashId, setFlashId] = useState<string | null>(null);

  function openSheet(next: Editing) {
    setEditing(next);
    setFormKey((k) => k + 1);
    setOpen(true);
  }

  function handleSaved(id: string) {
    setOpen(false);
    setFlashId(id);
  }

  return (
    <>
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.01em]">Contacts</h1>
          <p className="mt-1 text-sm text-muted tabular-nums">
            {total === 1 ? "1 person" : `${total} people`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openSheet({ mode: "create" })}
          className="flex h-10 items-center gap-2 rounded-control bg-signal pr-4 pl-3 text-sm font-medium text-white hover:bg-signal-strong"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
            <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          New contact
        </button>
      </header>

      {total > 0 && <div className="mt-8">{filters}</div>}

      <div className="mt-4 overflow-hidden rounded-panel border border-rule bg-sheet">
        {total === 0 ? (
          <EmptyState
            title="No contacts yet"
            body="Add the people you work with, and they’ll show up here."
            action={
              <button
                type="button"
                onClick={() => openSheet({ mode: "create" })}
                className="mt-4 h-10 rounded-control bg-signal px-4 text-sm font-medium text-white hover:bg-signal-strong"
              >
                New contact
              </button>
            }
          />
        ) : contacts.length === 0 ? (
          <EmptyState
            title={query ? `No contacts match “${query}”` : "No contacts with this status"}
            body={query ? "Clear the search to see everyone." : "Choose another status, or All."}
            action={
              <Link
                href="/contacts"
                replace
                className="mt-4 inline-flex h-10 items-center rounded-control px-4 text-sm font-medium text-signal shadow-[inset_0_0_0_1px_var(--rule)] hover:bg-signal-wash"
              >
                {query ? "Clear search" : "Show all contacts"}
              </Link>
            }
          />
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-xs text-muted">
                <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">
                  Name
                </th>
                <th scope="col" className="hidden w-[24%] px-3 py-2.5 font-medium md:table-cell">
                  Company
                </th>
                <th scope="col" className="hidden w-[20%] px-3 py-2.5 font-medium lg:table-cell">
                  Phone
                </th>
                <th scope="col" className="w-[120px] py-2.5 pr-5 pl-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  data-status={c.status}
                  onClick={() => openSheet({ mode: "edit", contact: c })}
                  onAnimationEnd={() => setFlashId(null)}
                  className={`cursor-pointer border-b border-rule last:border-b-0 hover:bg-paper/70 ${
                    flashId === c.id ? "row-flash" : ""
                  }`}
                >
                  <td className="py-3 pr-3 pl-5 shadow-[inset_3px_0_0_var(--tab)]">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSheet({ mode: "edit", contact: c });
                          }}
                          className="block max-w-full truncate rounded-sm text-left font-medium text-text"
                        >
                          <span className="sr-only">Edit </span>
                          {c.name}
                        </button>
                        <p className="truncate text-xs text-muted">{c.email}</p>
                        {c.company && (
                          <p className="truncate text-xs text-muted md:hidden">{c.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden truncate px-3 py-3 text-text md:table-cell">
                    {c.company ?? <Blank />}
                  </td>
                  <td className="hidden truncate px-3 py-3 text-text tabular-nums lg:table-cell">
                    {c.phone ?? <Blank />}
                  </td>
                  <td className="py-3 pr-5 pl-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing.mode === "edit" ? editing.contact.name : "New contact"}
      >
        <ContactForm
          key={formKey}
          contact={editing.mode === "edit" ? editing.contact : undefined}
          onSaved={handleSaved}
          onCancel={() => setOpen(false)}
          deleteSlot={
            editing.mode === "edit" ? (
              <DeleteButton
                noun="contact"
                name={editing.contact.name}
                onConfirm={() => deleteContact(editing.contact.id)}
                onDeleted={() => setOpen(false)}
              />
            ) : undefined
          }
        />
      </Sheet>
    </>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <div className="px-6 py-12">
      <p className="text-base font-medium text-text">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

function Blank() {
  return (
    <>
      <span aria-hidden="true" className="text-rule-strong">–</span>
      <span className="sr-only">None</span>
    </>
  );
}
