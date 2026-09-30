"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRef, useState, useTransition } from "react";
import { DeleteButton } from "@/components/delete-button";
import { Sheet } from "@/components/sheet";
import {
  OPEN_STAGES,
  STAGES,
  STAGE_LABELS,
  formatMoney,
  isStage,
  type ContactOption,
  type DealCard,
  type Stage,
} from "@/lib/deals";
import { deleteDeal, moveDeal } from "../actions";
import { DealCardView, SortableDealCard } from "./deal-card";
import { DealForm } from "./deal-form";

type Columns = Record<Stage, DealCard[]>;
type Editing = { mode: "create"; stage: Stage } | { mode: "edit"; deal: DealCard };

function group(deals: DealCard[]): Columns {
  const columns = Object.fromEntries(STAGES.map((s) => [s, [] as DealCard[]])) as Columns;
  for (const deal of deals) columns[deal.stage].push(deal);
  return columns;
}

function stageOf(columns: Columns, id: UniqueIdentifier): Stage | undefined {
  if (isStage(id)) return id;
  return STAGES.find((s) => columns[s].some((d) => d.id === id));
}

const sum = (deals: DealCard[]) => deals.reduce((total, d) => total + d.value, 0);

export function DealsBoard({ deals, contacts }: { deals: DealCard[]; contacts: ContactOption[] }) {
  const [columns, setColumns] = useState(() => group(deals));
  const [syncedDeals, setSyncedDeals] = useState(deals);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const snapshot = useRef<Columns>(columns);

  // Take fresh server data, but never mid-drag.
  if (deals !== syncedDeals && activeId === null) {
    setSyncedDeals(deals);
    setColumns(group(deals));
  }

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>({ mode: "create", stage: "lead" });
  const [formKey, setFormKey] = useState(0);

  function openSheet(next: Editing) {
    setEditing(next);
    setFormKey((k) => k + 1);
    setSheetOpen(true);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      // Enter is kept free for opening a deal.
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    }),
  );

  const all = STAGES.flatMap((s) => columns[s]);
  const find = (id: UniqueIdentifier) => all.find((d) => d.id === id);
  const activeDeal = activeId ? find(activeId) : undefined;
  const openTotal = OPEN_STAGES.reduce((t, s) => t + sum(columns[s]), 0);

  function onDragStart({ active }: DragStartEvent) {
    snapshot.current = columns;
    setNotice(null);
    setActiveId(active.id);
  }

  // Moving between columns happens live, so totals and the target column update as you drag.
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = stageOf(columns, active.id);
    const to = stageOf(columns, over.id);
    if (!from || !to || from === to) return;

    setColumns((prev) => {
      const moving = prev[from].find((d) => d.id === active.id);
      if (!moving) return prev;
      const target = prev[to];
      const overIndex = target.findIndex((d) => d.id === over.id);
      const below =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
      const index = overIndex >= 0 ? overIndex + (below ? 1 : 0) : target.length;
      return {
        ...prev,
        [from]: prev[from].filter((d) => d.id !== active.id),
        [to]: [...target.slice(0, index), { ...moving, stage: to }, ...target.slice(index)],
      };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const stage = stageOf(columns, active.id);
    if (!over || !stage) {
      setColumns(snapshot.current);
      return;
    }

    let column = columns[stage];
    const oldIndex = column.findIndex((d) => d.id === active.id);
    const newIndex = column.findIndex((d) => d.id === over.id);
    if (newIndex >= 0 && oldIndex !== newIndex) {
      column = arrayMove(column, oldIndex, newIndex);
      setColumns((prev) => ({ ...prev, [stage]: column }));
    }

    const before = snapshot.current;
    const orderedIds = column.map((d) => d.id);
    const unchanged =
      stageOf(before, active.id) === stage &&
      before[stage].map((d) => d.id).join() === orderedIds.join();
    if (unchanged) return;

    const previous = before;
    startTransition(async () => {
      const result = await moveDeal(String(active.id), stage, orderedIds);
      if (!result.ok) {
        setColumns(previous);
        setNotice(result.message);
      }
    });
  }

  function onDragCancel() {
    setActiveId(null);
    setColumns(snapshot.current);
  }

  const title = (id: UniqueIdentifier) => find(id)?.title ?? "Deal";
  const where = (id: UniqueIdentifier | undefined) => {
    if (id === undefined) return "";
    const stage = stageOf(columns, id);
    if (!stage) return "";
    const position = columns[stage].findIndex((d) => d.id === id);
    return position >= 0
      ? `${STAGE_LABELS[stage]}, position ${position + 1} of ${columns[stage].length}`
      : STAGE_LABELS[stage];
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${title(active.id)}. In ${where(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${title(active.id)} is over ${where(active.id)}.` : undefined),
    onDragEnd: ({ active, over }) =>
      over ? `Moved ${title(active.id)} to ${where(active.id)}.` : `${title(active.id)} was dropped. No change.`,
    onDragCancel: ({ active }) => `Move cancelled. ${title(active.id)} went back to where it was.`,
  };

  return (
    <>
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.01em]">Deals</h1>
          <p className="mt-1 text-sm text-muted tabular-nums">
            {all.length === 1 ? "1 deal" : `${all.length} deals`}, {formatMoney(openTotal)} open
          </p>
        </div>
        <button
          type="button"
          onClick={() => openSheet({ mode: "create", stage: "lead" })}
          className="flex h-10 items-center gap-2 rounded-control bg-signal pr-4 pl-3 text-sm font-medium text-white hover:bg-signal-strong"
        >
          <PlusIcon />
          New deal
        </button>
      </header>

      {notice && (
        <p role="alert" className="mt-6 rounded-control bg-danger-wash px-3 py-2.5 text-sm text-danger">
          {notice}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "Press Enter to open this deal. To move it, press Space, use the arrow keys to change stage or order, then press Space again to drop it or Escape to cancel.",
          },
        }}
      >
        <div className="relative -mx-4 mt-8 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-4 md:-mx-10 md:snap-none md:px-10">
          <div className="grid auto-cols-[minmax(264px,85%)] grid-flow-col gap-3 sm:auto-cols-[minmax(208px,1fr)]">
            {STAGES.map((stage) => (
              <Column
                key={stage}
                stage={stage}
                deals={columns[stage]}
                isTarget={activeId !== null && columns[stage].some((d) => d.id === activeId)}
                onAdd={() => openSheet({ mode: "create", stage })}
                onOpen={(deal) => openSheet({ mode: "edit", deal })}
              />
            ))}
          </div>
        </div>

        <DragOverlay>{activeDeal ? <DealCardView deal={activeDeal} lifted /> : null}</DragOverlay>
      </DndContext>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing.mode === "edit" ? editing.deal.title : "New deal"}
      >
        <DealForm
          key={formKey}
          deal={editing.mode === "edit" ? editing.deal : undefined}
          defaultStage={editing.mode === "create" ? editing.stage : undefined}
          contacts={contacts}
          onSaved={() => setSheetOpen(false)}
          onCancel={() => setSheetOpen(false)}
          deleteSlot={
            editing.mode === "edit" ? (
              <DeleteButton
                noun="deal"
                name={editing.deal.title}
                onConfirm={() => deleteDeal(editing.deal.id)}
                onDeleted={() => setSheetOpen(false)}
              />
            ) : undefined
          }
        />
      </Sheet>
    </>
  );
}

function Column({
  stage,
  deals,
  isTarget,
  onAdd,
  onOpen,
}: {
  stage: Stage;
  deals: DealCard[];
  isTarget: boolean;
  onAdd: () => void;
  onOpen: (deal: DealCard) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage });
  const label = STAGE_LABELS[stage];

  return (
    <section aria-labelledby={`stage-${stage}`} data-stage={stage} className="flex snap-start flex-col">
      <header className="flex items-start gap-2.5 px-1 pb-3">
        <span aria-hidden="true" className="mt-0.5 h-9 w-[3px] shrink-0 rounded-full bg-(--tab)" />
        <div className="min-w-0 flex-1">
          <h2 id={`stage-${stage}`} className="flex items-baseline gap-2 text-sm font-semibold text-text">
            {label}
            <span className="text-xs font-normal tabular-nums text-muted">{deals.length}</span>
          </h2>
          <p className={`text-sm tabular-nums ${stage === "lost" ? "text-muted" : "text-text"}`}>
            {formatMoney(sum(deals))}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="grid size-8 place-items-center rounded-control text-muted hover:bg-sheet hover:text-text"
        >
          <span className="sr-only">Add a deal to {label}</span>
          <PlusIcon />
        </button>
      </header>

      <SortableContext id={stage} items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          aria-labelledby={`stage-${stage}`}
          className={`flex min-h-60 flex-1 flex-col md:min-h-[420px] gap-2 rounded-panel bg-well p-1.5 transition-shadow ${
            isTarget ? "shadow-[inset_0_0_0_1.5px_var(--tab)]" : ""
          }`}
        >
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} onOpen={onOpen} />
          ))}
          {deals.length === 0 && (
            <li className="grid flex-1 place-items-center rounded-control border border-dashed border-rule-strong px-4 py-8 text-center text-xs text-muted">
              Drag a deal here
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
