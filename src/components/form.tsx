import type { ReactNode } from "react";

export const inputClass =
  "h-10 w-full rounded-control border border-rule bg-sheet px-3 text-sm text-text hover:border-rule-strong focus:border-signal focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-signal/30 aria-invalid:border-danger";

export const optionClass =
  "relative flex h-10 cursor-pointer items-center gap-2 rounded-control border border-rule bg-sheet px-3 text-sm text-muted hover:border-rule-strong has-checked:border-(--tab) has-checked:bg-(--tab-wash) has-checked:font-medium has-checked:text-(--tab) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal";

export function invalidProps(field: string, error?: string) {
  return error ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};
}

export function Field({
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

export function FormFooter({
  deleteSlot,
  onCancel,
  pending,
  submitLabel,
  pendingLabel,
}: {
  deleteSlot?: ReactNode;
  onCancel: () => void;
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
}) {
  return (
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
        {pending ? pendingLabel : submitLabel}
      </button>
    </footer>
  );
}
