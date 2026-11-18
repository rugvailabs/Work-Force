"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {
    error: null,
  });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <input
          id="username"
          name="username"
          className="input"
          autoComplete="username"
          autoFocus
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-[13.5px] text-danger">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending ? <span className="spinner" aria-hidden /> : null}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
