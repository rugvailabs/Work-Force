"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitRegistration, type RegisterState } from "./actions";

type Department = { id: number; name: string };
type Person = { id: string; full_name: string; position: string };

const ROLE_OPTIONS = [
  {
    value: "Leadership",
    title: "Leadership",
    hint: "I head the company or a major part of it",
  },
  {
    value: "Management",
    title: "Manager",
    hint: "A team or some people report to me",
  },
  {
    value: "Staff",
    title: "Staff",
    hint: "I do office, technical, sales or similar work",
  },
  {
    value: "Support",
    title: "Support",
    hint: "Security, cleaning, driving, errands and upkeep",
  },
];

export function RegistrationForm({
  departments,
  people,
}: {
  departments: Department[];
  people: Person[];
}) {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    submitRegistration,
    { error: null }
  );
  const [reportsTo, setReportsTo] = useState("");

  return (
    <form action={formAction} className="mt-8 space-y-10">
      <Section step={1} title="About you">
        <Field label="Your full name">
          <input
            name="full_name"
            className="input input-lg"
            autoComplete="name"
            placeholder="e.g. Suresh Kumar"
            required
          />
        </Field>
        <Field label="Phone number">
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="input input-lg"
            placeholder="e.g. 98450 12345"
            required
          />
        </Field>
        <Field label="Email" optional>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="input input-lg"
            placeholder="Leave empty if you don't use email"
          />
        </Field>
      </Section>

      <Section step={2} title="Your job">
        <Field label="Which department are you in?">
          <select name="department_id" className="select input-lg" required defaultValue="">
            <option value="" disabled>
              Choose a department
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="hint">Not sure? Pick the closest one.</p>
        </Field>
        <Field label="What is your job called?">
          <input
            name="position"
            className="input input-lg"
            placeholder="e.g. Driver, Accountant, Engineer"
            required
          />
        </Field>
        <fieldset>
          <legend className="label">Which of these sounds most like you?</legend>
          <div className="mt-1 space-y-2.5">
            {ROLE_OPTIONS.map((r) => (
              <label
                key={r.value}
                className="flex cursor-pointer items-start gap-3.5 rounded-[10px] border border-line-strong bg-surface p-4 transition-colors has-checked:border-accent has-checked:bg-accent-soft hover:border-[#c2c2bd] has-checked:hover:border-accent"
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  className="mt-1 h-4.5 w-4.5"
                  required
                />
                <span>
                  <span className="block text-[15.5px] font-medium leading-snug">
                    {r.title}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-2">
                    {r.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section step={3} title="Who you work with">
        <Field label="Who do you report to?">
          <select
            name="reports_to"
            className="select input-lg"
            required
            value={reportsTo}
            onChange={(e) => setReportsTo(e.target.value)}
          >
            <option value="" disabled>
              Choose a name
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} — {p.position}
              </option>
            ))}
            <option value="other">My manager&apos;s name is not here</option>
            <option value="none">I don&apos;t report to anyone</option>
          </select>
          <p className="hint">
            This is the person you answer to — your boss or supervisor.
          </p>
        </Field>
        {reportsTo === "other" && (
          <Field label="Type your manager's name">
            <input
              name="reports_to_name"
              className="input input-lg"
              placeholder="e.g. Priya Sharma"
            />
            <p className="hint">
              The office will connect you to them once they register.
            </p>
          </Field>
        )}
        <fieldset>
          <legend className="label">Who gives you your day-to-day work?</legend>
          <p className="hint -mt-0.5 mb-3">
            Tick everyone who regularly tells you what to do. It can be the
            same person you report to, or others too.
          </p>
          <div className="overflow-hidden rounded-[10px] border border-line-strong bg-surface">
            {people.map((p, i) => (
              <label
                key={p.id}
                className={`flex cursor-pointer items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[#fafaf8] has-checked:bg-accent-soft ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="assigners"
                  value={p.id}
                  className="h-4.5 w-4.5 shrink-0"
                />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium leading-snug">
                    {p.full_name}
                  </span>
                  <span className="block truncate text-[13px] text-ink-3">
                    {p.position}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3">
            <input
              name="assigner_other"
              className="input input-lg"
              placeholder="Anyone else? Type their name here"
            />
          </div>
        </fieldset>
      </Section>

      <Section step={4} title="Your work">
        <Field label="What do you do on a normal working day?">
          <textarea
            name="duties"
            rows={4}
            className="textarea"
            style={{ fontSize: 16, borderRadius: 10 }}
            placeholder="e.g. I open the gate at 8, check visitors in and out, and lock the building at night."
            required
          />
          <p className="hint">Two or three lines in your own words is enough.</p>
        </Field>
      </Section>

      <div className="space-y-4">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[10px] border border-[#eac9c5] bg-danger-soft px-4 py-3 text-[14px] leading-snug text-danger"
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            {state.error}
          </div>
        )}
        <SubmitButton />
        <p className="text-center text-[13px] leading-relaxed text-ink-3">
          Your details go to the office for review before they appear in the
          directory.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-lg w-full"
    >
      {pending ? (
        <>
          <span className="spinner" aria-hidden />
          Sending…
        </>
      ) : (
        "Send my details"
      )}
    </button>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-white">
          {step}
        </span>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label text-[14px]">
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-ink-3">(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}
