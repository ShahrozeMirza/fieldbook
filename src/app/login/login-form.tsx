"use client";

import { useActionState } from "react";
import { Field, inputClass } from "@/components/form";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <p id="login-error" role="alert" className="rounded-control bg-danger-wash px-3 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <Field id="username" label="Username">
        <input
          id="username"
          name="username"
          defaultValue={state?.username}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          required
          aria-describedby={state?.error ? "login-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="password" label="Password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={state?.error ? "login-error" : undefined}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-control bg-signal px-4 text-sm font-medium text-white hover:bg-signal-strong disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
