# Plan de Implementación: Ingeniería del Ahorro

## Visión General

Implementación incremental de una aplicación web full-stack de finanzas personales para familias colombianas. El proyecto se estructura en un monorepo con `/client` (React + Vite + TailwindCSS) y `/server` (Node.js + Express + SQLite), arrancable con `npm install && npm run dev` desde la raíz.

## Tareas

- [x] 1. Configurar estructura del monorepo y scaffolding inicial
  - Crear `package.json` raíz con script `dev` usando `concurrently` para arrancar cliente y servidor en paralelo
  - Crear `README.md` con instrucciones de instalación y ejecución
  - Inicializar `/client` con Vite + React; instalar TailwindCSS, React Router v6, Recharts, Axios
  - Inicializar `/server` con Express; instalar better-sqlite3, bcrypt, jsonwebtoken, express-validator
  - Instalar fast-check y Vitest en ambos proyectos como dependencias de desarrollo
  - Configurar `vitest.config.js` en `/client` y `/server`
  - _Requisitos: 12.4_

- [x] 2. Implementar capa de base de datos y migraciones
  - [x] 2.1 Crear `/server/db/database.js` como singleton de better-sqlite3 que ejecuta migraciones al arrancar
    - Leer y ejecutar todos los archivos `.sql` de `/server/db/migrations/` en orden numérico
    - _Requisitos: 12.4, 12.5_
  - [x] 2.2 Crear `/server/db/migrations/001_initial.sql` con las tablas `users`, `incomes`, `fixed_expenses`, `ant_expenses`, `debts`
    - Incluir todas las restricciones CHECK, FOREIGN KEY con ON DELETE CASCADE e índices por `user_id`
    - _Requisitos: 12.1, 12.2, 12.4_

- [x] 3. Implementar autenticación en el servidor
  - [x] 3.1 Crear `auth.service.js` con funciones `registerUser` y `loginUser`
    - `registerUser`: validar unicidad de email, hashear contraseña con bcrypt (cost 10), insertar usuario, retornar JWT firmado con expiración 8h
    - `loginUser`: buscar usuario por email, comparar hash, retornar JWT o lanzar error genérico
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.6_
  - [x] 3.2 Crear `auth.middleware.js` con `verifyJWT` que extrae el Bearer token, lo verifica y adjunta `req.userId`
    - Retornar HTTP 401 con `{ error: "No autorizado" }` si el token es inválido o ausente
    - _Requisitos: 1.7_
  - [x] 3.3 Crear `auth.routes.js` con `POST /auth/register` y `POST /auth/login` usando express-validator
    - Retornar HTTP 409 si el email ya existe; HTTP 401 con mensaje genérico si las credenciales son incorrectas
    - _Requisitos: 1.1, 1.3, 1.4_
  - [ ]* 3.4 Escribir prueba de propiedad para rechazo de credenciales inválidas
    - **Propiedad 10: Rechazo de credenciales inválidas sin revelar campo**
    - **Valida: Requisito 1.4**
  - [ ]* 3.5 Escribir pruebas unitarias para `auth.service.js`
    - Verificar que el hash bcrypt comienza con `$2b$10$`; verificar que el JWT expira en 8h; verificar error genérico en login fallido
    - _Requisitos: 1.2, 1.4, 1.6_

- [x] 4. Implementar utilidades financieras del cliente
  - [x] 4.1 Crear `/client/src/utils/formatCurrency.js` con `formatCOP(amount)`
    - Usar `Math.round(amount).toLocaleString('es-CO')` prefijado con `$`
    - _Requisitos: 11.2_
  - [x] 4.2 Crear `/client/src/utils/financialCalc.js` con todas las fórmulas financieras
    - `calcMonthlyPayment(P, r, n)`, `calcTotalInterest`, `calcAntImpact`, `calcSavingsProjection`, `calcFinancialHealth`
    - _Requisitos: 6.1, 6.2, 5.2, 7.4, 2.2_
  - [ ]* 4.3 Escribir prueba de propiedad para `formatCOP`
    - **Propiedad 7: Formato de Peso Colombiano**
    - **Valida: Requisito 11.2**
  - [ ]* 4.4 Escribir prueba de propiedad para `calcFinancialHealth`
    - **Propiedad 3: Semáforo financiero**
    - **Valida: Requisitos 2.2, 7.5**
  - [ ]* 4.5 Escribir prueba de propiedad para `calcMonthlyPayment`
    - **Propiedad 4: Fórmula de amortización de deudas**
    - **Valida: Requisitos 6.1, 6.2**
  - [ ]* 4.6 Escribir prueba de propiedad para `calcAntImpact`
    - **Propiedad 5: Invariante de gasto hormiga**
    - **Valida: Requisitos 5.2, 5.3, 5.4**
  - [ ]* 4.7 Escribir prueba de propiedad para `calcSavingsProjection`
    - **Propiedad 6: Proyección de ahorro lineal**
    - **Valida: Requisito 7.4**

