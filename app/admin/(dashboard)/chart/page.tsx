import Link from "next/link";
import type { Metadata } from "next";
import { getOrgTree, type TreeNode } from "@/lib/data";
import { EmptyState } from "../../ui";
import { OrgTree, type ChartNode } from "./org-tree";

export const metadata: Metadata = { title: "Org chart" };
export const dynamic = "force-dynamic";

function toChartNode(node: TreeNode): ChartNode {
  return {
    id: node.id,
    name: node.full_name,
    position: node.position,
    department: node.department,
    role: node.role,
    children: node.children.map(toChartNode),
  };
}

export default async function ChartPage() {
  const { roots, unplaced } = await getOrgTree();

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-line px-6">
        <h1 className="text-[15px] font-semibold tracking-tight">Org chart</h1>
        <span className="text-[13px] text-ink-3">Approved people only</span>
      </div>

      <div className="mx-auto max-w-240 px-6 py-6">
        {roots.length === 0 ? (
          <EmptyState
            title="No approved people yet"
            hint="Approve submissions to build the chart."
          />
        ) : (
          <div className="card px-4 py-4">
            <OrgTree roots={roots.map(toChartNode)} />
          </div>
        )}

        {unplaced.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Not placed yet
            </h2>
            <p className="mt-1 text-[13px] text-ink-2">
              Approved, but their manager isn&apos;t in the approved directory
              yet, so they can&apos;t be placed in the chart.
            </p>
            <ul className="card mt-3 divide-y divide-line">
              {unplaced.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 text-[13.5px]"
                >
                  <span>
                    <Link
                      href={`/admin/people/${u.id}`}
                      className="font-medium hover:underline underline-offset-2"
                    >
                      {u.full_name}
                    </Link>
                    <span className="text-ink-2"> · {u.position}</span>
                  </span>
                  <Link
                    href={`/admin/people/${u.id}/edit`}
                    className="btn btn-ghost h-7.5 shrink-0 px-2.5 text-[13px]"
                  >
                    Fix
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
