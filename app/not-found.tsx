import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="text-center">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-3">
          404
        </p>
        <h1 className="mt-2 text-[22px] font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-[14.5px] text-ink-2">
          This page doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/" className="btn btn-secondary mt-6">
          Back to start
        </Link>
      </div>
    </main>
  );
}
