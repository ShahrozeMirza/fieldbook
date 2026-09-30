import type { Metadata } from "next";
import { db } from "@/lib/db";
import { STATUSES, isStatus, type Status } from "@/lib/contacts";
import { ContactsView } from "./_components/contacts-view";
import { FilterBar } from "./_components/filter-bar";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = isStatus(params.status) ? params.status : null;

  const search = q
    ? {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { company: { contains: q } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const [contacts, grouped, total] = await Promise.all([
    db.contact.findMany({
      where: { ...search, ...(status ? { status } : {}) },
      orderBy: [{ name: "asc" }],
    }),
    db.contact.groupBy({ by: ["status"], where: search, _count: { _all: true } }),
    db.contact.count(),
  ]);

  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>;
  for (const row of grouped) if (isStatus(row.status)) counts[row.status] = row._count._all;

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-6 pb-16 md:px-10 md:pt-10">
      <ContactsView
        contacts={contacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          status: isStatus(c.status) ? c.status : "lead",
        }))}
        total={total}
        query={q}
        filters={<FilterBar query={q} status={status} counts={counts} />}
      />
    </div>
  );
}
