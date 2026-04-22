const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const svc = require('../services/finance.service');

const router = Router();
const validations = [
  body('description').trim().notEmpty().withMessage('Descripción requerida'),
  body('category').trim().notEmpty().withMessage('Categoría requerida'),
  body('unit_cost').isFloat({ gt: 0 }).withMessage('Costo unitario debe ser mayor a 0'),
  body('times_per_month').isFloat({ gt: 0 }).withMessage('Veces por mes debe ser mayor a 0'),
];
const fmt = e => e.array().map(x => ({ field: x.path, message: x.msg }));

router.get('/', verifyJWT, async (req, res) => {
  try { res.json(await svc.getAntExpenses(req.userId)); }
  catch { res.status(500).json({ error: 'Error interno' }); }
});

router.post('/', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { description, category, unit_cost, times_per_month } = req.body;
    res.status(201).json(await svc.createAntExpense(req.userId, { description, category, unit_cost: +unit_cost, times_per_month: +times_per_month }));
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.put('/:id', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { description, category, unit_cost, times_per_month } = req.body;
    const exp = await svc.updateAntExpense(req.params.id, req.userId, { description, category, unit_cost: +unit_cost, times_per_month: +times_per_month });
    if (!exp) return res.status(404).json({ error: 'No encontrado' });
    res.json(exp);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const ok = await svc.deleteAntExpense(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

module.exports = router;
