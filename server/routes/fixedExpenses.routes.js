const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const svc = require('../services/finance.service');

const router = Router();
const validations = [
  body('category').trim().notEmpty().withMessage('Categoría requerida'),
  body('description').trim().notEmpty().withMessage('Descripción requerida'),
  body('amount').isFloat({ gt: 0 }).withMessage('Monto debe ser mayor a 0'),
  body('due_date').trim().notEmpty().withMessage('Fecha requerida'),
];
const fmt = e => e.array().map(x => ({ field: x.path, message: x.msg }));

router.get('/', verifyJWT, async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  try { res.json(await svc.getFixedExpenses(req.userId, year, month)); }
  catch { res.status(500).json({ error: 'Error interno' }); }
});

router.post('/', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { category, description, amount, due_date } = req.body;
    const d = new Date(due_date);
    const exp = await svc.createFixedExpense(req.userId, { category, description, amount: +amount, due_date, month: d.getMonth() + 1, year: d.getFullYear() });
    res.status(201).json(exp);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.put('/:id', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { category, description, amount, due_date } = req.body;
    const d = new Date(due_date);
    const exp = await svc.updateFixedExpense(req.params.id, req.userId, { category, description, amount: +amount, due_date, month: d.getMonth() + 1, year: d.getFullYear() });
    if (!exp) return res.status(404).json({ error: 'No encontrado' });
    res.json(exp);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const ok = await svc.deleteFixedExpense(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

module.exports = router;
