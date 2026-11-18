import Link from "next/link";
import type { Metadata } from "next";
import { getApprovedEmployees, getDepartments } from "@/lib/data";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add your details",
};

export default async function RegisterPage() {
  const [departments, people] = await Promise.all([
    getDepartments(),
    getApprovedEmployees(),
  ]);

  return (
    <main className="flex-1">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-130 items-center gap-3 px-5">
          <Link
            href="/"
            className="flex h-8 w-8 -ml-2 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-[#efefec] hover:text-ink"
            aria-label="Back to start"
          >
            <svg
              className="h-4.5 w-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-ink text-[11px] font-semibold text-white">
              B
            </span>
            <span className="text-[14px] font-semibold tracking-tight">
              Staff directory
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-130 px-5 pb-24 pt-8">
        <h1 className="text-[24px] font-semibold tracking-tight">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          Answer in your own words — short answers are fine.
        </p>
        <RegistrationForm departments={departments} people={people} />
      </div>
    </main>
  );
}
