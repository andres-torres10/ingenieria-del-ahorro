# Documento de Requisitos

## Introducción

"Ingeniería del Ahorro" es una aplicación web full-stack de gestión de finanzas personales del hogar, diseñada para familias colombianas. Permite a los usuarios registrar ingresos, gastos fijos, gastos hormiga y deudas; visualizar su salud financiera mediante un semáforo; proyectar ahorros; y aprender sobre finanzas personales. La aplicación es mobile-first, visualmente atractiva, y opera completamente en español con formato de peso colombiano.

## Glosario

- **Sistema**: La aplicación web "Ingeniería del Ahorro" en su conjunto.
- **Usuario**: Persona registrada que accede a la aplicación con credenciales propias.
- **Autenticador**: Módulo responsable del registro, inicio de sesión y gestión de sesiones JWT.
- **Dashboard**: Página principal que muestra el resumen financiero mensual del Usuario.
- **Semáforo_Financiero**: Indicador visual (verde/amarillo/rojo) que refleja la salud financiera del Usuario.
- **Ingreso**: Entrada de dinero registrada por el Usuario con fuente, monto, frecuencia y fecha.
- **Gasto_Fijo**: Egreso recurrente registrado por el Usuario con categoría, descripción, monto y fecha de vencimiento.
- **Gasto_Hormiga**: Egreso pequeño y frecuente registrado por el Usuario con descripción, categoría, costo unitario y frecuencia mensual.
- **Deuda**: Obligación financiera del Usuario con capital, tasa mensual y plazo en meses.
- **Calculadora_Deudas**: Módulo que aplica la fórmula de amortización para calcular cuota mensual, interés total y costo total.
- **Resumen_Mensual**: Vista consolidada del balance financiero de un mes específico.
- **Proyección_Ahorro**: Tabla que estima el ahorro acumulado a 3, 6, 12, 24 y 36 meses.
- **Graficador**: Módulo que genera gráficas interactivas (torta, barras, línea, dona) con Recharts.
- **Exportador**: Módulo que genera y descarga los datos del Usuario en formato CSV.
- **Meta_Ahorro**: Porcentaje del ingreso mensual que el Usuario desea destinar al ahorro (por defecto 10%).
- **Salud_Financiera**: Estado calculado: SALUDABLE si ahorro > 10% del ingreso; AJUSTADO si ahorro entre 0% y 10%; DÉFICIT si ahorro es negativo.
- **Peso_Colombiano**: Formato de moneda: $1.234.567 (punto como separador de miles, sin decimales).

---

## Requisitos

### Requisito 1: Autenticación de Usuarios

**Historia de Usuario:** Como visitante, quiero registrarme e iniciar sesión de forma segura, para que mis datos financieros estén protegidos y sean privados.

#### Criterios de Aceptación

1. THE Autenticador SHALL registrar un Usuario nuevo con nombre, correo electrónico único y contraseña de mínimo 8 caracteres.
2. WHEN un visitante envía credenciales válidas, THE Autenticador SHALL emitir un token JWT con expiración de 8 horas y almacenarlo en localStorage.
3. IF el correo electrónico ya existe en la base de datos, THEN THE Autenticador SHALL retornar un mensaje de error indicando que el correo ya está registrado.
4. IF las credenciales de inicio de sesión son incorrectas, THEN THE Autenticador SHALL retornar un mensaje de error genérico sin revelar cuál campo es incorrecto.
5. WHEN el token JWT del Usuario expira o lleva más de 30 minutos sin actividad, THE Autenticador SHALL cerrar la sesión automáticamente y redirigir al Usuario a la pantalla de inicio de sesión.
6. THE Autenticador SHALL almacenar las contraseñas usando bcrypt con un factor de costo mínimo de 10.
7. WHILE el Usuario tiene una sesión activa, THE Sistema SHALL proteger todas las rutas de la aplicación y rechazar peticiones sin token JWT válido con código HTTP 401.

---

### Requisito 2: Dashboard Principal

**Historia de Usuario:** Como Usuario autenticado, quiero ver un resumen de mi situación financiera mensual en una sola pantalla, para que pueda tomar decisiones rápidas sobre mis finanzas.

#### Criterios de Aceptación

