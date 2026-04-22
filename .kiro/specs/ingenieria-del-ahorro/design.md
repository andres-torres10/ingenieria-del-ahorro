# Documento de Diseño Técnico — Ingeniería del Ahorro

## Visión General

"Ingeniería del Ahorro" es una aplicación web full-stack de finanzas personales para familias colombianas. La arquitectura sigue el patrón cliente-servidor clásico: un frontend React/Vite servido de forma estática y un backend Express que expone una API REST con autenticación JWT. Los datos se persisten en SQLite mediante `better-sqlite3`.

### Objetivos de diseño

- **Aislamiento de datos**: cada usuario solo accede a sus propios registros.
- **Cálculos deterministas**: las fórmulas financieras viven en el servidor para garantizar consistencia.
- **Mobile-first**: la UI se adapta con sidebar en ≥768 px y bottom-nav en <768 px.
- **Formato colombiano**: todos los montos se formatean como `$1.234.567`.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Cliente                          │
│  React + Vite + TailwindCSS + React Router v6           │
│  Recharts  │  Axios  │  Context API (AuthContext)       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / JSON (JWT en header)
┌────────────────────────▼────────────────────────────────┐
│                       Servidor                          │
│  Node.js + Express                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  /auth   │  │  /api    │  │ middleware│              │
│  │  routes  │  │  routes  │  │  JWT auth│              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Capa de Servicios (lógica)             │   │
│  │  financeService  │  authService  │  exportService│   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           better-sqlite3 (SQLite)                │   │
│  │  /server/db/database.js  │  /server/db/migrations│   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

```
Cliente                          Servidor
  │── POST /auth/register ──────►│ bcrypt.hash(password, 10)
  │◄─ { token, user } ──────────│ jwt.sign({ userId }, secret, { expiresIn: '8h' })
  │
  │── POST /auth/login ─────────►│ bcrypt.compare → jwt.sign
  │◄─ { token, user } ──────────│
  │
  │── GET /api/* (Bearer token) ►│ verifyJWT middleware → next()
  │◄─ 401 si token inválido ────│
```

---

## Componentes e Interfaces

### Frontend — Estructura de carpetas

```
/client
  /src
    /components
      /layout        → AppLayout, Sidebar, BottomNav, TopBar
      /ui            → Button, Card, Modal, Toast, Spinner, ProgressBar
      /forms         → IncomeForm, FixedExpenseForm, AntExpenseForm, DebtForm
      /charts        → PieChart, BarChart, LineChart, DonutChart
    /pages
      Login.jsx
      Register.jsx
      Dashboard.jsx
      Incomes.jsx
      FixedExpenses.jsx
      AntExpenses.jsx
      Debts.jsx
      MonthlySummary.jsx
      Charts.jsx
      Learning.jsx
      Profile.jsx
    /context
      AuthContext.jsx      → token, user, login(), logout()
    /hooks
      useApi.js            → wrapper Axios con token
      useToast.js
      useFinancialHealth.js
    /utils
      formatCurrency.js    → formatCOP(amount): "$1.234.567"
      financialCalc.js     → calcMonthlyPayment, calcSimpleInterest,
                             calcSavingsProjection, calcFinancialHealth,
                             calcAntImpact
    /services
      api.js               → instancia Axios con baseURL y interceptores
```

### Backend — Estructura de carpetas

```
/server
  server.js              → punto de entrada, configura Express
  /routes
    auth.routes.js        → POST /auth/register, POST /auth/login
    incomes.routes.js     → CRUD /api/incomes
    fixedExpenses.routes.js
    antExpenses.routes.js
    debts.routes.js
    summary.routes.js     → GET /api/summary/:year/:month
    export.routes.js      → GET /api/export/csv
    profile.routes.js
  /middleware
    auth.middleware.js    → verifyJWT
    validate.middleware.js → validación de body con express-validator
  /services
    auth.service.js
    finance.service.js    → cálculos financieros del servidor
    export.service.js
  /db
    database.js           → instancia singleton de better-sqlite3
    migrations/
      001_initial.sql
```

