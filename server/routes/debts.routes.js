const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const financeService = require('../services/finance.service');

const router = Router();

const debtValidations = [
  body('creditor_name').trim().notEmpty().withMessage('El nombre del acreedor es requerido'),
  body('principal').isFloat({ gt: 0 }).withMessage('El capital debe ser mayor a 0'),
  body('monthly_rate').isFloat({ gt: 0, max: 100 }).withMessage('La tasa mensual debe estar entre 0 y 100'),
  body('term_months').isInt({ min: 1 }).withMessage('El plazo debe ser al menos 1 mes'),
  body('pending_balance').isFloat({ min: 0 }).withMessage('El saldo pendiente debe ser mayor o igual a 0'),
];

function formatErrors(errors) {
  return errors.array().map(e => ({ field: e.path, message: e.msg }));
}

// GET /api/debts
router.get('/', verifyJWT, (req, res) => {
  try {
    const debts = financeService.getDebts(req.userId);
    return res.status(200).json(debts);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/debts
router.post('/', verifyJWT, debtValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { creditor_name, principal, monthly_rate, term_months, pending_balance } = req.body;
    const debt = financeService.createDebt(req.userId, { creditor_name, principal, monthly_rate, term_months, pending_balance });
    return res.status(201).json(debt);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/debts/:id
router.put('/:id', verifyJWT, debtValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: formatErrors(errors) });
  }
  try {
    const { creditor_name, principal, monthly_rate, term_months, pending_balance } = req.body;
    const debt = financeService.updateDebt(req.params.id, req.userId, { creditor_name, principal, monthly_rate, term_months, pending_balance });
    if (!debt) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(200).json(debt);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/debts/:id
router.delete('/:id', verifyJWT, (req, res) => {
  try {
    const deleted = financeService.deleteDebt(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Recurso no encontrado' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
