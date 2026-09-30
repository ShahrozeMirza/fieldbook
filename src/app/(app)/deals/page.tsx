import type { Metadata } from "next";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { isStage, type DealCard } from "@/lib/deals";
import { DealsBoard } from "./_components/deals-board";

export const metadata: Metadata = { title: "Deals" };

export default async function DealsPage() {
  await connection();
  const [deals, contacts] = await Promise.all([
    db.deal.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: { contact: { select: { id: true, name: true, company: true } } },
    }),
    db.contact.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  const cards: DealCard[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    value: d.value,
    stage: isStage(d.stage) ? d.stage : "lead",
    contact: d.contact,
  }));

  return (
    <div className="px-4 pt-6 pb-16 md:px-10 md:pt-10">
      <DealsBoard deals={cards} contacts={contacts} />
    </div>
  );
}
