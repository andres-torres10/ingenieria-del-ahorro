CREATE TABLE IF NOT EXISTS users (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  email            TEXT    NOT NULL UNIQUE,
  password         TEXT    NOT NULL,
  savings_goal_pct REAL    NOT NULL DEFAULT 10.0,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS incomes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_name TEXT    NOT NULL,
  amount      REAL    NOT NULL CHECK(amount > 0),
  frequency   TEXT    NOT NULL CHECK(frequency IN ('unica','semanal','quincenal','mensual')),
  category    TEXT    NOT NULL CHECK(category IN ('Salario','Freelance','Negocio','Arriendo','Otro')),
  date        TEXT    NOT NULL,
  month       INTEGER NOT NULL,
  year        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    TEXT    NOT NULL,
  description TEXT    NOT NULL,
  amount      REAL    NOT NULL CHECK(amount > 0),
  due_date    TEXT    NOT NULL,
  month       INTEGER NOT NULL,
  year        INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ant_expenses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description     TEXT    NOT NULL,
  category        TEXT    NOT NULL,
  unit_cost       REAL    NOT NULL CHECK(unit_cost > 0),
  times_per_month REAL    NOT NULL CHECK(times_per_month > 0),
  monthly_total   REAL    NOT NULL,
  annual_impact   REAL    NOT NULL
);

CREATE TABLE IF NOT EXISTS debts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creditor_name   TEXT    NOT NULL,
  principal       REAL    NOT NULL CHECK(principal > 0),
  monthly_rate    REAL    NOT NULL CHECK(monthly_rate > 0 AND monthly_rate <= 100),
  term_months     INTEGER NOT NULL CHECK(term_months >= 1),
  monthly_payment REAL    NOT NULL,
  total_interest  REAL    NOT NULL,
  total_cost      REAL    NOT NULL,
  pending_balance REAL    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_month       ON incomes(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_month ON fixed_expenses(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_ant_expenses_user        ON ant_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user               ON debts(user_id);
