import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { Icon } from "../ui";
import { AdminNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-line bg-bg md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-ink text-[11px] font-semibold text-white">
            B
          </span>
          <span className="text-[14px] font-semibold tracking-tight">
            Bitnbin Directory
          </span>
        </div>
        <AdminNav />
        <div className="hidden border-t border-line px-3 py-3 md:block">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#e9e9e5] text-[11px] font-semibold text-ink-2">
                {session.username.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate text-[13px] text-ink-2">
                {session.username}
              </span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-[#ebebe8] hover:text-ink"
                title="Sign out"
                aria-label="Sign out"
              >
                <Icon.logout className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
