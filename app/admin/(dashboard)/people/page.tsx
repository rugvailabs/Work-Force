import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDepartments, listEmployees } from "@/lib/data";
import { Avatar, EmptyState, RoleBadge, StatusBadge } from "../../ui";
import { FilterBar } from "./filter-bar";

export const metadata: Metadata = { title: "People" };
export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const [departments, people] = await Promise.all([
    getDepartments(),
    listEmployees({
      search: one(params.q),
      department: one(params.dept),
      role: one(params.role),
      status: one(params.status),
    }),
  ]);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-line px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">People</h1>
        <span className="text-[13px] tabular-nums text-ink-3">
          {people.length} {people.length === 1 ? "person" : "people"}
        </span>
      </div>

      <div className="mx-auto max-w-240 px-6 py-5">
        <Suspense>
          <FilterBar departments={departments} />
        </Suspense>

        <div className="card mt-4 overflow-x-auto">
          {people.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No one matches these filters"
                hint="Try a different search or clear the filters."
              />
            </div>
          ) : (
            <table className="w-full min-w-175 border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[12px] font-medium uppercase tracking-wide text-ink-3">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Position</th>
                  <th className="px-4 py-2.5 font-medium">Department</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Reports to</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr
                    key={p.id}
                    className="group relative border-b border-line transition-colors last:border-b-0 hover:bg-[#fafaf8]"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name} size={28} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/people/${p.id}`}
                            className="block truncate text-[13.5px] font-medium after:absolute after:inset-0 group-hover:text-accent-hover"
                          >
                            {p.full_name}
                          </Link>
                          <p className="truncate text-[12.5px] text-ink-3">
                            {p.email ?? p.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[13.5px]">{p.position}</td>
                    <td className="px-4 py-2.5 text-[13.5px] text-ink-2">
                      {p.department ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <RoleBadge role={p.role} />
                    </td>
                    <td className="px-4 py-2.5 text-[13.5px] text-ink-2">
                      {p.manager_name ??
                        (p.reports_to_name ? (
                          <span className="text-pend">
                            “{p.reports_to_name}”
                          </span>
                        ) : (
                          "—"
                        ))}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