1. WHEN el Usuario accede al Dashboard, THE Dashboard SHALL mostrar tarjetas con: Total de Ingresos del mes, Total de Gastos Fijos, Total de Gastos Hormiga, Ahorro disponible y Balance disponible, todos formateados en Peso_Colombiano.
2. WHEN el Usuario accede al Dashboard, THE Semáforo_Financiero SHALL mostrar estado SALUDABLE (verde) si el ahorro supera el 10% del ingreso total, AJUSTADO (amarillo) si el ahorro está entre 0% y 10% del ingreso, o DÉFICIT (rojo) si el ahorro es negativo.
3. THE Dashboard SHALL mostrar 3 consejos financieros personalizados calculados a partir de los datos reales del Usuario del mes en curso.
4. WHEN el porcentaje de ahorro del Usuario es inferior a la Meta_Ahorro, THE Dashboard SHALL mostrar el consejo de reducir el Gasto_Hormiga de mayor impacto anual.
5. THE Dashboard SHALL mostrar una barra de progreso que indica el porcentaje alcanzado de la Meta_Ahorro mensual del Usuario.
6. THE Dashboard SHALL mostrar botones de acceso rápido para registrar un nuevo Ingreso, un nuevo Gasto_Fijo y un nuevo Gasto_Hormiga.
7. WHEN el Usuario hace clic en un botón de acceso rápido, THE Dashboard SHALL abrir el formulario correspondiente sin navegar fuera del Dashboard.

---

### Requisito 3: Gestión de Ingresos

**Historia de Usuario:** Como Usuario, quiero registrar y administrar mis fuentes de ingreso mensual, para que el sistema pueda calcular correctamente mi balance financiero.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir al Usuario registrar un Ingreso con los campos: nombre de la fuente, monto (mayor a 0), frecuencia (única, semanal, quincenal, mensual), fecha y categoría (Salario, Freelance, Negocio, Arriendo, Otro).
2. WHEN el Usuario guarda un Ingreso, THE Sistema SHALL almacenarlo asociado al Usuario y al mes/año correspondiente a la fecha ingresada.
3. THE Sistema SHALL mostrar la lista de todos los Ingresos del mes seleccionado con nombre, categoría, monto en Peso_Colombiano y fecha.
4. WHEN el Usuario selecciona editar un Ingreso, THE Sistema SHALL cargar los datos actuales en el formulario y permitir modificarlos.
5. WHEN el Usuario confirma la eliminación de un Ingreso, THE Sistema SHALL eliminar el registro y recalcular el balance del mes.
6. IF el campo monto de un Ingreso es cero o negativo, THEN THE Sistema SHALL mostrar un mensaje de validación e impedir el guardado.

---

### Requisito 4: Gestión de Gastos Fijos

**Historia de Usuario:** Como Usuario, quiero registrar mis gastos fijos mensuales, para que pueda ver cuánto de mi ingreso está comprometido en obligaciones recurrentes.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir al Usuario registrar un Gasto_Fijo con los campos: categoría, descripción, monto (mayor a 0) y fecha de vencimiento.
2. WHEN el Usuario guarda un Gasto_Fijo, THE Sistema SHALL almacenarlo asociado al Usuario y al mes/año de la fecha de vencimiento.
3. THE Sistema SHALL mostrar la lista de Gastos_Fijos del mes con descripción, categoría, monto en Peso_Colombiano y fecha de vencimiento.
4. THE Sistema SHALL mostrar una barra de progreso que indica el porcentaje que representan los Gastos_Fijos sobre el total de Ingresos del mes.
5. WHEN el Usuario confirma la eliminación de un Gasto_Fijo, THE Sistema SHALL eliminar el registro y recalcular el balance del mes.
6. IF el campo monto de un Gasto_Fijo es cero o negativo, THEN THE Sistema SHALL mostrar un mensaje de validación e impedir el guardado.

---

### Requisito 5: Gestión de Gastos Hormiga

**Historia de Usuario:** Como Usuario, quiero registrar mis gastos hormiga con su frecuencia mensual, para que pueda visualizar su impacto real en mi presupuesto anual y tomar decisiones de reducción.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir al Usuario registrar un Gasto_Hormiga con los campos: descripción, categoría, costo unitario (mayor a 0) y número de veces por mes (mayor a 0).
2. WHEN el Usuario guarda un Gasto_Hormiga, THE Sistema SHALL calcular automáticamente el total mensual como `costo_unitario × veces_por_mes` y la proyección anual como `costo_unitario × veces_por_mes × 12`.
3. THE Sistema SHALL mostrar por cada Gasto_Hormiga: descripción, costo unitario, veces por mes, total mensual y proyección anual, todos en Peso_Colombiano.
4. THE Sistema SHALL mostrar por cada Gasto_Hormiga el mensaje "Si eliminas este gasto, ahorrarías $X al año" donde X es la proyección anual calculada.
5. WHEN el Usuario confirma la eliminación de un Gasto_Hormiga, THE Sistema SHALL eliminar el registro y recalcular el balance del mes.
6. IF el campo costo unitario o veces por mes de un Gasto_Hormiga es cero o negativo, THEN THE Sistema SHALL mostrar un mensaje de validación e impedir el guardado.

