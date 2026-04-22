const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const svc = require('../services/finance.service');

const router = Router();
const FREQUENCY = ['unica','semanal','quincenal','mensual'];
const CATEGORY = ['Salario','Freelance','Negocio','Arriendo','Otro'];

const validations = [
  body('source_name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
  body('frequency').isIn(FREQUENCY).withMessage('Frecuencia inválida'),
  body('category').isIn(CATEGORY).withMessage('Categoría inválida'),
  body('date').trim().notEmpty().withMessage('La fecha es requerida'),
];

const fmt = e => e.array().map(x => ({ field: x.path, message: x.msg }));

router.get('/', verifyJWT, async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth() + 1;
  try { res.json(await svc.getIncomes(req.userId, year, month)); }
  catch { res.status(500).json({ error: 'Error interno' }); }
});

router.post('/', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { source_name, amount, frequency, category, date } = req.body;
    const d = new Date(date);
    const income = await svc.createIncome(req.userId, { source_name, amount: +amount, frequency, category, date, month: d.getMonth() + 1, year: d.getFullYear() });
    res.status(201).json(income);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.put('/:id', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { source_name, amount, frequency, category, date } = req.body;
    const d = new Date(date);
    const income = await svc.updateIncome(req.params.id, req.userId, { source_name, amount: +amount, frequency, category, date, month: d.getMonth() + 1, year: d.getFullYear() });
    if (!income) return res.status(404).json({ error: 'No encontrado' });
    res.json(income);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const ok = await svc.deleteIncome(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

module.exports = router;
