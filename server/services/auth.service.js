const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} password  - plain text, will be hashed
 * @returns {{ token: string, user: { id, name, email, savingsGoalPct } }}
 */
async function registerUser(name, email, password) {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);

  const result = db.prepare(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  ).run(name, email, hash);

  const user = {
    id: result.lastInsertRowid,
    name,
    email,
    savingsGoalPct: 10.0,
  };

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });

  return { token, user };
}

/**
 * Authenticate an existing user.
 * @param {string} email
 * @param {string} password  - plain text
 * @returns {{ token: string, user: { id, name, email, savingsGoalPct } }}
 */
async function loginUser(email, password) {
  const row = db.prepare(
    'SELECT id, name, email, password, savings_goal_pct FROM users WHERE email = ?'
  ).get(email);

  const genericError = new Error('Credenciales inválidas');
  genericError.status = 401;

  if (!row) throw genericError;

  const match = await bcrypt.compare(password, row.password);
  if (!match) throw genericError;

  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    savingsGoalPct: row.savings_goal_pct,
  };

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });

  return { token, user };
}

module.exports = { registerUser, loginUser };
