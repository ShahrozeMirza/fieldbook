"use client";

import { useRef, useTransition } from "react";
import type { ContactRow } from "@/lib/contacts";
import { deleteContact } from "../actions";

export function DeleteContactButton({
  contact,
  onDeleted,
}: {
  contact: ContactRow;
  onDeleted: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      await deleteContact(contact.id);
      ref.current?.close();
      onDeleted();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="h-10 rounded-control px-3 text-sm font-medium text-danger hover:bg-danger-wash"
      >
        Delete contact
      </button>

      <dialog
        ref={ref}
        aria-labelledby="delete-title"
        aria-describedby="delete-desc"
        className="m-auto w-[min(400px,calc(100vw-32px))] rounded-panel bg-sheet p-6 text-text shadow-[0_16px_48px_rgb(21_35_59/0.2)]"
      >
        <h2 id="delete-title" className="text-base font-semibold">
          Delete {contact.name}?
        </h2>
        <p id="delete-desc" className="mt-1.5 text-sm text-muted">
          This removes the contact permanently.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => ref.current?.close()}
            className="h-10 rounded-control px-4 text-sm font-medium text-muted hover:bg-paper hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="h-10 rounded-control bg-danger px-4 text-sm font-medium text-white hover:bg-[#9a1e14] disabled:opacity-70"
          >
            {pending ? "Deleting…" : "Delete contact"}
          </button>
        </div>
      </dialog>
    </>
  );
}
