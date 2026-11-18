import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-85">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white">
            B
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Bitnbin Directory
          </span>
        </div>
        <h1 className="mt-8 text-[20px] font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-1 text-[14px] text-ink-2">
          For the people who manage the directory.
        </p>
        <LoginForm />
        <p className="mt-8 text-[13px] text-ink-3">
          Just here to add your details?{" "}
          <Link
            href="/register"
            className="font-medium text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Use the staff form
          </Link>
        </p>
      </div>
    </main>
  );
}
