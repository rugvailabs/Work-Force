"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../ui";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: Icon.overview, exact: true },
  { href: "/admin/people", label: "People", icon: Icon.people, exact: false },
  { href: "/admin/chart", label: "Org chart", icon: Icon.chart, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:mt-2 md:flex-1 md:flex-col md:pb-0">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors ${
              active
                ? "bg-[#ebebe8] font-medium text-ink"
                : "text-ink-2 hover:bg-[#efefec] hover:text-ink"
            }`}
          >
            <item.icon
              className={`h-4 w-4 ${active ? "text-ink" : "text-ink-3"}`}
            />
            {item.label}
          </Link>
        );
      })}
      <a
        href="/admin/export"
        className="flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] text-ink-2 transition-colors hover:bg-[#efefec] hover:text-ink"
      >
        <Icon.download className="h-4 w-4 text-ink-3" />
        Export CSV
      </a>
    </nav>
  );
}
