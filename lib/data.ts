import { q } from "./db";

export type Role = "Leadership" | "Management" | "Staff" | "Support";
export type Status = "pending" | "approved";

export type Employee = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  position: string;
  department_id: number | null;
  department: string | null;
  role: Role;
  duties: string | null;
  reports_to_id: string | null;
  reports_to_name: string | null;
  manager_name: string | null;
  manager_position: string | null;
  status: Status;
  created_at: string;
};

export type Department = { id: number; name: string };

export type AssignerRow = {
  id: number;
  assigner_id: string | null;
  assigner_name: string | null;
  name: string; // resolved display name
  position: string | null;
  status: Status | null;
};

const EMPLOYEE_SELECT = `
  SELECT e.id, e.full_name, e.phone, e.email, e.position, e.department_id,
         d.name AS department, e.role, e.duties, e.reports_to_id, e.reports_to_name,
         m.full_name AS manager_name, m.position AS manager_position,
         e.status, e.created_at
  FROM employees e
  LEFT JOIN departments d ON d.id = e.department_id
  LEFT JOIN employees m ON m.id = e.reports_to_id
`;

export async function getDepartments(): Promise<Department[]> {
  return q<Department>("SELECT id, name FROM departments ORDER BY id");
}

export async function getApprovedEmployees(): Promise<
  Pick<Employee, "id" | "full_name" | "position">[]
> {
  return q(
    "SELECT id, full_name, position FROM employees WHERE status = 'approved' ORDER BY full_name"
  );
}

export type ListFilters = {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
};

export async function listEmployees(f: ListFilters): Promise<Employee[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (f.search) {
    params.push(`%${f.search}%`);
    where.push(
      `(e.full_name ILIKE $${params.length} OR e.position ILIKE $${params.length} OR e.phone ILIKE $${params.length} OR e.email ILIKE $${params.length})`
    );
  }
  if (f.department) {
    params.push(Number(f.department));
    where.push(`e.department_id = $${params.length}`);
  }
  if (f.role) {
    params.push(f.role);
    where.push(`e.role = $${params.length}`);
  }
  if (f.status) {
    params.push(f.status);
    where.push(`e.status = $${params.length}`);
  }
  const sql =
    EMPLOYEE_SELECT +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY CASE e.role WHEN 'Leadership' THEN 0 WHEN 'Management' THEN 1 WHEN 'Staff' THEN 2 ELSE 3 END, e.full_name`;
  return q<Employee>(sql, params);
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const rows = await q<Employee>(EMPLOYEE_SELECT + " WHERE e.id = $1", [id]);
  return rows[0] ?? null;
}

/** Chain of command from this person's manager up to the top. */
export async function getChainOfCommand(id: string): Promise<Employee[]> {
  return q<Employee>(
    `WITH RECURSIVE chain AS (
       SELECT e.*, 1 AS depth FROM employees e
       WHERE e.id = (SELECT reports_to_id FROM employees WHERE id = $1)
       UNION ALL
       SELECT e.*, c.depth + 1 FROM employees e
       JOIN chain c ON e.id = c.reports_to_id
       WHERE c.depth < 20
     )
     SELECT c.id, c.full_name, c.phone, c.email, c.position, c.department_id,
            d.name AS department, c.role, c.duties, c.reports_to_id, c.reports_to_name,
            NULL AS manager_name, NULL AS manager_position, c.status, c.created_at
     FROM chain c LEFT JOIN departments d ON d.id = c.department_id
     ORDER BY c.depth`,
    [id]
  );
}

export async function getDirectReports(id: string): Promise<Employee[]> {
  return q<Employee>(
    EMPLOYEE_SELECT + " WHERE e.reports_to_id = $1 ORDER BY e.full_name",
    [id]
  );
}

/** People who assign work to this employee. */
export async function getAssigners(id: string): Promise<AssignerRow[]> {
  return q<AssignerRow>(
    `SELECT w.id, w.assigner_id, w.assigner_name,
            COALESCE(a.full_name, w.assigner_name) AS name,
            a.position, a.status
     FROM work_assigners w
     LEFT JOIN employees a ON a.id = w.assigner_id
     WHERE w.employee_id = $1
     ORDER BY name`,
    [id]
  );
}

/** People this employee assigns work to. */
export async function getAssignees(id: string): Promise<Employee[]> {
  return q<Employee>(
    `SELECT e.id, e.full_name, e.phone, e.email, e.position, e.department_id,
            d.name AS department, e.role, e.duties, e.reports_to_id, e.reports_to_name,
            NULL AS manager_name, NULL AS manager_position, e.status, e.created_at
     FROM work_assigners w
     JOIN employees e ON e.id = w.employee_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE w.assigner_id = $1
     ORDER BY e.full_name`,
    [id]
  );
}

export async function getCounts() {
  const rows = await q<{
    total: string;
    pending: string;
    approved: string;
    departments: string;
    unlinked: string;
  }>(
    `SELECT
       (SELECT count(*) FROM employees) AS total,
       (SELECT count(*) FROM employees WHERE status = 'pending') AS pending,
       (SELECT count(*) FROM employees WHERE status = 'approved') AS approved,
       (SELECT count(DISTINCT department_id) FROM employees WHERE department_id IS NOT NULL) AS departments,
       (SELECT count(*) FROM employees WHERE reports_to_id IS NULL AND reports_to_name IS NOT NULL) AS unlinked`
  );
  const r = rows[0];
  return {
    total: Number(r.total),
    pending: Number(r.pending),
    approved: Number(r.approved),
    departments: Number(r.departments),
    unlinked: Number(r.unlinked),
  };
}

export type TreeNode = Employee & { children: TreeNode[] };

export async function getOrgTree(): Promise<{
  roots: TreeNode[];
  unplaced: Employee[];
}> {
  const all = await listEmployees({ status: "approved" });
  const byId = new Map<string, TreeNode>();
  for (const e of all) byId.set(e.id, { ...e, children: [] });
  const roots: TreeNode[] = [];
  const unplaced: Employee[] = [];
  for (const node of byId.values()) {
    if (node.reports_to_id && byId.has(node.reports_to_id)) {
      byId.get(node.reports_to_id)!.children.push(node);
    } else if (node.reports_to_id || node.reports_to_name) {
      // Manager exists but isn't approved/linked yet
      unplaced.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort(
      (a, b) => b.children.length - a.children.length || a.full_name.localeCompare(b.full_name)
    );
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return { roots, unplaced };
}
