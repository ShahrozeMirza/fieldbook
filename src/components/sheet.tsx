"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Right-hand slide-over built on <dialog>: focus trap, Esc and backdrop come for free. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="sheet bg-sheet p-0 text-text shadow-[-12px_0_32px_rgb(21_35_59/0.12)] md:rounded-l-panel"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-rule px-6 py-4">
          <h2 id="sheet-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-control text-muted hover:bg-paper hover:text-text"
          >
            <span className="sr-only">Close</span>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
