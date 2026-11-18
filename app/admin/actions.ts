"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { pool, q } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";

export type LoginState = { error: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password)
    return { error: "Enter your username and password." };

  const rows = await q<{ username: string; password_hash: string }>(
    "SELECT username, password_hash FROM admins WHERE username = $1",
    [username]
  );
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return { error: "That username or password is not right." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(admin.username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/** Approve a submission and auto-link anyone who typed this person's name. */
export async function approveEmployee(id: string) {
  await requireAdmin();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(
      "UPDATE employees SET status = 'approved', updated_at = now() WHERE id = $1 RETURNING full_name",
      [id]
    );
    const name = res.rows[0]?.full_name as string | undefined;
    if (name) {
      await client.query(
        `UPDATE employees SET reports_to_id = $1, reports_to_name = NULL, updated_at = now()
         WHERE reports_to_id IS NULL AND reports_to_name ILIKE $2 AND id <> $1`,
        [id, name]
      );
      await client.query(
        `DELETE FROM work_assigners w USING work_assigners existing
         WHERE w.assigner_id IS NULL AND w.assigner_name ILIKE $2
           AND existing.employee_id = w.employee_id AND existing.assigner_id = $1`,
        [id, name]
      );
      await client.query(
        `UPDATE work_assigners SET assigner_id = $1, assigner_name = NULL
         WHERE assigner_id IS NULL AND assigner_name ILIKE $2 AND employee_id <> $1`,
        [id, name]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  revalidatePath("/admin", "layout");
}

export async function deleteEmployee(id: string) {
  await requireAdmin();
  await q("DELETE FROM employees WHERE id = $1", [id]);
  revalidatePath("/admin", "layout");
  redirect("/admin/people");
}

export type UpdateState = { error: string | null };

export async function updateEmployee(
  id: string,
  _prev: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  await requireAdmin();
  const str = (key: string) => String(formData.get(key) ?? "").trim();

  const fullName = str("full_name");
  const phone = str("phone");
  const position = str("position");
  if (!fullName || !phone || !position)
    return { error: "Name, phone and position are required." };

  const email = str("email") || null;
  const departmentId = str("department_id") ? Number(str("department_id")) : null;
  const role = str("role");
  const duties = str("duties") || null;
  const status = str("status") === "approved" ? "approved" : "pending";
  const reportsTo = str("reports_to"); // "" | "raw" | employee id
  const assignerIds = formData
    .getAll("assigners")
    .map((v) => String(v))
    .filter((v) => v && v !== id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE employees SET
         full_name = $2, phone = $3, email = $4, position = $5,
         department_id = $6, role = $7, duties = $8, status = $9,
         reports_to_id = $10,
         reports_to_name = CASE WHEN $11 THEN reports_to_name ELSE NULL END,
         updated_at = now()
       WHERE id = $1`,
      [
        id,
        fullName,
        phone,
        email,
        position,
        departmentId,
        role,
        duties,
        status,
        reportsTo && reportsTo !== "raw" && reportsTo !== "none" ? reportsTo : null,
        reportsTo === "raw",
      ]
    );

    // Linked assigners: replace with the submitted checkbox set.
    await client.query(
      "DELETE FROM work_assigners WHERE employee_id = $1 AND assigner_id IS NOT NULL",
      [id]
    );
    for (const assignerId of assignerIds) {
      await client.query(
        `INSERT INTO work_assigners (employee_id, assigner_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [id, assignerId]
      );
    }

    // Unlinked (typed-name) assigners: keep, remove, or link each one.
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("raw_assigner_")) continue;
      const rowId = Number(key.slice("raw_assigner_".length));
      const choice = String(value);
      if (!rowId || choice === "keep") continue;
      await client.query(
        "DELETE FROM work_assigners WHERE id = $1 AND employee_id = $2",
        [rowId, id]
      );
      if (choice !== "remove" && choice !== id) {
        await client.query(
          `INSERT INTO work_assigners (employee_id, assigner_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, choice]
        );
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update failed:", err);
    return { error: "Could not save the changes. Please try again." };
  } finally {
    client.release();
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/people/${id}`);
}
