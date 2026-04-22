const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const { generateCSV } = require('../services/export.service');

const router = Router();

router.get('/csv', verifyJWT, async (req, res) => {
  try {
    const csv = await generateCSV(req.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ingenieria-del-ahorro.csv"');
    res.status(200).send('\uFEFF' + csv);
  } catch { res.status(500).json({ error: 'Error al generar CSV' }); }
});

module.exports = router;