### API REST — Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/register | Registro de usuario |
| POST | /auth/login | Inicio de sesión |
| GET | /api/incomes?month=&year= | Listar ingresos del mes |
| POST | /api/incomes | Crear ingreso |
| PUT | /api/incomes/:id | Editar ingreso |
| DELETE | /api/incomes/:id | Eliminar ingreso |
| GET | /api/fixed-expenses?month=&year= | Listar gastos fijos |
| POST | /api/fixed-expenses | Crear gasto fijo |
| PUT | /api/fixed-expenses/:id | Editar gasto fijo |
| DELETE | /api/fixed-expenses/:id | Eliminar gasto fijo |
| GET | /api/ant-expenses | Listar gastos hormiga |
| POST | /api/ant-expenses | Crear gasto hormiga |
| PUT | /api/ant-expenses/:id | Editar gasto hormiga |
| DELETE | /api/ant-expenses/:id | Eliminar gasto hormiga |
| GET | /api/debts | Listar deudas |
| POST | /api/debts | Crear deuda |
| PUT | /api/debts/:id | Editar deuda |
| DELETE | /api/debts/:id | Eliminar deuda |
| GET | /api/summary/:year/:month | Resumen mensual |
| GET | /api/charts/history?months=6 | Datos históricos para gráficas |
| GET | /api/export/csv | Exportar datos en CSV |
| GET | /api/profile | Obtener perfil |
| PUT | /api/profile | Actualizar perfil |
| PUT | /api/profile/password | Cambiar contraseña |
| DELETE | /api/profile | Eliminar cuenta |

---

## Modelos de Datos

### Esquema SQLite

```sql
-- Migración 001_initial.sql

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,           -- bcrypt hash
  savings_goal_pct REAL NOT NULL DEFAULT 10.0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS incomes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_name TEXT    NOT NULL,
  amount      REAL    NOT NULL CHECK(amount > 0),
  frequency   TEXT    NOT NULL CHECK(frequency IN ('unica','semanal','quincenal','mensual')),
  category    TEXT    NOT NULL CHECK(category IN ('Salario','Freelance','Negocio','Arriendo','Otro')),
  date        TEXT    NOT NULL,           -- ISO 8601: YYYY-MM-DD
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
  -- Columnas calculadas almacenadas para consulta rápida:
  monthly_total   REAL    NOT NULL,      -- unit_cost × times_per_month
  annual_impact   REAL    NOT NULL       -- unit_cost × times_per_month × 12
);

CREATE TABLE IF NOT EXISTS debts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creditor_name   TEXT    NOT NULL,
  principal       REAL    NOT NULL CHECK(principal > 0),
  monthly_rate    REAL    NOT NULL CHECK(monthly_rate > 0 AND monthly_rate <= 100),
  term_months     INTEGER NOT NULL CHECK(term_months >= 1),
  monthly_payment REAL    NOT NULL,      -- calculado: P×(r(1+r)^n)/((1+r)^n-1)
  total_interest  REAL    NOT NULL,      -- (monthly_payment × n) - P
  total_cost      REAL    NOT NULL,      -- monthly_payment × n
  pending_balance REAL    NOT NULL,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Modelos TypeScript / JSDoc del frontend

```js
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {number} savingsGoalPct  - porcentaje meta ahorro (default 10)
 */

/**
 * @typedef {Object} Income
 * @property {number} id
 * @property {string} sourceName
 * @property {number} amount
 * @property {'unica'|'semanal'|'quincenal'|'mensual'} frequency
 * @property {'Salario'|'Freelance'|'Negocio'|'Arriendo'|'Otro'} category
 * @property {string} date   - YYYY-MM-DD
 * @property {number} month
 * @property {number} year
 */

/**
 * @typedef {Object} AntExpense
 * @property {number} id
 * @property {string} description
 * @property {string} category
 * @property {number} unitCost
 * @property {number} timesPerMonth
 * @property {number} monthlyTotal   - unitCost × timesPerMonth
 * @property {number} annualImpact   - unitCost × timesPerMonth × 12
 */

/**
 * @typedef {Object} Debt
 * @property {number} id
 * @property {string} creditorName
 * @property {number} principal
 * @property {number} monthlyRate    - porcentaje (ej: 2.5 para 2.5%)
 * @property {number} termMonths
 * @property {number} monthlyPayment
 * @property {number} totalInterest
 * @property {number} totalCost
 * @property {number} pendingBalance
 */

/**
 * @typedef {'SALUDABLE'|'AJUSTADO'|'DEFICIT'} FinancialHealth
 */

