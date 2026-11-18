-- Org directory schema. Run this once against a brand new, empty database.

CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  position        TEXT NOT NULL,
  department_id   INTEGER REFERENCES departments(id),
  role            TEXT NOT NULL CHECK (role IN ('Leadership', 'Management', 'Staff', 'Support')),
  duties          TEXT,
  reports_to_id   UUID REFERENCES employees(id),
  reports_to_name TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX employees_department_id_idx ON employees(department_id);
CREATE INDEX employees_reports_to_id_idx ON employees(reports_to_id);
CREATE INDEX employees_status_idx ON employees(status);

CREATE TABLE work_assigners (
  id            SERIAL PRIMARY KEY,
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigner_id   UUID REFERENCES employees(id),
  assigner_name TEXT,
  UNIQUE (employee_id, assigner_id)
);

CREATE INDEX work_assigners_employee_id_idx ON work_assigners(employee_id);
CREATE INDEX work_assigners_assigner_id_idx ON work_assigners(assigner_id);

CREATE TABLE admins (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL
);

-- Default admin login: username "admin", password "orgadmin2026".
-- Change this immediately after setup (see README.md "Admin login").
INSERT INTO admins (username, password_hash) VALUES (
  'admin',
  '0cd90af849c980a4c8a783e449e6aea8:d01621cc7ca4ab4ac27856d4a3ba574bc032918165964a92ef7af751efecfb6777b073cfb4f2e658e8da3f2b99726fe4131e0ad83fc4b32d99c8304531b160e3'
);

-- A starting set of departments so the registration form has options.
-- Edit freely to match your organization.
INSERT INTO departments (name) VALUES
  ('Leadership'),
  ('Operations'),
  ('Sales'),
  ('Engineering'),
  ('Support');
