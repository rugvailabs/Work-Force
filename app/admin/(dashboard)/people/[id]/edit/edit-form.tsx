"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AssignerRow, Employee } from "@/lib/data";
import type { UpdateState } from "../../../../actions";

type Department = { id: number; name: string };
type Person = { id: string; full_name: string; position: string };

export function EditForm({
  action,
  person,
  departments,
  people,
  assigners,
}: {
  action: (prev: UpdateState, formData: FormData) => Promise<UpdateState>;
  person: Employee;
  departments: Department[];
  people: Person[];
  assigners: AssignerRow[];
}) {
  const [state, formAction] = useActionState<UpdateState, FormData>(action, {
    error: null,
  });

  const linkedAssignerIds = new Set(
    assigners.filter((a) => a.assigner_id).map((a) => a.assigner_id as string)
  );
  const rawAssigners = assigners.filter((a) => !a.assigner_id);
  const hasRawManager = Boolean(person.reports_to_name && !person.reports_to_id);

  return (
    <form action={formAction} className="mt-6 space-y-7">
      <section className="card p-5">
        <h2 className="text-[13px] font-semibold">Personal details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input
              name="full_name"
              className="input"
              defaultValue={person.full_name}
              required
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              name="phone"
              className="input"
              defaultValue={person.phone}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email</label>
            <input
              name="email"
              type="email"
              className="input"
              defaultValue={person.email ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-[13px] font-semibold">Job</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Position</label>
            <input
              name="position"
              className="input"
              defaultValue={person.position}
              required
            />
          </div>
          <div>
            <label className="label">Department</label>
            <select
              name="department_id"
              className="select"
              defaultValue={person.department_id ?? ""}
            >
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Role</label>
            <select name="role" className="select" defaultValue={person.role}>
              <option>Leadership</option>
              <option>Management</option>
              <option>Staff</option>
              <option>Support</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              className="select"
              defaultValue={person.status}
            >
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-[13px] font-semibold">Reporting</h2>
        <div className="mt-4">
          <label className="label">Reports to</label>
          {hasRawManager && (
            <p className="mb-2 rounded-md bg-pend-soft px-3 py-2 text-[13px] leading-snug text-pend">
              They typed <strong>“{person.reports_to_name}”</strong> as their
              manager. Pick the right person below to link them.
            </p>
          )}
          <select
            name="reports_to"
            className="select"
            defaultValue={
              person.reports_to_id ?? (hasRawManager ? "raw" : "none")
            }
          >
            {hasRawManager && (
              <option value="raw">
                Keep unlinked: “{person.reports_to_name}”
              </option>
            )}
            <option value="none">No one (top of the organization)</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} — {p.position}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <p className="label">Gets work from</p>
          <div className="mt-1 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {people.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] transition-colors hover:bg-[#fafaf8]"
              >
                <input
                  type="checkbox"
                  name="assigners"
                  value={p.id}
                  defaultChecked={linkedAssignerIds.has(p.id)}
                  className="h-4 w-4"
                />
                <span className="min-w-0 truncate">
                  {p.full_name}
                  <span className="text-ink-3"> — {p.position}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {rawAssigners.length > 0 && (
          <div className="mt-5">
            <p className="label">Typed names to resolve</p>
            <ul className="mt-1 space-y-2.5">
              {rawAssigners.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border border-line px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">
                    “{a.assigner_name}”
                  </span>
                  <select
                    name={`raw_assigner_${a.id}`}
                    className="select select-inline h-8 text-[13px]"
                    defaultValue="keep"
                  >
                    <option value="keep">Keep as typed</option>
                    <option value="remove">Remove</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        Link to {p.full_name}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card p-5">
        <h2 className="text-[13px] font-semibold">Day-to-day work</h2>
        <textarea
          name="duties"
          rows={4}
          className="textarea mt-4"
          defaultValue={person.duties ?? ""}
        />
      </section>

      {state.error && (
        <p role="alert" className="text-[13.5px] text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SaveButton />
        <Link
          href={`/admin/people/${person.id}`}
          className="btn btn-ghost h-8.5 px-3 text-[13.5px]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
      {pending ? <span className="spinner" aria-hidden /> : null}
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}
