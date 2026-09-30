import { z } from "zod";

export const STATUSES = ["lead", "prospect", "customer", "inactive"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  lead: "Lead",
  prospect: "Prospect",
  customer: "Customer",
  inactive: "Inactive",
};

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((v) => (v === "" ? null : v));

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter an email address.")
    .pipe(z.email("Enter a valid email address, like ana@company.com.")),
  phone: optionalText,
  company: optionalText,
  status: z.enum(STATUSES, { error: "Choose a status." }),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFields = keyof ContactInput;

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: Status;
};
