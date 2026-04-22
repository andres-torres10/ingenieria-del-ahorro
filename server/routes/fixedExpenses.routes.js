const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const financeService = require('../services/finance.service');

const router = Router();

const fixedExpenseValidations = [
  body('category').trim().notEmpty().withMessage('La categoría es requerida'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida'),
  body('amount').isFloat({ gt: 0 }).withMessage('El monto debe ser mayor a 0'),
  body('due_date').trim().notEmpty().withMessage('La fecha de vencimiento es requerida'),
];

function formatErrors(errors) {
  return errors.array().map(e => ({ field: e.path, message: e.msg }));
}

// GET /api/fixed-expenses?year=&month=
router.get('/', verifyJWT, (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || (now.getMonth() + 1);
  try {
    const expenses = financeService.getFixedExpenses(req.userId, year, month);
    return res.status(200).json(expenses);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/fixed-expenses
router.post('/', verifyJWT, fixedExpenseValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { category, description, amount, due_date } = req.body;
    const d = new Date(due_date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const expense = financeService.createFixedExpense(req.userId, { category, description, amount, due_date, month, year });
    return res.status(201).json(expense);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/fixed-expenses/:id
router.put('/:id', verifyJWT, fixedExpenseValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { category, description, amount, due_date } = req.body;
    const d = new Date(due_date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const expense = financeService.updateFixedExpense(req.params.id, req.userId, { category, description, amount, due_date, month, year });
    if (!expense) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(200).json(expense);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/fixed-expenses/:id
router.delete('/:id', verifyJWT, (req, res) => {
  try {
    const deleted = financeService.deleteFixedExpense(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
