require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');

async function start() {
  // Initialize SQLite (sql.js WASM) before anything else
  await initDatabase();
  console.log('✅ Base de datos inicializada');

  const app = express();
  const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:5173']
    : ['http://localhost:5173'];
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());

  app.use('/auth', require('./routes/auth.routes'));
  app.use('/api/incomes', require('./routes/incomes.routes'));
  app.use('/api/fixed-expenses', require('./routes/fixedExpenses.routes'));
  app.use('/api/ant-expenses', require('./routes/antExpenses.routes'));
  app.use('/api/debts', require('./routes/debts.routes'));
  app.use('/api/summary', require('./routes/summary.routes'));
  app.use('/api/charts', require('./routes/charts.routes'));
  app.use('/api/export', require('./routes/export.routes'));
  app.use('/api/profile', require('./routes/profile.routes'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
}

start().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
