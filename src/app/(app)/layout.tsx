import { connection } from "next/server";
import { Sidebar } from "@/components/sidebar";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // better-sqlite3 is synchronous, so opt out of prerendering to read live counts.
  await connection();
  const user = await requireUser();
  const [contacts, deals] = await Promise.all([db.contact.count(), db.deal.count()]);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <Sidebar counts={{ contacts, deals }} username={user.username} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
