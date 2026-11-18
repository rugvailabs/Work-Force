import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getApprovedEmployees,
  getAssigners,
  getDepartments,
  getEmployee,
} from "@/lib/data";
import { updateEmployee } from "../../../../actions";
import { Icon } from "../../../../ui";
import { EditForm } from "./edit-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getEmployee(id);
  return { title: person ? `Edit ${person.full_name}` : "Edit" };
}

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person, departments, people, assigners] = await Promise.all([
    getEmployee(id),
    getDepartments(),
    getApprovedEmployees(),
    getAssigners(id),
  ]);
  if (!person) notFound();

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
        <Link
          href={`/admin/people/${person.id}`}
          className="truncate text-ink-3 transition-colors hover:text-ink"
        >
          {person.full_name}
        </Link>
        <Icon.chevronRight className="h-3.5 w-3.5 text-ink-3" />
        <span className="font-medium">Edit</span>
      </div>

      <div className="mx-auto max-w-150 px-6 py-6">
        <h1 className="text-[18px] font-semibold tracking-tight">
          Edit {person.full_name}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-2">
          Correct details, link their manager, or change who gives them work.
        </p>
        <EditForm
          action={updateEmployee.bind(null, person.id)}
          person={person}
          departments={departments}
          people={people.filter((p) => p.id !== person.id)}
          assigners={assigners}
        />
      </div>
    </>
  );
}
