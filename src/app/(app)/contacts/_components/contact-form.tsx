"use client";

import { useActionState, type ReactNode } from "react";
import { STATUSES, STATUS_LABELS, type ContactFields, type ContactRow } from "@/lib/contacts";
import { createContact, updateContact, type ContactFormState } from "../actions";

export function ContactForm({
  contact,
  onSaved,
  onCancel,
  deleteSlot,
}: {
  contact?: ContactRow;
  onSaved: (id: string) => void;
  onCancel: () => void;
  deleteSlot?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    async (prev, formData) => {
      const result = contact
        ? await updateContact(contact.id, prev, formData)
        : await createContact(prev, formData);
      if (result?.ok) onSaved(result.id);
      return result;
    },
    null,
  );

  const failed = state && !state.ok ? state : null;
  const value = (field: ContactFields) =>
    failed?.values?.[field] ?? (contact ? (contact[field] ?? "") : "");
  const error = (field: ContactFields) => failed?.fieldErrors?.[field];
  const currentStatus = value("status") || "lead";

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {failed?.message && (
          <p role="alert" className="rounded-control bg-danger-wash px-3 py-2.5 text-sm text-danger">
            {failed.message}
          </p>
        )}

        <Field id="name" label="Name" error={error("name")}>
          <input
            id="name"
            name="name"
            defaultValue={value("name")}
            autoComplete="off"
            autoFocus
            required
            {...invalidProps("name", error("name"))}
            className={inputClass}
          />
        </Field>

        <Field id="email" label="Email" error={error("email")}>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={value("email")}
            autoComplete="off"
            required
            {...invalidProps("email", error("email"))}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label="Phone" hint="Optional" error={error("phone")}>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={value("phone")}
              autoComplete="off"
              {...invalidProps("phone", error("phone"))}
              className={`${inputClass} tabular-nums`}
            />
          </Field>

          <Field id="company" label="Company" hint="Optional" error={error("company")}>
            <input
              id="company"
              name="company"
              defaultValue={value("company")}
              autoComplete="off"
              {...invalidProps("company", error("company"))}
              className={inputClass}
            />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-medium text-text">Status</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATUSES.map((s) => (
              <label
                key={s}
                data-status={s}
                className="relative flex h-10 cursor-pointer items-center gap-2 rounded-control border border-rule bg-sheet px-3 text-sm text-muted hover:border-rule-strong has-checked:border-(--tab) has-checked:bg-(--tab-wash) has-checked:font-medium has-checked:text-(--tab) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={currentStatus === s}
                  className="sr-only"
                />
                <span aria-hidden="true" className="h-3.5 w-[3px] rounded-full bg-(--tab)" />
                {STATUS_LABELS[s]}
              </label>
            ))}
          </div>
          {error("status") && <p className="mt-1.5 text-xs text-danger">{error("status")}</p>}
        </fieldset>
      </div>

      <footer className="flex items-center gap-2 border-t border-rule bg-sheet px-6 py-4">
        {deleteSlot}
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto h-10 rounded-control px-4 text-sm font-medium text-muted hover:bg-paper hover:text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-control bg-signal px-4 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-70"
        >
          {contact ? (pending ? "Saving…" : "Save changes") : pending ? "Creating…" : "Create contact"}
        </button>
      </footer>
    </form>
  );
}

const inputClass =
  "h-10 w-full rounded-control border border-rule bg-sheet px-3 text-sm text-text hover:border-rule-strong focus:border-signal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-signal/30 aria-invalid:border-danger";

function invalidProps(field: string, error?: string) {
  return error ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-xs font-medium text-text">
        {label}
        {hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
