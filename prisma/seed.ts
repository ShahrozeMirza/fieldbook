import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const db = new PrismaClient({ adapter });

const contacts = [
  { name: "Ana Ruiz", email: "ana.ruiz@northwindlogistics.com", phone: "+1 (415) 555-0142", company: "Northwind Logistics", status: "customer" },
  { name: "Marcus Oyelaran", email: "marcus@brightpath.io", phone: "+1 (646) 555-0187", company: "Brightpath", status: "prospect" },
  { name: "Priya Natarajan", email: "priya.n@kestrelhealth.com", phone: "+1 (312) 555-0119", company: "Kestrel Health", status: "customer" },
  { name: "Tomás Herrera", email: "tomas.herrera@alturabuild.mx", phone: "+52 55 5555 0134", company: "Altura Construcción", status: "lead" },
  { name: "Hannah Lindqvist", email: "hannah@fjordsupply.se", phone: "+46 8 555 012 77", company: "Fjord Supply", status: "customer" },
  { name: "Daniel Okafor", email: "d.okafor@meridianlegal.com", phone: "+1 (202) 555-0163", company: "Meridian Legal", status: "prospect" },
  { name: "Sophie Tremblay", email: "sophie.tremblay@lumencafe.ca", phone: "+1 (514) 555-0108", company: "Lumen Café Group", status: "lead" },
  { name: "Kenji Watanabe", email: "kenji.w@harborlane.jp", phone: "+81 3-5555-0191", company: "Harbor Lane Trading", status: "inactive" },
  { name: "Rachel Goldberg", email: "rachel@clearwaterdental.com", phone: "+1 (617) 555-0175", company: "Clearwater Dental", status: "customer" },
  { name: "Leo Castellano", email: "leo.castellano@gmail.com", phone: null, company: null, status: "lead" },
];

// Stable ids keep the seed safe to re-run.
const deals = [
  { id: "seed-deal-1", title: "Site safety pilot", value: 9800, stage: "lead", email: "tomas.herrera@alturabuild.mx" },
  { id: "seed-deal-2", title: "POS integration for 12 cafés", value: 7200, stage: "lead", email: "sophie.tremblay@lumencafe.ca" },
  { id: "seed-deal-3", title: "Annual platform license", value: 18500, stage: "contacted", email: "marcus@brightpath.io" },
  { id: "seed-deal-4", title: "Records migration", value: 15000, stage: "contacted", email: "d.okafor@meridianlegal.com" },
  { id: "seed-deal-5", title: "Fleet tracking rollout", value: 48000, stage: "proposal", email: "ana.ruiz@northwindlogistics.com" },
  { id: "seed-deal-6", title: "Warehouse expansion add-on", value: 22400, stage: "proposal", email: "hannah@fjordsupply.se" },
  { id: "seed-deal-7", title: "Clinic onboarding, 4 sites", value: 32000, stage: "won", email: "priya.n@kestrelhealth.com" },
  { id: "seed-deal-8", title: "Import compliance module", value: 26000, stage: "lost", email: "kenji.w@harborlane.jp" },
];

async function main() {
  for (const contact of contacts) {
    await db.contact.upsert({
      where: { email: contact.email },
      update: contact,
      create: contact,
    });
  }
  console.log(`Seeded ${contacts.length} contacts.`);

  const positions: Record<string, number> = {};
  for (const { email, ...deal } of deals) {
    const contact = await db.contact.findUnique({ where: { email }, select: { id: true } });
    const position = (positions[deal.stage] = (positions[deal.stage] ?? -1) + 1);
    const data = { ...deal, position, contactId: contact?.id ?? null };
    await db.deal.upsert({ where: { id: deal.id }, update: data, create: data });
  }
  console.log(`Seeded ${deals.length} deals.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
