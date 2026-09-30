"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession, safeRedirectPath } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type LoginState = { error: string; username: string } | null;

// Compared against when the username doesn't exist, so both paths take similar time.
const dummyHash = hashPassword("not-a-real-password");

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Enter your username and password.", username };
  }

  const user = await db.user.findUnique({ where: { username } });
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
  if (!user || !ok) {
    return { error: "That username and password don’t match. Check them and try again.", username };
  }

  await createSession(user.id);
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