- [x] 5. Checkpoint — Verificar que todas las pruebas de utilidades pasan
  - Asegurarse de que todas las pruebas pasan; consultar al usuario si surgen dudas.

- [ ] 6. Implementar servicios y rutas de la API REST
  - [x] 6.1 Crear `finance.service.js` con funciones CRUD para `incomes`, `fixed_expenses`, `ant_expenses`, `debts`
    - Todas las consultas deben filtrar por `user_id` para garantizar aislamiento
    - Calcular `monthly_total` y `annual_impact` en el servidor antes de insertar `ant_expenses`
    - Calcular `monthly_payment`, `total_interest`, `total_cost` en el servidor antes de insertar `debts`
    - _Requisitos: 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 12.1_
  - [x] 6.2 Crear rutas CRUD para `/api/incomes`, `/api/fixed-expenses`, `/api/ant-expenses`, `/api/debts`
    - Aplicar `verifyJWT` en todas las rutas; usar express-validator para validar campos requeridos y restricciones de negocio
    - Retornar HTTP 403/404 si el recurso no pertenece al usuario autenticado
    - _Requisitos: 3.1–3.6, 4.1–4.6, 5.1–5.6, 6.1–6.6, 12.1_
  - [ ]* 6.3 Escribir prueba de propiedad para validación de monto positivo en la API
    - **Propiedad 1: Validación de monto positivo**
    - **Valida: Requisitos 3.1, 3.6, 4.1, 4.6, 5.1, 5.6**
  - [ ]* 6.4 Escribir prueba de propiedad para aislamiento de datos entre usuarios
    - **Propiedad 8: Aislamiento de datos entre usuarios**
    - **Valida: Requisitos 1.7, 12.1**
  - [-] 6.5 Crear `summary.routes.js` con `GET /api/summary/:year/:month`
    - Agregar ingresos, gastos fijos, gastos hormiga y cuotas de deudas del mes; calcular `available_savings`, `savings_pct` y `health`
    - _Requisitos: 7.1, 7.2, 2.2_
  - [ ]* 6.6 Escribir prueba de propiedad para consistencia del resumen mensual
    - **Propiedad 9: Consistencia del resumen mensual**
    - **Valida: Requisitos 7.1, 2.2**
  - [-] 6.7 Crear `GET /api/charts/history?months=N` que retorna datos históricos agrupados por mes
    - _Requisitos: 8.2, 8.3_
  - [-] 6.8 Crear `export.service.js` y `export.routes.js` con `GET /api/export/csv`
    - Generar CSV con todas las entidades del usuario autenticado
    - _Requisitos: 10.4_
  - [-] 6.9 Crear `profile.routes.js` con `GET/PUT /api/profile`, `PUT /api/profile/password`, `DELETE /api/profile`
    - Verificar contraseña actual antes de cambiarla; eliminar cuenta en cascada
    - _Requisitos: 10.1, 10.2, 10.3, 10.5, 10.6_
  - [x] 6.10 Registrar todas las rutas en `server.js` y añadir middleware global de manejo de errores
    - Añadir endpoint `GET /health` para smoke tests
    - _Requisitos: 12.5_

- [ ] 7. Checkpoint — Verificar que todas las pruebas del servidor pasan
  - Asegurarse de que todas las pruebas pasan; consultar al usuario si surgen dudas.