/**
 * @typedef {Object} MonthlySummary
 * @property {number} totalIncome
 * @property {number} totalFixedExpenses
 * @property {number} totalAntExpenses
 * @property {number} totalDebtPayments
 * @property {number} availableSavings    - totalIncome - totalFixed - totalAnt - totalDebt
 * @property {number} savingsPct          - availableSavings / totalIncome × 100
 * @property {FinancialHealth} health
 */
```

### Fórmulas financieras (módulo `financialCalc.js`)

```js
// Cuota mensual de deuda (amortización francesa)
// P: capital, r: tasa mensual decimal, n: plazo en meses
calcMonthlyPayment(P, r, n) = P * (r * (1+r)^n) / ((1+r)^n - 1)

// Interés total
calcTotalInterest(monthlyPayment, n, P) = (monthlyPayment * n) - P

// Impacto anual de gasto hormiga
calcAntImpact(unitCost, timesPerMonth) = unitCost * timesPerMonth * 12

// Proyección de ahorro
calcSavingsProjection(monthlySavings, months) = monthlySavings * months

// Salud financiera
calcFinancialHealth(savings, income):
  if savings / income > 0.10  → 'SALUDABLE'
  if savings / income >= 0    → 'AJUSTADO'
  else                        → 'DEFICIT'

// Formato peso colombiano
formatCOP(amount) = '$' + Math.round(amount).toLocaleString('es-CO')
  // Resultado: $1.234.567