---

### Requisito 6: Gestión de Deudas e Intereses

**Historia de Usuario:** Como Usuario, quiero registrar mis deudas y calcular su costo real, para que pueda planificar su pago y entender el impacto de los intereses.

#### Criterios de Aceptación

1. THE Calculadora_Deudas SHALL calcular la cuota mensual de una Deuda usando la fórmula: `P × (r(1+r)^n) / ((1+r)^n - 1)`, donde P es el capital, r es la tasa mensual en decimal y n es el plazo en meses.
2. THE Calculadora_Deudas SHALL calcular el interés total como `(cuota_mensual × n) - P` y el costo total como `cuota_mensual × n`.
3. WHEN el Usuario ingresa capital, tasa mensual y plazo, THE Calculadora_Deudas SHALL mostrar en tiempo real la cuota mensual, el interés total y el costo total en Peso_Colombiano.
4. THE Sistema SHALL permitir al Usuario guardar una Deuda calculada con nombre del acreedor, capital, tasa mensual, plazo y saldo pendiente.
5. THE Sistema SHALL mostrar la lista de Deudas del Usuario con nombre del acreedor, cuota mensual, saldo pendiente y una barra de progreso que indica el porcentaje pagado.
6. IF la tasa mensual ingresada es mayor a 100% o el plazo es menor a 1 mes, THEN THE Calculadora_Deudas SHALL mostrar un mensaje de validación e impedir el cálculo.

---

### Requisito 7: Resumen Mensual y Proyección de Ahorro

**Historia de Usuario:** Como Usuario, quiero ver el balance completo de cualquier mes y proyectar mi ahorro futuro, para que pueda planificar mis metas financieras a largo plazo.

#### Criterios de Aceptación

1. THE Resumen_Mensual SHALL mostrar el balance del mes seleccionado: total ingresos, total gastos fijos, total gastos hormiga, total cuotas de deudas, ahorro disponible y porcentaje de ahorro sobre ingresos.
2. THE Sistema SHALL permitir al Usuario seleccionar cualquier mes y año para consultar el Resumen_Mensual histórico.
3. THE Sistema SHALL permitir al Usuario configurar su Meta_Ahorro como porcentaje del ingreso mensual, con valor por defecto de 10%.
4. THE Proyección_Ahorro SHALL calcular el ahorro acumulado proyectado a 3, 6, 12, 24 y 36 meses usando la fórmula `ahorro_mensual_actual × número_de_meses` y mostrar los resultados en una tabla en Peso_Colombiano.
5. WHEN el ahorro mensual del Usuario es negativo, THE Resumen_Mensual SHALL mostrar una alerta indicando que el Usuario está en déficit y sugerir revisar los gastos.

---

### Requisito 8: Gráficas Interactivas

**Historia de Usuario:** Como Usuario, quiero visualizar mis finanzas en gráficas interactivas, para que pueda identificar patrones y áreas de mejora de forma visual e intuitiva.

#### Criterios de Aceptación

1. THE Graficador SHALL mostrar una gráfica de torta con la distribución porcentual de los Gastos_Fijos por categoría del mes seleccionado.
2. THE Graficador SHALL mostrar una gráfica de barras comparando Ingresos vs Gastos totales por mes de los últimos 6 meses.
3. THE Graficador SHALL mostrar una gráfica de línea con la evolución del ahorro mensual de los últimos 12 meses.
4. THE Graficador SHALL mostrar una gráfica de dona con la distribución del ingreso entre Gastos_Fijos, Gastos_Hormiga, cuotas de Deudas y Ahorro.
5. WHEN el Usuario pasa el cursor sobre cualquier elemento de una gráfica, THE Graficador SHALL mostrar un tooltip con el valor exacto en Peso_Colombiano y el porcentaje correspondiente.
6. IF no hay datos suficientes para una gráfica, THEN THE Graficador SHALL mostrar un mensaje indicando que no hay datos disponibles para el período seleccionado.

---

### Requisito 9: Sección de Aprendizaje

