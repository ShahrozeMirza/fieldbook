"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { contactSchema, type ContactFields } from "@/lib/contacts";

export type ContactFormState =
  | { ok: true; id: string }
  | {
      ok: false;
      message?: string;
      fieldErrors?: Partial<Record<ContactFields, string>>;
      values?: Record<string, string>;
    }
  | null;

function readForm(formData: FormData) {
  const values: Record<string, string> = {};
  for (const key of ["name", "email", "phone", "company", "status"]) {
    const value = formData.get(key);
    values[key] = typeof value === "string" ? value : "";
  }
  return values;
}

function invalid(error: z.ZodError, values: Record<string, string>): ContactFormState {
  const fieldErrors: Partial<Record<ContactFields, string>> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactFields;
    fieldErrors[field] ??= issue.message;
  }
  return { ok: false, fieldErrors, values };
}

function isUniqueEmailError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function refresh() {
  // The sidebar count lives in the layout, so revalidate from the layout down.
  revalidatePath("/contacts", "layout");
}

export async function createContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readForm(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  try {
    const contact = await db.contact.create({ data: parsed.data });
    refresh();
    return { ok: true, id: contact.id };
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return {
        ok: false,
        values,
        fieldErrors: { email: "Another contact already uses this email." },
      };
    }
    throw error;
  }
}

export async function updateContact(
  id: string,
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readForm(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error, values);

  try {
    await db.contact.update({ where: { id }, data: parsed.data });
    refresh();
    return { ok: true, id };
  } catch (error) {
    if (isUniqueEmailError(error)) {
      return {
        ok: false,
        values,
        fieldErrors: { email: "Another contact already uses this email." },
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, values, message: "This contact was deleted. Close this panel to see the current list." };
    }
    throw error;
  }
}

export async function deleteContact(id: string) {
  await db.contact.deleteMany({ where: { id } });
  refresh();
}
