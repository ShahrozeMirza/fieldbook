import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mark } from "@/components/mark";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target = safeRedirectPath(next);

  if (await getCurrentUser()) redirect(target);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[360px] overflow-hidden rounded-panel border border-rule bg-sheet">
        <div className="flex items-center gap-2.5 bg-ink px-6 py-4 text-base font-semibold text-white">
          <Mark />
          Fieldbook
        </div>
        <div className="px-6 pt-6 pb-7">
          <h1 className="text-lg font-semibold text-text">Sign in</h1>
          <p className="mt-1 mb-5 text-sm text-muted">Use your Fieldbook username and password.</p>
          <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-control bg-signal-wash px-3 py-2.5 text-sm">
            <dt className="text-muted">Username</dt>
            <dd className="font-medium text-text">admin</dd>
            <dt className="text-muted">Password</dt>
            <dd className="font-medium text-text">admin123</dd>
          </dl>
          <LoginForm next={target} />
        </div>
      </div>
    </main>
  );
}
