require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db/database');

async function start() {
  await connectDB();

  const app = express();
  const allowedOrigins = [
    'http://localhost:5173',
    /\.vercel\.app$/,
  ];
  if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      callback(null, allowed ? origin : false);
    },
    credentials: true,
  }));
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
    res.status(err.status || 500).json({ error: err.message || 'Error interno' });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });
