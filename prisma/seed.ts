import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseConfig } from "../src/lib/database-url";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaLibSql(databaseConfig());
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

/** Mid-month, `n` months before the current local month. */
function monthsAgo(n: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - n, 15, 12);
}
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

const closedAt: Record<string, Date> = {
  "seed-deal-7": daysAgo(0),
  "seed-deal-8": daysAgo(21),
};

// Won deals from earlier months, so revenue by month has history to show.
const history = [
  { months: 11, title: "Route planning pilot", value: 12000, email: "ana.ruiz@northwindlogistics.com" },
  { months: 10, title: "Starter license, 20 seats", value: 6400, email: "marcus@brightpath.io" },
  { months: 9, title: "Patient intake forms", value: 14500, email: "priya.n@kestrelhealth.com" },
  { months: 7, title: "Nordic distribution add-on", value: 19800, email: "hannah@fjordsupply.se" },
  { months: 6, title: "Contract review workspace", value: 11200, email: "d.okafor@meridianlegal.com" },
  { months: 5, title: "Loyalty program setup", value: 5600, email: "sophie.tremblay@lumencafe.ca" },
  { months: 4, title: "Fleet tracking, phase 1", value: 27500, email: "ana.ruiz@northwindlogistics.com" },
  { months: 3, title: "Clinic scheduling upgrade", value: 9900, email: "priya.n@kestrelhealth.com" },
  { months: 2, title: "Dental practice onboarding", value: 16800, email: "rachel@clearwaterdental.com" },
  { months: 1, title: "Starter license renewal", value: 8200, email: "marcus@brightpath.io" },
];

async function main() {
  // The one login. Set ADMIN_PASSWORD to use something other than the demo
  // password (do this in production). Re-running the seed resets the password.
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() || "admin123";
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    console.warn('ADMIN_PASSWORD is not set, so "admin" gets the demo password "admin123".');
  }
  const passwordHash = await hashPassword(adminPassword);
  await db.user.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: { username: "admin", passwordHash },
  });
  console.log('Seeded user "admin".');

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
    const data = { ...deal, position, contactId: contact?.id ?? null, closedAt: closedAt[deal.id] ?? null };
    await db.deal.upsert({ where: { id: deal.id }, update: data, create: data });
  }

  for (const [i, { months, email, ...deal }] of history.entries()) {
    const contact = await db.contact.findUnique({ where: { email }, select: { id: true } });
    const id = `seed-won-${i + 1}`;
    const data = {
      ...deal,
      id,
      stage: "won",
      position: (positions.won = (positions.won ?? -1) + 1),
      contactId: contact?.id ?? null,
      closedAt: monthsAgo(months),
      createdAt: monthsAgo(months + 1),
    };
    await db.deal.upsert({ where: { id }, update: data, create: data });
  }
  console.log(`Seeded ${deals.length} open and recent deals, plus ${history.length} won deals from earlier months.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
