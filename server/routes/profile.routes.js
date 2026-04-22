const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { verifyJWT } = require('../middleware/auth.middleware');
const { db } = require('../db/database');

const router = Router();

// GET /api/profile
router.get('/', verifyJWT, (req, res) => {
  const user = db.prepare('SELECT id, name, email, savings_goal_pct FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  return res.json({ id: user.id, name: user.name, email: user.email, savingsGoalPct: user.savings_goal_pct });
});

// PUT /api/profile
router.put('/', verifyJWT, [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('El correo no es válido'),
  body('savings_goal_pct').isFloat({ min: 0, max: 100 }).withMessage('La meta de ahorro debe estar entre 0 y 100'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });

  const { name, email, savings_goal_pct } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.userId);
  if (existing) return res.status(409).json({ error: 'El correo ya está en uso' });

  db.prepare('UPDATE users SET name = ?, email = ?, savings_goal_pct = ? WHERE id = ?').run(name, email, savings_goal_pct, req.userId);
  const updated = db.prepare('SELECT id, name, email, savings_goal_pct FROM users WHERE id = ?').get(req.userId);
  return res.json({ id: updated.id, name: updated.name, email: updated.email, savingsGoalPct: updated.savings_goal_pct });
});

// PUT /api/profile/password
router.put('/password', verifyJWT, [
  body('current_password').notEmpty().withMessage('La contraseña actual es requerida'),
  body('new_password').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });

  const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.userId);
  const match = await bcrypt.compare(req.body.current_password, user.password);
  if (!match) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

  const hash = await bcrypt.hash(req.body.new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.userId);
  return res.json({ message: 'Contraseña actualizada correctamente' });
});

// DELETE /api/profile
router.delete('/', verifyJWT, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  return res.status(204).send();
});

module.exports = router;
