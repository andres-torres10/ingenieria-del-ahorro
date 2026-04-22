# Ingeniería del Ahorro

Aplicación web full-stack de gestión de finanzas personales para familias colombianas. Permite registrar ingresos, gastos fijos, gastos hormiga y deudas; visualizar la salud financiera mediante un semáforo; proyectar ahorros; y aprender sobre finanzas personales.

## Tecnologías

- **Frontend**: React 18 + Vite + TailwindCSS + React Router v6 + Recharts + Axios
- **Backend**: Node.js + Express + SQLite (better-sqlite3) + JWT + bcrypt
- **Pruebas**: Vitest + fast-check (pruebas basadas en propiedades)

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

## Despliegue en producción (gratis)

### Paso 1 — Subir a GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ingenieria-del-ahorro.git
git push -u origin main
```

### Paso 2 — Backend en Railway
1. Ve a [railway.app](https://railway.app) → Login con GitHub
2. New Project → Deploy from GitHub repo → selecciona tu repo
3. En Settings → Variables, agrega:
   - `JWT_SECRET` = cualquier texto largo (ej: `mi_secreto_super_seguro_2026`)
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = (lo agregas después con la URL de Vercel)
4. En Settings → Networking → Generate Domain
5. Copia la URL del backend (ej: `https://ingenieria-del-ahorro.railway.app`)

### Paso 3 — Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com) → Login con GitHub
2. New Project → importa tu repo
3. En configuración:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. En **Environment Variables** agrega:
   - `VITE_API_URL` = la URL de Railway del paso anterior
5. Deploy → copia la URL de Vercel (ej: `https://ingenieria-del-ahorro.vercel.app`)

### Paso 4 — Conectar backend con frontend
1. Vuelve a Railway → Variables
2. Agrega `CLIENT_URL` = la URL de Vercel del paso anterior
3. Railway redespliega automáticamente

¡Listo! Tu app estará en línea en la URL de Vercel.

```bash
# 1. Instalar dependencias del servidor
npm install --prefix server

# 2. Instalar dependencias del cliente
npm install --prefix client

# 3. Arrancar todo (servidor + cliente en paralelo)
npm install   # instala concurrently en la raíz
npm run dev
```

El servidor corre en **http://localhost:3001** y el cliente en **http://localhost:5173**

> ✅ No requiere Python, Visual Studio Build Tools ni ninguna compilación nativa.
> Usa `sql.js` (WebAssembly) y `bcryptjs` (JavaScript puro).

## Configuración

Crea un archivo `.env` en la carpeta `/server` con las siguientes variables:

```env
PORT=3001
JWT_SECRET=tu_secreto_jwt_aqui
NODE_ENV=development
```

## Ejecución en desarrollo

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto arranca el servidor (puerto 3001) y el cliente (puerto 5173) en paralelo usando `concurrently`.

Para arrancarlos por separado:

```bash
# Solo el servidor
npm run dev --prefix server

# Solo el cliente
npm run dev --prefix client
```

## Pruebas

Ejecutar todas las pruebas (cliente y servidor):

```bash
npm test
```

Ejecutar pruebas por separado:

```bash
# Pruebas del cliente
npm test --prefix client

# Pruebas del servidor
npm test --prefix server
```

## Estructura del proyecto

```
ingenieria-del-ahorro/
├── package.json          # Raíz: scripts dev, install:all, test
├── README.md
├── client/               # Frontend React + Vite
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/   # Componentes reutilizables
│       ├── pages/        # Páginas de la aplicación
│       ├── context/      # AuthContext
│       ├── hooks/        # Hooks personalizados
│       ├── utils/        # formatCurrency, financialCalc
│       ├── services/     # Instancia Axios
│       └── tests/        # Pruebas unitarias y de propiedades
└── server/               # Backend Express + SQLite
    ├── package.json
    ├── vitest.config.js
    ├── server.js         # Punto de entrada
    ├── routes/           # Rutas de la API
    ├── middleware/       # JWT, validación, errores
    ├── services/         # Lógica de negocio
    ├── db/               # SQLite: database.js + migraciones
    └── tests/            # Pruebas unitarias y de propiedades
```

## API

El servidor expone los siguientes endpoints principales:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/register | Registro de usuario |
| POST | /auth/login | Inicio de sesión |
| GET | /health | Estado del servidor |
| GET | /api/incomes | Listar ingresos del mes |
| POST | /api/incomes | Crear ingreso |
| GET | /api/fixed-expenses | Listar gastos fijos |
| POST | /api/fixed-expenses | Crear gasto fijo |
| GET | /api/ant-expenses | Listar gastos hormiga |
| POST | /api/ant-expenses | Crear gasto hormiga |
| GET | /api/debts | Listar deudas |
| POST | /api/debts | Crear deuda |
| GET | /api/summary/:year/:month | Resumen mensual |
| GET | /api/charts/history | Datos históricos para gráficas |
| GET | /api/export/csv | Exportar datos en CSV |
| GET | /api/profile | Obtener perfil |
| PUT | /api/profile | Actualizar perfil |

Todas las rutas `/api/*` requieren el header `Authorization: Bearer <token>`.

## Formato de moneda

Todos los valores monetarios se muestran en Peso Colombiano: `$1.234.567` (punto como separador de miles, sin decimales).
