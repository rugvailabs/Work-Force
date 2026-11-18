import type { Role, Status } from "@/lib/data";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function Avatar({
  name,
  size = 28,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 select-none items-center justify-center rounded-full bg-[#e9e9e5] font-semibold text-ink-2 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-[12px] font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-pend-soft px-2.5 py-0.5 text-[12px] font-medium text-pend">
      <span className="h-1.5 w-1.5 rounded-full bg-pend" aria-hidden />
      Pending
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-surface px-2 py-0.5 text-[12px] font-medium text-ink-2">
      {role}
    </span>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="text-[14px] font-medium text-ink-2">{title}</p>
      {hint && <p className="mt-1 text-[13px] text-ink-3">{hint}</p>}
    </div>
  );
}

type IconProps = { className?: string };

const base = (className = "h-4 w-4") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Icon = {
  overview: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  ),
  people: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  chart: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <rect x="9" y="2.5" width="6" height="5" rx="1.25" />
      <rect x="2.5" y="16.5" width="6" height="5" rx="1.25" />
      <rect x="15.5" y="16.5" width="6" height="5" rx="1.25" />
      <path d="M12 7.5v4m0 0H5.5a0 0 0 0 0 0 0v5m6.5-5h6.5a0 0 0 0 1 0 0v5" />
    </svg>
  ),
  download: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </svg>
  ),
  logout: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  search: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  check: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  chevronRight: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  edit: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  alert: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4m0 4h.01" />
    </svg>
  ),
  link: ({ className }: IconProps) => (
    <svg {...base(className)}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
};
