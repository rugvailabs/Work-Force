"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "../../ui";

type Department = { id: number; name: string };

export function FilterBar({ departments }: { departments: Department[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const onSearch = (value: string) => {
    setSearch(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => apply("q", value.trim()), 250);
  };

  const hasFilters =
    Boolean(params.get("q")) ||
    Boolean(params.get("dept")) ||
    Boolean(params.get("role")) ||
    Boolean(params.get("status"));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-55 flex-1 sm:max-w-70">
        <Icon.search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="input pl-9.5"
          placeholder="Search name, position, phone…"
          aria-label="Search people"
        />
        {isPending && (
          <span className="spinner spinner-dark absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>
      <select
        className="select select-inline"
        value={params.get("dept") ?? ""}
        onChange={(e) => apply("dept", e.target.value)}
        aria-label="Filter by department"
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        className="select select-inline"
        value={params.get("role") ?? ""}
        onChange={(e) => apply("role", e.target.value)}
        aria-label="Filter by role"
      >
        <option value="">All roles</option>
        <option>Leadership</option>
        <option>Management</option>
        <option>Staff</option>
        <option>Support</option>
      </select>
      <select
        className="select select-inline"
        value={params.get("status") ?? ""}
        onChange={(e) => apply("status", e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
      </select>
      {hasFilters && (
        <button
          type="button"
          className="btn btn-ghost h-8.5 px-2.5 text-[13px]"
          onClick={() => {
            setSearch("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
