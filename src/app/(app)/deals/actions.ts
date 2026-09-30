"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { dealSchema, isStage, type DealFields, type Stage } from "@/lib/deals";

export type DealFormState =
  | { ok: true; id: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Partial<Record<DealFields, string>>;
      values?: Record<string, string>;
    }
  | null;

function readForm(formData: FormData) {
  const values: Record<string, string> = {};
  for (const key of ["title", "value", "stage", "contactId"]) {
    const value = formData.get(key);
    values[key] = typeof value === "string" ? value : "";
  }
  return values;
}

function invalid(error: z.ZodError, values: Record<string, string>): DealFormState {
  const fieldErrors: Partial<Record<DealFields, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as DealFields;
    fieldErrors[field] ??= issue.message;
  }
  return { ok: false, fieldErrors, values };
}

function refresh() {
  // Sidebar counts live in the layout.
  revalidatePath("/", "layout");
}

async function nextPosition(stage: Stage) {
  const last = await db.deal.findFirst({
    where: { stage },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? -1) + 1;
}

async function contactExists(id: string | null) {
  if (!id) return true;
  return (await db.contact.count({ where: { id } })) > 0;
}

const missingContact = "That contact no longer exists. Choose another, or No contact.";

export async function createDeal(
  _prev: DealFormState,
  formData: FormData,
): Promise<DealFormState> {
  const values = readForm(formData);
  const parsed = dealSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);
  if (!(await contactExists(parsed.data.contactId))) {
    return { ok: false, values, fieldErrors: { contactId: missingContact } };
  }

  const deal = await db.deal.create({
    data: { ...parsed.data, position: await nextPosition(parsed.data.stage) },
  });
  refresh();
  return { ok: true, id: deal.id };
}

export async function updateDeal(
  id: string,
  _prev: DealFormState,
  formData: FormData,
): Promise<DealFormState> {
  const values = readForm(formData);
  const parsed = dealSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);
  if (!(await contactExists(parsed.data.contactId))) {
    return { ok: false, values, fieldErrors: { contactId: missingContact } };
  }

  const existing = await db.deal.findUnique({ where: { id }, select: { stage: true } });
  if (!existing) {
    return { ok: false, values, message: "This deal was deleted. Close this panel to see the current pipeline." };
  }

  // Changing stage from the form puts the deal at the bottom of its new column.
  const position =
    existing.stage === parsed.data.stage ? undefined : await nextPosition(parsed.data.stage);

  await db.deal.update({ where: { id }, data: { ...parsed.data, position } });
  refresh();
  return { ok: true, id };
}

/**
 * Move a deal to `stage` and save that column's order. `orderedIds` is the full
 * list of deal ids in the destination column after the drop, top to bottom.
 */
export async function moveDeal(id: string, stage: string, orderedIds: string[]) {
  if (!isStage(stage) || !orderedIds.includes(id)) {
    return { ok: false as const, message: "That move couldn’t be saved. The board has been reset." };
  }

  try {
    await db.$transaction([
      db.deal.update({ where: { id }, data: { stage } }),
      ...orderedIds.map((dealId, position) =>
        db.deal.updateMany({ where: { id: dealId, stage }, data: { position } }),
      ),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      refresh();
      return { ok: false as const, message: "This deal was deleted elsewhere. The board has been refreshed." };
    }
    throw error;
  }

  refresh();
  return { ok: true as const };
}

export async function deleteDeal(id: string) {
  await db.deal.deleteMany({ where: { id } });
  refresh();
}
