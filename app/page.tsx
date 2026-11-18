import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-105 px-5 pt-16 pb-10 flex-1 flex flex-col sm:pt-24">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white">
            B
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Bitnbin
          </span>
        </div>

        <h1 className="mt-10 text-[28px] leading-[1.2] font-semibold tracking-tight text-balance">
          Add yourself to the staff directory
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
          We are making one list of everyone who works here — from the office
          to the gate. Tell us who you are and who you work with. It takes
          about two minutes.
        </p>

        <Link href="/register" className="btn btn-primary btn-lg mt-8 w-full">
          Add my details
        </Link>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-[13px] font-medium text-ink-3 uppercase tracking-wide">
            Good to know
          </p>
          <ul className="mt-3 space-y-2.5 text-[14.5px] text-ink-2">
            <li className="flex gap-2.5">
              <Check />
              You do not need a password or an account.
            </li>
            <li className="flex gap-2.5">
              <Check />
              Keep your phone number handy.
            </li>
            <li className="flex gap-2.5">
              <Check />
              If you are not sure about something, give your best answer — the
              office can correct it later.
            </li>
          </ul>
        </div>

        <footer className="mt-auto pt-12 flex items-center justify-between text-[13px] text-ink-3">
          <span>Bitnbin · Staff directory</span>
          <Link
            href="/admin"
            className="hover:text-ink-2 transition-colors underline-offset-2 hover:underline"
          >
            Admin sign in
          </Link>
        </footer>
      </div>
    </main>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.75 h-4 w-4 shrink-0 text-accent"
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
  );
}
