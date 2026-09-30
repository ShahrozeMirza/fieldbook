import { z } from "zod";

export const STAGES = ["lead", "contacted", "proposal", "won", "lost"] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  contacted: "Contacted",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

/** Stages where the deal is still being worked. */
export const OPEN_STAGES: readonly Stage[] = ["lead", "contacted", "proposal"];

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatMoney(dollars: number) {
  return usd.format(dollars);
}

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Enter a deal name.").max(120),
  value: z
    .string()
    .trim()
    .min(1, "Enter a value in dollars, like 12,500.")
    .transform((v) => v.replace(/[$,\s]/g, ""))
    .pipe(z.string().regex(/^\d+$/, "Use whole dollars, like 12,500."))
    .transform(Number)
    .pipe(z.number().max(1_000_000_000, "Enter a value under $1,000,000,000.")),
  stage: z.enum(STAGES, { error: "Choose a stage." }),
  contactId: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v)),
});

export type DealFields = keyof z.input<typeof dealSchema>;

export type DealCard = {
  id: string;
  title: string;
  value: number;
  stage: Stage;
  contact: { id: string; name: string; company: string | null } | null;
};

export type ContactOption = { id: string; name: string; company: string | null };
