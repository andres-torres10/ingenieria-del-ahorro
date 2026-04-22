const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const financeService = require('../services/finance.service');

const router = Router();

const FREQUENCY_ENUM = ['unica', 'semanal', 'quincenal', 'mensual'];
const CATEGORY_ENUM = ['Salario', 'Freelance', 'Negocio', 'Arriendo', 'Otro'];

const incomeValidations = [
  body('source_name').trim().notEmpty().withMessage('El nombre de la fuente es requerido'),
  body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
  body('frequency').isIn(FREQUENCY_ENUM).withMessage(`La frecuencia debe ser una de: ${FREQUENCY_ENUM.join(', ')}`),
  body('category').isIn(CATEGORY_ENUM).withMessage(`La categoría debe ser una de: ${CATEGORY_ENUM.join(', ')}`),
  body('date').trim().notEmpty().withMessage('La fecha es requerida'),
];

function formatErrors(errors) {
  return errors.array().map(e => ({ field: e.path, message: e.msg }));
}

// GET /api/incomes?year=&month=
router.get('/', verifyJWT, (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || (now.getMonth() + 1);
  try {
    const incomes = financeService.getIncomes(req.userId, year, month);
    return res.status(200).json(incomes);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/incomes
router.post('/', verifyJWT, incomeValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { source_name, amount, frequency, category, date } = req.body;
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const income = financeService.createIncome(req.userId, { source_name, amount, frequency, category, date, month, year });
    return res.status(201).json(income);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/incomes/:id
router.put('/:id', verifyJWT, incomeValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { source_name, amount, frequency, category, date } = req.body;
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const income = financeService.updateIncome(req.params.id, req.userId, { source_name, amount, frequency, category, date, month, year });
    if (!income) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(200).json(income);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/incomes/:id
router.delete('/:id', verifyJWT, (req, res) => {
  try {
    const deleted = financeService.deleteIncome(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