- [ ] 8. Implementar infraestructura del cliente (layout, contexto, servicios)
  - [ ] 8.1 Crear `AuthContext.jsx` con estado `{ token, user }` y funciones `login()`, `logout()`
    - Persistir token en `localStorage`; detectar expiración y llamar `logout()` automáticamente
    - _Requisitos: 1.2, 1.5_
  - [ ] 8.2 Crear `/client/src/services/api.js` como instancia Axios con `baseURL` y dos interceptores
    - Interceptor de request: adjuntar `Authorization: Bearer <token>`
    - Interceptor de response: detectar HTTP 401 y llamar `logout()` del contexto
    - _Requisitos: 1.5, 1.7_
  - [ ] 8.3 Crear `useApi.js` (wrapper de Axios con manejo de errores) y `useToast.js`
    - _Requisitos: 11.3, 11.4_
  - [ ] 8.4 Crear componentes de layout: `AppLayout.jsx`, `Sidebar.jsx`, `BottomNav.jsx`, `TopBar.jsx`
    - Sidebar visible en ≥768px; BottomNav visible en <768px; aplicar paleta de colores (#1A5276 primario, #E67E22 acento)
    - _Requisitos: 11.1, 11.6_
  - [ ] 8.5 Crear componentes UI reutilizables: `Button`, `Card`, `Modal`, `Toast`, `Spinner`, `ProgressBar`
    - Toast con auto-dismiss a los 3 segundos; Spinner deshabilita el botón de envío mientras está activo
    - _Requisitos: 11.3, 11.4_
  - [ ] 8.6 Configurar React Router v6 en `App.jsx` con rutas públicas (`/login`, `/register`) y rutas protegidas (resto)
    - Redirigir a `/login` si no hay token válido
    - _Requisitos: 1.7_

- [ ] 9. Implementar páginas de autenticación
  - [ ] 9.1 Crear `Login.jsx` con formulario de email y contraseña
    - Validación en cliente antes de enviar; mostrar error genérico del servidor; redirigir al Dashboard tras login exitoso
    - _Requisitos: 1.2, 1.4, 11.5, 11.7_
  - [ ] 9.2 Crear `Register.jsx` con formulario de nombre, email y contraseña (mínimo 8 caracteres)
    - Mostrar error si el email ya existe; redirigir al Dashboard tras registro exitoso
    - _Requisitos: 1.1, 1.3, 11.5, 11.7_

- [ ] 10. Implementar Dashboard
  - [ ] 10.1 Crear `Dashboard.jsx` que consume `GET /api/summary/:year/:month`
    - Mostrar tarjetas de Total Ingresos, Gastos Fijos, Gastos Hormiga, Ahorro disponible y Balance, todos en `formatCOP`
    - _Requisitos: 2.1, 11.2_
  - [ ] 10.2 Implementar `Semáforo_Financiero` en el Dashboard usando `calcFinancialHealth`
    - Verde (SALUDABLE), amarillo (AJUSTADO), rojo (DÉFICIT)
    - _Requisitos: 2.2_
  - [ ] 10.3 Implementar barra de progreso de Meta_Ahorro y 3 consejos financieros personalizados
    - Consejo de mayor impacto: mostrar el gasto hormiga con mayor `annual_impact` cuando el ahorro < Meta_Ahorro
    - _Requisitos: 2.3, 2.4, 2.5_
  - [ ] 10.4 Implementar botones de acceso rápido que abren modales de formulario sin navegar fuera del Dashboard
    - _Requisitos: 2.6, 2.7_

- [ ] 11. Implementar páginas de gestión de entidades financieras
  - [ ] 11.1 Crear `Incomes.jsx` con lista de ingresos del mes, formulario de creación/edición y confirmación de eliminación
    - Selector de mes/año; mostrar nombre, categoría, monto en `formatCOP` y fecha
    - _Requisitos: 3.1–3.6, 11.3, 11.4, 11.5_
  - [ ]* 11.2 Escribir prueba de propiedad para round-trip de persistencia de ingresos
    - **Propiedad 2: Round-trip de persistencia por mes/año**
    - **Valida: Requisitos 3.2, 4.2, 7.2, 12.2, 12.3**
  - [ ] 11.3 Crear `FixedExpenses.jsx` con lista de gastos fijos del mes, formulario y barra de progreso sobre ingresos
    - _Requisitos: 4.1–4.6, 11.3, 11.4, 11.5_
  - [ ] 11.4 Crear `AntExpenses.jsx` con lista de gastos hormiga, formulario y mensaje de ahorro anual por ítem
    - Mostrar `monthly_total` y `annual_impact` en `formatCOP`; mensaje "Si eliminas este gasto, ahorrarías $X al año"
    - _Requisitos: 5.1–5.6, 11.3, 11.4, 11.5_
  - [ ] 11.5 Crear `Debts.jsx` con calculadora en tiempo real y lista de deudas guardadas
    - Calcular `monthly_payment`, `total_interest`, `total_cost` en tiempo real al cambiar los inputs; barra de progreso de pago
    - _Requisitos: 6.1–6.6, 11.3, 11.4, 11.5_

- [ ] 12. Implementar página de Resumen Mensual
  - [ ] 12.1 Crear `MonthlySummary.jsx` con selector de mes/año y tabla de balance completo
    - Mostrar total ingresos, gastos fijos, gastos hormiga, cuotas de deudas, ahorro disponible y porcentaje de ahorro
    - _Requisitos: 7.1, 7.2_
  - [ ] 12.2 Implementar tabla de Proyección_Ahorro a 3, 6, 12, 24 y 36 meses
    - Usar `calcSavingsProjection(monthlySavings, months)` para cada horizonte
    - _Requisitos: 7.3, 7.4_
  - [ ] 12.3 Mostrar alerta de déficit cuando el ahorro mensual es negativo
    - _Requisitos: 7.5_

- [ ] 13. Implementar página de Gráficas
  - [ ] 13.1 Crear `Charts.jsx` con los cuatro gráficos usando Recharts
    - Torta: distribución de gastos fijos por categoría del mes
    - Barras: ingresos vs gastos totales de los últimos 6 meses (datos de `GET /api/charts/history?months=6`)
    - Línea: evolución del ahorro mensual de los últimos 12 meses
    - Dona: distribución del ingreso entre gastos fijos, hormiga, deudas y ahorro
    - _Requisitos: 8.1, 8.2, 8.3, 8.4_
  - [ ] 13.2 Configurar tooltips en todos los gráficos con valor en `formatCOP` y porcentaje
    - _Requisitos: 8.5_
  - [ ] 13.3 Mostrar estado vacío descriptivo cuando no hay datos para el período seleccionado
    - _Requisitos: 8.6_

- [ ] 14. Implementar página de Aprendizaje
  - [ ] 14.1 Crear `Learning.jsx` con al menos 4 tarjetas de temas financieros expandibles
    - Temas: presupuesto, ahorro, deudas, inversión; cada tarjeta con título, descripción breve y contenido expandible al hacer clic
    - _Requisitos: 9.1, 9.2_
  - [ ] 14.2 Añadir sección de videos de YouTube embebidos (mínimo 3) con título y descripción
    - Usar URLs de placeholder reemplazables
    - _Requisitos: 9.3_
  - [ ] 14.3 Añadir sección de hojas de consejos descargables (mínimo 2) con modal de previsualización
    - _Requisitos: 9.4_

- [ ] 15. Implementar página de Perfil
  - [ ] 15.1 Crear `Profile.jsx` con formulario de actualización de nombre, email y Meta_Ahorro
    - _Requisitos: 10.1, 10.6_
  - [ ] 15.2 Implementar sección de cambio de contraseña con verificación de contraseña actual
    - Mostrar error si la contraseña actual no coincide
    - _Requisitos: 10.2, 10.3_
  - [ ] 15.3 Implementar botón de exportación CSV que descarga el archivo generado por `GET /api/export/csv`
    - _Requisitos: 10.4_
  - [ ] 15.4 Implementar botón de eliminación de cuenta con modal de confirmación
    - Eliminar todos los datos en cascada y cerrar sesión
    - _Requisitos: 10.5_

- [ ] 16. Checkpoint final — Verificar que todas las pruebas pasan y la app arranca
  - Ejecutar `npm run test` en `/client` y `/server`; verificar que `npm install && npm run dev` arranca sin errores; consultar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental
- Las pruebas de propiedad usan fast-check con mínimo 100 iteraciones por propiedad (`numRuns: 100`)
- Las pruebas unitarias usan Vitest en ambos proyectos
- Todos los textos, etiquetas y mensajes deben estar en español (Requisito 11.7)
