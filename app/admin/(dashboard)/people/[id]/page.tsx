import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAssignees,
  getAssigners,
  getChainOfCommand,
  getDirectReports,
  getEmployee,
  type Employee,
} from "@/lib/data";
import { approveEmployee, deleteEmployee } from "../../../actions";
import {
  Avatar,
  Icon,
  RoleBadge,
  StatusBadge,
  formatDate,
} from "../../../ui";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getEmployee(id);
  return { title: person?.full_name ?? "Person" };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getEmployee(id);
  if (!person) notFound();

  const [chain, reports, assigners, assignees] = await Promise.all([
    getChainOfCommand(id),
    getDirectReports(id),
    getAssigners(id),
    getAssignees(id),
  ]);
  const chainTopDown = [...chain].reverse();

  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-line px-6 text-[13.5px]">
        <Link
          href="/admin/people"
          className="text-ink-3 transition-colors hover:text-ink"
        >
          People
        </Link>
        <Icon.chevronRight className="h-3.5 w-3.5 text-ink-3" />
        <span className="truncate font-medium">{person.full_name}</span>
      </div>

      <div className="mx-auto max-w-240 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={person.full_name} size={52} />
            <div>
              <h1 className="text-[20px] font-semibold tracking-tight">
                {person.full_name}
              </h1>
              <p className="mt-0.5 text-[14px] text-ink-2">
                {person.position}
                {person.department ? ` · ${person.department}` : ""}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={person.status} />
                <RoleBadge role={person.role} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/people/${person.id}/edit`}
              className="btn btn-secondary h-8 px-3 text-[13px]"
            >
              <Icon.edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            {person.status === "pending" && (
              <form action={approveEmployee.bind(null, person.id)}>
                <button
                  type="submit"
                  className="btn btn-primary h-8 px-3 text-[13px]"
                >
                  <Icon.check className="h-3.5 w-3.5" />
                  Approve
                </button>
              </form>
            )}
            <DeleteButton action={deleteEmployee.bind(null, person.id)} />
          </div>
        </div>

        {person.status === "pending" && (
          <div className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-[#ecd9ae] bg-pend-soft px-4 py-3 text-[13.5px] leading-snug text-pend">
            <Icon.alert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Submitted {formatDate(person.created_at)} from the staff form.
              Review the details, then approve to add{" "}
              {person.full_name.split(" ")[0]} to the directory and org chart.
            </p>
          </div>
        )}

        {person.reports_to_name && !person.reports_to_id && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#ecd9ae] bg-pend-soft px-4 py-3">
            <p className="flex items-start gap-2.5 text-[13.5px] leading-snug text-pend">
              <Icon.link className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Says they report to{" "}
                <strong>“{person.reports_to_name}”</strong>, who isn&apos;t
                linked to anyone in the directory yet.
              </span>
            </p>
            <Link
              href={`/admin/people/${person.id}/edit`}
              className="btn btn-secondary h-7.5 px-2.5 text-[12.5px]"
            >
              Link manager
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(16rem,18rem)]">
          <div className="min-w-0 space-y-6">
            <Panel title="Chain of command">
              {chainTopDown.length === 0 && !person.reports_to_name ? (
                <p className="px-4 py-4 text-[13.5px] text-ink-2">
                  {person.full_name} is at the top — they don&apos;t report to
                  anyone.
                </p>
              ) : (
                <ol className="px-4 py-3">
                  {chainTopDown.map((link, i) => (
                    <ChainRow key={link.id} person={link} first={i === 0} />
                  ))}
                  {person.reports_to_name && !person.reports_to_id && (
                    <li className="relative">
                      <ChainConnector first={chainTopDown.length === 0} />
                      <div className="flex items-center gap-3 py-1.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line-strong text-[11px] font-medium text-ink-3">
                          ?
                        </span>
                        <p className="text-[13.5px] text-ink-2">
                          “{person.reports_to_name}” — not registered yet
                        </p>
                      </div>
                    </li>
                  )}
                  <li className="relative">
                    <ChainConnector
                      first={
                        chainTopDown.length === 0 && !person.reports_to_name
                      }
                    />
                    <div className="flex items-center gap-3 rounded-lg bg-accent-soft px-2.5 py-2 -ml-2.5">
                      <Avatar name={person.full_name} size={28} />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold">
                          {person.full_name}
                        </p>
                        <p className="truncate text-[12.5px] text-ink-2">
                          {person.position}
                        </p>
                      </div>
                    </div>
                  </li>
                </ol>
              )}
            </Panel>

            <Panel
              title="Reports to them"
              count={reports.length}
            >
              {reports.length === 0 ? (
                <p className="px-4 py-4 text-[13.5px] text-ink-2">
                  No one reports to {person.full_name.split(" ")[0]}.
                </p>
              ) : (
                <PersonList people={reports} />
              )}
            </Panel>

            <Panel title="Gets work from" count={assigners.length}>
              {assigners.length === 0 ? (
                <p className="px-4 py-4 text-[13.5px] text-ink-2">
                  No one listed.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {assigners.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      {a.assigner_id ? (
                        <>
                          <Avatar name={a.name} size={28} />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/admin/people/${a.assigner_id}`}
                              className="block truncate text-[13.5px] font-medium hover:underline underline-offset-2"
                            >
                              {a.name}
                            </Link>
                            <p className="truncate text-[12.5px] text-ink-3">
                              {a.position}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-[11px] font-medium text-ink-3">
                            ?
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-medium">
                              “{a.name}”
                            </p>
                            <p className="text-[12.5px] text-pend">
                              Typed name — not linked yet
                            </p>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Gives work to" count={assignees.length}>
              {assignees.length === 0 ? (
                <p className="px-4 py-4 text-[13.5px] text-ink-2">
                  No one has listed {person.full_name.split(" ")[0]} as the
                  person who gives them work.
                </p>
              ) : (
                <PersonList people={assignees} />
              )}
            </Panel>

            <Panel title="Day-to-day work">
              <p className="whitespace-pre-line px-4 py-3.5 text-[13.5px] leading-relaxed text-ink-2">
                {person.duties || "Not described."}
              </p>
            </Panel>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Panel title="Details">
              <dl className="px-4 py-3 text-[13.5px]">
                <DetailRow label="Phone">
                  <a
                    href={`tel:${person.phone}`}
                    className="hover:underline underline-offset-2"
                  >
                    {person.phone}
                  </a>
                </DetailRow>
                <DetailRow label="Email">
                  {person.email ? (
                    <a
                      href={`mailto:${person.email}`}
                      className="break-all hover:underline underline-offset-2"
                    >
                      {person.email}
                    </a>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Department">
                  {person.department ?? <span className="text-ink-3">—</span>}
                </DetailRow>
                <DetailRow label="Reports to">
                  {person.manager_name ? (
                    <Link
                      href={`/admin/people/${person.reports_to_id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {person.manager_name}
                    </Link>
                  ) : person.reports_to_name ? (
                    <span className="text-pend">
                      “{person.reports_to_name}”
                    </span>
                  ) : (
                    <span className="text-ink-3">No one</span>
                  )}
                </DetailRow>
                <DetailRow label="Submitted">
                  {formatDate(person.created_at)}
                </DetailRow>
              </dl>
            </Panel>
          </aside>
        </div>
      </div>
    </>
  );
}

function Panel({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-baseline justify-between border-b border-line px-4 py-2.5">
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
        {typeof count === "number" && count > 0 && (
          <span className="text-[12.5px] tabular-nums text-ink-3">{count}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function ChainConnector({ first }: { first: boolean }) {
  if (first) return null;
  return (
    <span
      className="absolute left-[13px] -top-1.5 h-4 w-px bg-line-strong"
      aria-hidden
    />
  );
}

function ChainRow({ person, first }: { person: Employee; first: boolean }) {
  return (
    <li className="relative">
      <ChainConnector first={first} />
      <div className="flex items-center gap-3 py-1.5">
        <Avatar name={person.full_name} size={28} />
        <div className="min-w-0">
          <Link
            href={`/admin/people/${person.id}`}
            className="block truncate text-[13.5px] font-medium hover:underline underline-offset-2"
          >
            {person.full_name}
          </Link>
          <p className="truncate text-[12.5px] text-ink-3">
            {person.position}
            {person.department ? ` · ${person.department}` : ""}
          </p>
        </div>
      </div>
    </li>
  );
}

function PersonList({ people }: { people: Employee[] }) {
  return (
    <ul className="divide-y divide-line">
      {people.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
          <Avatar name={p.full_name} size={28} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/people/${p.id}`}
              className="block truncate text-[13.5px] font-medium hover:underline underline-offset-2"
            >
              {p.full_name}
            </Link>
            <p className="truncate text-[12.5px] text-ink-3">{p.position}</p>
          </div>
          {p.status === "pending" && <StatusBadge status="pending" />}
        </li>
      ))}
    </ul>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <dt className="shrink-0 text-ink-3">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{children}</dd>
    </div>
  );
}
