"use client";

import { useActionState, type ReactNode } from "react";
import { Field, FormFooter, inputClass, invalidProps, optionClass } from "@/components/form";
import {
  STAGES,
  STAGE_LABELS,
  type ContactOption,
  type DealCard,
  type DealFields,
  type Stage,
} from "@/lib/deals";
import { createDeal, updateDeal, type DealFormState } from "../actions";

export function DealForm({
  deal,
  defaultStage = "lead",
  contacts,
  onSaved,
  onCancel,
  deleteSlot,
}: {
  deal?: DealCard;
  defaultStage?: Stage;
  contacts: ContactOption[];
  onSaved: (id: string) => void;
  onCancel: () => void;
  deleteSlot?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState<DealFormState, FormData>(
    async (prev, formData) => {
      const result = deal ? await updateDeal(deal.id, prev, formData) : await createDeal(prev, formData);
      if (result?.ok) onSaved(result.id);
      return result;
    },
    null,
  );

  const failed = state && !state.ok ? state : null;
  const saved: Record<DealFields, string> = {
    title: deal?.title ?? "",
    value: deal ? deal.value.toLocaleString("en-US") : "",
    stage: deal?.stage ?? defaultStage,
    contactId: deal?.contact?.id ?? "",
  };
  const value = (field: DealFields) => failed?.values?.[field] ?? saved[field];
  const error = (field: DealFields) => failed?.fieldErrors?.[field];

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {failed?.message && (
          <p role="alert" className="rounded-control bg-danger-wash px-3 py-2.5 text-sm text-danger">
            {failed.message}
          </p>
        )}

        <Field id="title" label="Deal name" error={error("title")}>
          <input
            id="title"
            name="title"
            defaultValue={value("title")}
            placeholder="Annual license renewal"
            autoComplete="off"
            autoFocus
            required
            {...invalidProps("title", error("title"))}
            className={inputClass}
          />
        </Field>

        <Field id="value" label="Value" hint="US dollars" error={error("value")}>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted"
            >
              $
            </span>
            <input
              id="value"
              name="value"
              inputMode="numeric"
              defaultValue={value("value")}
              placeholder="12,500"
              autoComplete="off"
              required
              {...invalidProps("value", error("value"))}
              className={`${inputClass} pl-7 tabular-nums`}
            />
          </div>
        </Field>

        <Field id="contactId" label="Contact" hint="Optional" error={error("contactId")}>
          <select
            id="contactId"
            name="contactId"
            defaultValue={value("contactId")}
            {...invalidProps("contactId", error("contactId"))}
            className={`${inputClass} select-chevron`}
          >
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.name}, ${c.company}` : c.name}
              </option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="mb-2 text-xs font-medium text-text">Stage</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {STAGES.map((s) => (
              <label key={s} data-stage={s} className={`${optionClass} px-2.5`}>
                <input
                  type="radio"
                  name="stage"
                  value={s}
                  defaultChecked={value("stage") === s}
                  className="sr-only"
                />
                <span aria-hidden="true" className="h-3.5 w-[3px] shrink-0 rounded-full bg-(--tab)" />
                {STAGE_LABELS[s]}
              </label>
            ))}
          </div>
          {error("stage") && <p className="mt-1.5 text-xs text-danger">{error("stage")}</p>}
        </fieldset>
      </div>

      <FormFooter
        deleteSlot={deleteSlot}
        onCancel={onCancel}
        pending={pending}
        submitLabel={deal ? "Save changes" : "Create deal"}
        pendingLabel={deal ? "Saving…" : "Creating…"}
      />
    </form>
  );
}