**Historia de Usuario:** Como Usuario, quiero acceder a recursos educativos sobre finanzas personales, para que pueda mejorar mis conocimientos y tomar mejores decisiones financieras.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar al menos 4 tarjetas de temas financieros (ej: presupuesto, ahorro, deudas, inversión) con título, descripción breve y contenido expandible.
2. WHEN el Usuario hace clic en una tarjeta de tema, THE Sistema SHALL expandir la tarjeta mostrando la explicación completa del tema.
3. THE Sistema SHALL mostrar al menos 3 videos de YouTube embebidos con título y descripción, usando URLs de placeholder reemplazables.
4. THE Sistema SHALL mostrar al menos 2 opciones de descarga de hojas de consejos financieros que abran un modal con el contenido antes de descargar.

---

### Requisito 10: Perfil de Usuario

**Historia de Usuario:** Como Usuario, quiero gestionar mi perfil y configuración personal, para que la aplicación refleje mis datos actualizados y pueda exportar o eliminar mi información.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir al Usuario actualizar su nombre, correo electrónico e ingreso mensual objetivo desde la página de perfil.
2. THE Sistema SHALL permitir al Usuario cambiar su contraseña ingresando la contraseña actual y la nueva contraseña (mínimo 8 caracteres) con confirmación.
3. IF la contraseña actual ingresada no coincide con la almacenada, THEN THE Sistema SHALL mostrar un mensaje de error e impedir el cambio de contraseña.
4. THE Exportador SHALL generar un archivo CSV con todos los datos del Usuario (ingresos, gastos fijos, gastos hormiga, deudas) al hacer clic en "Exportar datos".
5. WHEN el Usuario confirma la eliminación de su cuenta, THE Sistema SHALL eliminar todos los datos del Usuario de la base de datos y cerrar la sesión.
6. THE Sistema SHALL permitir al Usuario configurar su Meta_Ahorro en porcentaje desde la página de perfil.

---

### Requisito 11: Navegación y Experiencia de Usuario

**Historia de Usuario:** Como Usuario, quiero una interfaz fluida, mobile-friendly y en español, para que pueda gestionar mis finanzas cómodamente desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar una barra de navegación lateral en pantallas de ancho mayor o igual a 768px y una barra de navegación inferior en pantallas de ancho menor a 768px.
2. THE Sistema SHALL formatear todos los valores monetarios en Peso_Colombiano con el patrón `$X.XXX.XXX` (punto como separador de miles, sin decimales).
3. WHEN una operación de guardado, edición o eliminación se completa exitosamente, THE Sistema SHALL mostrar una notificación toast con mensaje de confirmación que desaparece después de 3 segundos.
4. WHEN una operación de red está en progreso, THE Sistema SHALL mostrar un indicador de carga (spinner) y deshabilitar el botón de envío del formulario correspondiente.
5. IF un formulario contiene campos requeridos vacíos o con valores inválidos al momento del envío, THEN THE Sistema SHALL mostrar mensajes de validación junto a cada campo inválido sin enviar la petición al servidor.
6. THE Sistema SHALL aplicar la paleta de colores: verde oscuro (#1A5276) como color primario y naranja (#E67E22) como color de acento en botones de acción principal, indicadores y elementos destacados.
7. THE Sistema SHALL mantener todos los textos, etiquetas, mensajes de error y notificaciones en idioma español.

---

### Requisito 12: Persistencia e Integridad de Datos

**Historia de Usuario:** Como Usuario, quiero que mis datos estén aislados de otros usuarios y se conserven históricamente por mes, para que pueda consultar cualquier período pasado con precisión.

#### Criterios de Aceptación

1. THE Sistema SHALL aislar todos los datos de cada Usuario de forma que un Usuario no pueda acceder ni modificar los datos de otro Usuario.
2. THE Sistema SHALL preservar los registros históricos de Ingresos, Gastos_Fijos, Gastos_Hormiga y Deudas asociados al mes y año en que fueron creados.
3. WHEN el Usuario navega a un mes diferente en cualquier vista, THE Sistema SHALL cargar únicamente los registros correspondientes a ese mes y año.
4. THE Sistema SHALL utilizar SQLite con better-sqlite3 como motor de base de datos, con migraciones versionadas almacenadas en `/server/db`.
5. IF una operación de escritura en la base de datos falla, THEN THE Sistema SHALL retornar un código HTTP 500 con un mensaje de error descriptivo y registrar el error en el log del servidor.
