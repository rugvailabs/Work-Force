import Link from "next/link";
import type { Metadata } from "next";
import { getCounts, listEmployees } from "@/lib/data";
import { q } from "@/lib/db";
import { approveEmployee } from "../actions";
import { Avatar, EmptyState, Icon, formatDate } from "../ui";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [counts, pending, unlinked] = await Promise.all([
    getCounts(),
    listEmployees({ status: "pending" }),
    q<{ id: string; full_name: string; reports_to_name: string }>(
      `SELECT id, full_name, reports_to_name FROM employees
       WHERE reports_to_id IS NULL AND reports_to_name IS NOT NULL
       ORDER BY full_name`
    ),
  ]);

  return (
    <>
      <div className="flex h-14 items-center border-b border-line px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Overview</h1>
      </div>

      <div className="mx-auto max-w-240 px-6 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="People" value={counts.total} />
          <Stat label="Approved" value={counts.approved} />
          <Stat
            label="Pending review"
            value={counts.pending}
            tone={counts.pending > 0 ? "pend" : undefined}
          />
          <Stat label="Departments" value={counts.departments} />
        </div>

        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Pending review
            </h2>
            {pending.length > 0 && (
              <span className="text-[13px] text-ink-3">
                {pending.length} waiting
              </span>
            )}
          </div>
          <div className="mt-3">
            {pending.length === 0 ? (
              <EmptyState
                title="All caught up"
                hint="New submissions from the staff form will appear here."
              />
            ) : (
              <ul className="card divide-y divide-line">
                {pending.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                  >
                    <Avatar name={p.full_name} size={32} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/people/${p.id}`}
                        className="text-[14px] font-medium hover:underline underline-offset-2"
                      >
                        {p.full_name}
                      </Link>
                      <p className="truncate text-[13px] text-ink-2">
                        {p.position}
                        {p.department ? ` · ${p.department}` : ""}
                      </p>
                    </div>
                    {p.reports_to_name && !p.reports_to_id && (
                      <span className="hidden items-center gap-1.5 rounded-md bg-pend-soft px-2 py-1 text-[12px] font-medium text-pend sm:inline-flex">
                        <Icon.alert className="h-3.5 w-3.5" />
                        Manager not linked
                      </span>
                    )}
                    <span className="hidden text-[13px] text-ink-3 sm:block">
                      {formatDate(p.created_at)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/people/${p.id}`}
                        className="btn btn-secondary h-8 px-3 text-[13px]"
                      >
                        Review
                      </Link>
                      <form action={approveEmployee.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="btn btn-primary h-8 px-3 text-[13px]"
                        >
                          <Icon.check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {unlinked.length > 0 && (
          <section className="mt-8">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Managers to link
            </h2>
            <p className="mt-1 text-[13px] text-ink-2">
              These people typed a manager&apos;s name that isn&apos;t connected
            to anyone in the directory yet.
            </p>
            <ul className="card mt-3 divide-y divide-line">
              {unlinked.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-4 px-4 py-2.5"
                >
                  <p className="min-w-0 truncate text-[13.5px]">
                    <span className="font-medium">{u.full_name}</span>
                    <span className="text-ink-2"> reports to </span>
                    <span className="rounded bg-[#f1f1ee] px-1.5 py-0.5 font-medium">
                      “{u.reports_to_name}”
                    </span>
                  </p>
                  <Link
                    href={`/admin/people/${u.id}/edit`}
                    className="btn btn-ghost h-7.5 shrink-0 px-2.5 text-[13px]"
                  >
                    <Icon.link className="h-3.5 w-3.5" />
                    Link
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "pend";
}) {
  return (
    <div className="card px-4 py-3.5">
      <p className="text-[12.5px] font-medium text-ink-3">{label}</p>
      <p
        className={`mt-1 text-[22px] font-semibold tracking-tight tabular-nums ${
          tone === "pend" ? "text-pend" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