```

---

## Propiedades de Corrección

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema — esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de corrección verificables por máquina.*

**Reflexión de propiedades (eliminación de redundancias):**
- Las propiedades de validación de ingresos (3.1) y gastos fijos (4.1) son estructuralmente idénticas → se consolidan en una propiedad de validación de monto positivo.
- La propiedad de round-trip de ingresos (3.2/3.5) y gastos fijos (4.x) siguen el mismo patrón → se consolidan en una propiedad de persistencia por mes/año.
- Las propiedades de cálculo de deuda (6.1 y 6.2) son dependientes → se consolidan en una sola propiedad de fórmula de amortización.
- La propiedad de aislamiento de datos (12.1) y la de filtrado por mes/año (12.2-12.3) son distintas y se mantienen separadas.
- La propiedad del semáforo financiero (2.2) cubre el caso de déficit (7.5) → se mantiene una sola propiedad.

---

### Propiedad 1: Validación de monto positivo

*Para cualquier* registro de ingreso, gasto fijo o gasto hormiga con monto (o costo unitario) menor o igual a cero, el sistema SHALL rechazar el guardado y retornar un error de validación; para cualquier registro con monto mayor a cero, el sistema SHALL aceptarlo.

**Valida: Requisitos 3.1, 3.6, 4.1, 4.6, 5.1, 5.6**

---

### Propiedad 2: Round-trip de persistencia por mes/año

*Para cualquier* registro válido (ingreso o gasto fijo) con una fecha dada, después de guardarlo, consultando el mes y año correspondientes a esa fecha SHALL retornar un conjunto que incluye ese registro; consultando cualquier otro mes/año SHALL no retornarlo.

**Valida: Requisitos 3.2, 4.2, 7.2, 12.2, 12.3**

---

### Propiedad 3: Semáforo financiero

*Para cualquier* par (ahorro, ingreso_total) con ingreso_total > 0, la función de salud financiera SHALL retornar:
- `SALUDABLE` si `ahorro / ingreso_total > 0.10`
- `AJUSTADO` si `0 ≤ ahorro / ingreso_total ≤ 0.10`
- `DEFICIT` si `ahorro < 0`

**Valida: Requisitos 2.2, 7.5**

---

### Propiedad 4: Fórmula de amortización de deudas

*Para cualquier* deuda válida con capital P > 0, tasa mensual r ∈ (0, 1] y plazo n ≥ 1, la cuota mensual calculada SHALL satisfacer:
- `monthly_payment = P × (r × (1+r)^n) / ((1+r)^n - 1)`
- `total_interest = (monthly_payment × n) - P ≥ 0`
- `total_cost = monthly_payment × n`

**Valida: Requisitos 6.1, 6.2**

---

### Propiedad 5: Invariante de gasto hormiga

*Para cualquier* gasto hormiga con costo unitario `u > 0` y frecuencia mensual `f > 0`, los campos calculados SHALL satisfacer:
- `monthly_total = u × f`
- `annual_impact = u × f × 12`
- El mensaje de ahorro SHALL contener el valor `annual_impact` formateado en Peso Colombiano.

**Valida: Requisitos 5.2, 5.3, 5.4**

---

### Propiedad 6: Proyección de ahorro lineal

*Para cualquier* ahorro mensual `s` y horizonte de meses `m ∈ {3, 6, 12, 24, 36}`, la proyección acumulada SHALL ser exactamente `s × m`.

**Valida: Requisito 7.4**

---

### Propiedad 7: Formato de Peso Colombiano

*Para cualquier* número entero no negativo `n`, la función `formatCOP(n)` SHALL retornar una cadena que:
- Comienza con `$`
- Usa punto (`.`) como separador de miles
- No contiene decimales
- Satisface la expresión regular `/^\$\d{1,3}(\.\d{3})*$/`

**Valida: Requisito 11.2**

---

### Propiedad 8: Aislamiento de datos entre usuarios

*Para cualquier* recurso (ingreso, gasto fijo, gasto hormiga, deuda) perteneciente al usuario A, una petición autenticada como usuario B SHALL retornar HTTP 403 o 404, nunca los datos del usuario A.

**Valida: Requisitos 1.7, 12.1**

---

### Propiedad 9: Consistencia del resumen mensual

*Para cualquier* conjunto de ingresos, gastos fijos, gastos hormiga y cuotas de deudas de un mes dado, el resumen mensual SHALL satisfacer:
- `available_savings = total_income - total_fixed - total_ant - total_debt_payments`
- `savings_pct = available_savings / total_income × 100` (cuando total_income > 0)
- El estado de salud SHALL ser consistente con la Propiedad 3.

**Valida: Requisitos 7.1, 2.2**

---

### Propiedad 10: Rechazo de credenciales inválidas sin revelar campo

*Para cualquier* par (email, password) donde al menos uno no coincide con un usuario registrado, la respuesta del servidor SHALL:
- Retornar HTTP 401
- Contener un mensaje de error genérico que no indique cuál campo es incorrecto
- No incluir información sobre la existencia del email en la base de datos

**Valida: Requisito 1.4**

---

## Manejo de Errores

### Errores del servidor (Express)

| Situación | Código HTTP | Respuesta |
|-----------|-------------|-----------|
| Token JWT ausente o inválido | 401 | `{ error: "No autorizado" }` |
| Recurso no pertenece al usuario | 403 | `{ error: "Acceso denegado" }` |
| Recurso no encontrado | 404 | `{ error: "Recurso no encontrado" }` |
| Validación de campos fallida | 422 | `{ errors: [{ field, message }] }` |
| Error de base de datos | 500 | `{ error: "Error interno del servidor" }` |
| Email duplicado en registro | 409 | `{ error: "El correo ya está registrado" }` |

### Middleware de manejo de errores global

```js
// server/middleware/errorHandler.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});
```

### Errores del cliente (React)

- **Formularios**: validación en tiempo real con mensajes junto a cada campo inválido antes de enviar al servidor.
- **Peticiones fallidas**: el hook `useApi` captura errores Axios y los expone al componente; el componente muestra un toast de error.
- **Sesión expirada**: el interceptor de Axios detecta HTTP 401 y llama a `logout()` del `AuthContext`, redirigiendo a `/login`.
- **Datos vacíos**: cada vista muestra un estado vacío descriptivo cuando no hay registros para el período seleccionado.

### Validaciones de negocio

- Monto/costo unitario/veces por mes: debe ser > 0 (validado en cliente y servidor).
- Tasa mensual de deuda: debe estar en (0, 100] (validado en cliente y servidor).
- Plazo de deuda: debe ser ≥ 1 mes.
- Contraseña: mínimo 8 caracteres.
- Email: formato válido y único en la base de datos.

---

## Estrategia de Pruebas

### Enfoque dual: pruebas unitarias + pruebas basadas en propiedades

Las pruebas unitarias verifican ejemplos concretos, casos borde y condiciones de error. Las pruebas basadas en propiedades verifican invariantes universales sobre rangos amplios de entradas generadas aleatoriamente.

### Biblioteca de pruebas basadas en propiedades

Se utilizará **fast-check** (JavaScript) para las pruebas de propiedades, con un mínimo de **100 iteraciones** por propiedad.

```
npm install --save-dev fast-check vitest
```

### Pruebas unitarias (Vitest)

**Backend (`/server/tests/`):**
- `auth.test.js`: registro, login, JWT, bcrypt
- `finance.test.js`: cálculos financieros con ejemplos concretos
- `validation.test.js`: validación de campos requeridos
- `isolation.test.js`: aislamiento de datos entre usuarios

**Frontend (`/client/src/tests/`):**
- `formatCurrency.test.js`: formatCOP con valores conocidos
- `financialCalc.test.js`: fórmulas con valores conocidos
- `Dashboard.test.jsx`: renderizado con datos mock
- `forms.test.jsx`: validación de formularios

### Pruebas basadas en propiedades (fast-check + Vitest)

Cada prueba de propiedad debe incluir el tag de referencia en un comentario:

```js
// Feature: ingenieria-del-ahorro, Property N: <texto de la propiedad>
```

**Propiedad 1 — Validación de monto positivo:**
```js
// Feature: ingenieria-del-ahorro, Property 1: validación de monto positivo
fc.assert(fc.property(
  fc.record({ amount: fc.float({ min: -1e6, max: 0 }) }),
  (record) => expect(validateAmount(record.amount)).toBe(false)
), { numRuns: 100 });
```

**Propiedad 3 — Semáforo financiero:**
```js
// Feature: ingenieria-del-ahorro, Property 3: semáforo financiero
fc.assert(fc.property(
  fc.float({ min: 1, max: 1e8 }),   // income
  fc.float({ min: -1e8, max: 1e8 }), // savings
  (income, savings) => {
    const health = calcFinancialHealth(savings, income);
    if (savings / income > 0.10) return health === 'SALUDABLE';
    if (savings >= 0) return health === 'AJUSTADO';
    return health === 'DEFICIT';
  }
), { numRuns: 100 });
```

**Propiedad 4 — Fórmula de amortización:**
```js
// Feature: ingenieria-del-ahorro, Property 4: fórmula de amortización de deudas
fc.assert(fc.property(
  fc.float({ min: 1000, max: 1e9 }),   // P
  fc.float({ min: 0.001, max: 1.0 }),  // r (decimal)
  fc.integer({ min: 1, max: 360 }),    // n
  (P, r, n) => {
    const payment = calcMonthlyPayment(P, r, n);
    const expected = P * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
    return Math.abs(payment - expected) < 0.01;
  }
), { numRuns: 100 });
```

**Propiedad 5 — Invariante de gasto hormiga:**
```js
// Feature: ingenieria-del-ahorro, Property 5: invariante de gasto hormiga
fc.assert(fc.property(
  fc.float({ min: 0.01, max: 1e6 }),  // unitCost
  fc.float({ min: 0.01, max: 1000 }), // timesPerMonth
  (unitCost, timesPerMonth) => {
    const result = calcAntImpact(unitCost, timesPerMonth);
    return Math.abs(result.monthlyTotal - unitCost * timesPerMonth) < 0.01
      && Math.abs(result.annualImpact - unitCost * timesPerMonth * 12) < 0.01;
  }
), { numRuns: 100 });
```

**Propiedad 7 — Formato Peso Colombiano:**
```js
// Feature: ingenieria-del-ahorro, Property 7: formato de Peso Colombiano
fc.assert(fc.property(
  fc.integer({ min: 0, max: 1e12 }),
  (amount) => /^\$\d{1,3}(\.\d{3})*$/.test(formatCOP(amount))
), { numRuns: 100 });
```

### Pruebas de integración

- Flujo completo de autenticación (registro → login → acceso a ruta protegida → logout)
- CRUD completo de cada entidad con verificación en base de datos
- Aislamiento de datos: usuario B no puede acceder a datos de usuario A
- Exportación CSV: verificar que el archivo contiene todos los registros del usuario

### Pruebas de humo (smoke tests)

- Servidor arranca correctamente y responde en `/health`
- Base de datos SQLite se crea y las migraciones se aplican sin errores
- Hash bcrypt almacenado comienza con `$2b$10$` (factor de costo ≥ 10)

### Cobertura objetivo

- Funciones de cálculo financiero: 100%
- Rutas de API: 90%+
- Componentes React críticos (Dashboard, formularios): 80%+
