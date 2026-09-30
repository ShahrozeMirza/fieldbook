import { Sidebar } from "@/components/sidebar";
import { db } from "@/lib/db";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const contactCount = await db.contact.count();

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <Sidebar contactCount={contactCount} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
