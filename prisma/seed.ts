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

async function main() {
  for (const contact of contacts) {
    await db.contact.upsert({
      where: { email: contact.email },
      update: contact,
      create: contact,
    });
  }
  console.log(`Seeded ${contacts.length} contacts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
