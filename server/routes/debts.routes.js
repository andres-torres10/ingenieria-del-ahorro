const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyJWT } = require('../middleware/auth.middleware');
const svc = require('../services/finance.service');

const router = Router();
const validations = [
  body('creditor_name').trim().notEmpty().withMessage('Nombre del acreedor requerido'),
  body('principal').isFloat({ gt: 0 }).withMessage('Capital debe ser mayor a 0'),
  body('monthly_rate').isFloat({ gt: 0, max: 100 }).withMessage('Tasa mensual debe estar entre 0 y 100'),
  body('term_months').isInt({ min: 1 }).withMessage('Plazo debe ser al menos 1 mes'),
  body('pending_balance').isFloat({ min: 0 }).withMessage('Saldo pendiente debe ser >= 0'),
];
const fmt = e => e.array().map(x => ({ field: x.path, message: x.msg }));

router.get('/', verifyJWT, async (req, res) => {
  try { res.json(await svc.getDebts(req.userId)); }
  catch { res.status(500).json({ error: 'Error interno' }); }
});

router.post('/', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { creditor_name, principal, monthly_rate, term_months, pending_balance } = req.body;
    res.status(201).json(await svc.createDebt(req.userId, { creditor_name, principal: +principal, monthly_rate: +monthly_rate, term_months: +term_months, pending_balance: +pending_balance }));
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.put('/:id', verifyJWT, validations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: fmt(errors) });
  try {
    const { creditor_name, principal, monthly_rate, term_months, pending_balance } = req.body;
    const debt = await svc.updateDebt(req.params.id, req.userId, { creditor_name, principal: +principal, monthly_rate: +monthly_rate, term_months: +term_months, pending_balance: +pending_balance });
    if (!debt) return res.status(404).json({ error: 'No encontrado' });
    res.json(debt);
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

router.delete('/:id', verifyJWT, async (req, res) => {
  try {
    const ok = await svc.deleteDebt(req.params.id, req.userId);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error interno' }); }
});

module.exports = router;
