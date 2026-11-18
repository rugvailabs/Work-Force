import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      new URL("/admin/login", process.env.APP_URL ?? "http://localhost:3000")
    );
  }

  const rows = await q<Record<string, unknown>>(
    `SELECT e.full_name AS "Name",
            e.position AS "Position",
            d.name AS "Department",
            e.role AS "Role",
            initcap(e.status) AS "Status",
            e.phone AS "Phone",
            e.email AS "Email",
            COALESCE(m.full_name, CASE WHEN e.reports_to_name IS NOT NULL
              THEN e.reports_to_name || ' (not linked)' END) AS "Reports to",
            (SELECT string_agg(COALESCE(a.full_name, w.assigner_name), '; ' ORDER BY COALESCE(a.full_name, w.assigner_name))
             FROM work_assigners w LEFT JOIN employees a ON a.id = w.assigner_id
             WHERE w.employee_id = e.id) AS "Gets work from",
            e.duties AS "Day-to-day work",
            to_char(e.created_at, 'YYYY-MM-DD') AS "Submitted"
     FROM employees e
     LEFT JOIN departments d ON d.id = e.department_id
     LEFT JOIN employees m ON m.id = e.reports_to_id
     ORDER BY CASE e.role WHEN 'Leadership' THEN 0 WHEN 'Management' THEN 1 WHEN 'Staff' THEN 2 ELSE 3 END, e.full_name`
  );

  const headers = rows.length
    ? Object.keys(rows[0])
    : ["Name", "Position", "Department"];
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
  ];
  // BOM so Excel opens it as UTF-8
  const csv = "﻿" + lines.join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="org-directory-${today}.csv"`,
    },
  });
}
