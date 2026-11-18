"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "../../ui";

export type ChartNode = {
  id: string;
  name: string;
  position: string;
  department: string | null;
  role: string;
  children: ChartNode[];
};

export function OrgTree({ roots }: { roots: ChartNode[] }) {
  return (
    <ul className="space-y-1">
      {roots.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} />
      ))}
    </ul>
  );
}

function countDescendants(node: ChartNode): number {
  return node.children.reduce((n, c) => n + 1 + countDescendants(c), 0);
}

function TreeItem({ node, depth }: { node: ChartNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const team = countDescendants(node);

  return (
    <li>
      <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#fafaf8]">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-[#ebebe8] hover:text-ink"
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            aria-expanded={open}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-150 ${
                open ? "rotate-90" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span className="h-6 w-6 shrink-0" aria-hidden />
        )}
        <Avatar name={node.name} size={30} />
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
          <Link
            href={`/admin/people/${node.id}`}
            className="truncate text-[13.5px] font-medium hover:underline underline-offset-2"
          >
            {node.name}
          </Link>
          <span className="truncate text-[12.5px] text-ink-2">
            {node.position}
          </span>
          {node.department && depth < 2 && (
            <span className="hidden truncate text-[12px] text-ink-3 sm:inline">
              {node.department}
            </span>
          )}
        </div>
        {hasChildren && (
          <span className="ml-auto shrink-0 rounded-full bg-[#f1f1ee] px-2 py-0.5 text-[11.5px] font-medium tabular-nums text-ink-2">
            {team}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <ul className="ml-[22px] space-y-1 border-l border-line pl-3">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
