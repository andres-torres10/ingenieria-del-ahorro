const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const financeService = require('../services/finance.service');

const router = Router();

const antExpenseValidations = [
  body('description').trim().notEmpty().withMessage('La descripción es requerida'),
  body('category').trim().notEmpty().withMessage('La categoría es requerida'),
  body('unit_cost').isFloat({ gt: 0 }).withMessage('El costo unitario debe ser mayor a 0'),
  body('times_per_month').isFloat({ gt: 0 }).withMessage('Las veces por mes deben ser mayor a 0'),
];

function formatErrors(errors) {
  return errors.array().map(e => ({ field: e.path, message: e.msg }));
}

// GET /api/ant-expenses
router.get('/', verifyJWT, (req, res) => {
  try {
    const expenses = financeService.getAntExpenses(req.userId);
    return res.status(200).json(expenses);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/ant-expenses
router.post('/', verifyJWT, antExpenseValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { description, category, unit_cost, times_per_month } = req.body;
    const expense = financeService.createAntExpense(req.userId, { description, category, unit_cost, times_per_month });
    return res.status(201).json(expense);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/ant-expenses/:id
router.put('/:id', verifyJWT, antExpenseValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { description, category, unit_cost, times_per_month } = req.body;
    const expense = financeService.updateAntExpense(req.params.id, req.userId, { description, category, unit_cost, times_per_month });
    if (!expense) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(200).json(expense);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/ant-expenses/:id
router.delete('/:id', verifyJWT, (req, res) => {
  try {
    const deleted = financeService.deleteAntExpense(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
