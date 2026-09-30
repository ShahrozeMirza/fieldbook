import { STATUS_LABELS, type Status } from "@/lib/contacts";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      data-status={status}
      className="inline-flex h-6 items-center rounded-control bg-(--tab-wash) px-2 text-xs font-medium text-(--tab)"
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
