"use client";

import { useActionState, type ReactNode } from "react";
import { Field, FormFooter, inputClass, invalidProps, optionClass } from "@/components/form";
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
                className={optionClass}
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

      <FormFooter
        deleteSlot={deleteSlot}
        onCancel={onCancel}
        pending={pending}
        submitLabel={contact ? "Save changes" : "Create contact"}
        pendingLabel={contact ? "Saving…" : "Creating…"}
      />
    </form>
  );
}
