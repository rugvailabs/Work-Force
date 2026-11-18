import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Details sent",
};

export default function DonePage() {
  return (
    <main className="flex-1 flex items-center">
      <div className="mx-auto w-full max-w-105 px-5 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
          <svg
            className="h-7 w-7 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-6 text-[24px] font-semibold tracking-tight">
          Thank you — details sent
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15.5px] leading-relaxed text-ink-2">
          The office will review your details and add you to the directory.
          You don&apos;t need to do anything else.
        </p>
        <p className="mt-2 text-[14px] text-ink-3">
          Made a mistake? Just tell the office and they will fix it.
        </p>
        <Link href="/" className="btn btn-secondary btn-lg mt-8">
          Back to start
        </Link>
      </div>
    </main>
  );
}
