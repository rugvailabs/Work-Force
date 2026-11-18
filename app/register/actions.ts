"use server";

import { redirect } from "next/navigation";
import { pool } from "@/lib/db";

export type RegisterState = {
  error: string | null;
};

const ROLES = ["Leadership", "Management", "Staff", "Support"];

export async function submitRegistration(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const str = (key: string) => String(formData.get(key) ?? "").trim();

  const fullName = str("full_name");
  const phone = str("phone");
  const email = str("email");
  const departmentId = str("department_id");
  const position = str("position");
  const role = str("role");
  const reportsTo = str("reports_to"); // employee id | "other" | "none"
  const reportsToName = str("reports_to_name");
  const duties = str("duties");
  const assignerIds = formData
    .getAll("assigners")
    .map((v) => String(v))
    .filter(Boolean);
  const assignerOther = str("assigner_other");

  if (!fullName) return { error: "Please enter your name." };
  if (!phone) return { error: "Please enter your phone number." };
  if (!departmentId) return { error: "Please choose your department." };
  if (!position) return { error: "Please tell us what your job is called." };
  if (!ROLES.includes(role))
    return { error: "Please choose the option that best describes you." };
  if (!reportsTo)
    return { error: "Please tell us who you report to." };
  if (reportsTo === "other" && !reportsToName)
    return { error: "Please type the name of the person you report to." };
  if (!duties)
    return { error: "Please describe what you do on a normal working day." };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO employees
         (full_name, phone, email, position, department_id, role, duties,
          reports_to_id, reports_to_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING id`,
      [
        fullName,
        phone,
        email || null,
        position,
        Number(departmentId),
        role,
        duties,
        reportsTo !== "other" && reportsTo !== "none" ? reportsTo : null,
        reportsTo === "other" ? reportsToName : null,
      ]
    );
    const employeeId = inserted.rows[0].id as string;

    for (const assignerId of assignerIds) {
      await client.query(
        `INSERT INTO work_assigners (employee_id, assigner_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [employeeId, assignerId]
      );
    }
    if (assignerOther) {
      for (const name of assignerOther
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)) {
        await client.query(
          `INSERT INTO work_assigners (employee_id, assigner_name) VALUES ($1, $2)`,
          [employeeId, name]
        );
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Registration failed:", err);
    return {
      error:
        "Something went wrong while saving. Please try again, or ask the office for help.",
    };
  } finally {
    client.release();
  }

  redirect("/register/done");
}
