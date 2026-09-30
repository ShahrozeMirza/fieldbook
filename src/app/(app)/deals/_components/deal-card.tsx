"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KeyboardEvent } from "react";
import { Avatar } from "@/components/avatar";
import { STAGE_LABELS, formatMoney, type DealCard as Deal } from "@/lib/deals";

export function DealCardView({ deal, lifted = false }: { deal: Deal; lifted?: boolean }) {
  const lost = deal.stage === "lost";
  return (
    <div
      className={`rounded-control border bg-sheet p-3 ${
        lifted
          ? "cursor-grabbing border-rule-strong shadow-[0_14px_32px_rgb(21_35_59/0.18)]"
          : "border-rule shadow-[0_1px_0_rgb(21_35_59/0.04)]"
      }`}
    >
      <p className="line-clamp-2 text-sm font-medium text-text">{deal.title}</p>
      {deal.contact && (
        <p className="mt-0.5 truncate text-xs text-muted">{deal.contact.company ?? deal.contact.name}</p>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`text-base font-semibold tabular-nums ${lost ? "text-muted" : "text-text"}`}>
          {formatMoney(deal.value)}
        </span>
        {deal.contact && (
          <span title={deal.contact.name}>
            <Avatar name={deal.contact.name} size="sm" />
          </span>
        )}
      </div>
    </div>
  );
}

export function SortableDealCard({ deal, onOpen }: { deal: Deal; onOpen: (deal: Deal) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
  });

  function onKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    listeners?.onKeyDown?.(event);
    if (event.key === "Enter" && !isDragging && !event.defaultPrevented) {
      // Consume the key so it doesn’t also submit the form that opens with focus.
      event.preventDefault();
      onOpen(deal);
    }
  }

  const label = [
    deal.title,
    formatMoney(deal.value),
    deal.contact ? deal.contact.name : null,
    STAGE_LABELS[deal.stage],
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`touch-manipulation list-none rounded-control ${isDragging ? "opacity-40" : ""}`}
      {...attributes}
      {...listeners}
      aria-label={label}
      onKeyDown={onKeyDown}
      onClick={() => onOpen(deal)}
    >
      <div className="cursor-grab">
        <DealCardView deal={deal} />
      </div>
    </li>
  );
}
