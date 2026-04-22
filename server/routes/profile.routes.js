const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { verifyJWT } = require('../middleware/auth.middleware');
const User = require('../models/User');

const router = Router();

router.get('/', verifyJWT, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ id: user._id, name: user.name, email: user.email, savingsGoalPct: user.savings_goal_pct });
});

router.put('/', verifyJWT, [
  body('name').trim().notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Correo inválido'),
  body('savings_goal_pct').isFloat({ min: 0, max: 100 }).withMessage('Meta entre 0 y 100'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const { name, email, savings_goal_pct } = req.body;
  const existing = await User.findOne({ email, _id: { $ne: req.userId } });
  if (existing) return res.status(409).json({ error: 'El correo ya está en uso' });
  const user = await User.findByIdAndUpdate(req.userId, { name, email, savings_goal_pct }, { new: true }).lean();
  res.json({ id: user._id, name: user.name, email: user.email, savingsGoalPct: user.savings_goal_pct });
});

router.put('/password', verifyJWT, [
  body('current_password').notEmpty().withMessage('Contraseña actual requerida'),
  body('new_password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const user = await User.findById(req.userId);
  const match = await bcrypt.compare(req.body.current_password, user.password);
  if (!match) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
  user.password = await bcrypt.hash(req.body.new_password, 10);
  await user.save();
  res.json({ message: 'Contraseña actualizada' });
});

router.delete('/', verifyJWT, async (req, res) => {
  await User.findByIdAndDelete(req.userId);
  res.status(204).send();
});

module.exports = router;
