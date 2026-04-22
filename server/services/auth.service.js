const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function registerUser(name, email, password) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('El correo ya está registrado');
    err.status = 409;
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return { token, user: { id: user._id, name: user.name, email: user.email, savingsGoalPct: user.savings_goal_pct } };
}

async function loginUser(email, password) {
  const genericError = new Error('Credenciales inválidas');
  genericError.status = 401;
  const user = await User.findOne({ email });
  if (!user) throw genericError;
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw genericError;
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return { token, user: { id: user._id, name: user.name, email: user.email, savingsGoalPct: user.savings_goal_pct } };
}

module.exports = { registerUser, loginUser };
