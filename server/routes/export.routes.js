const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const { generateCSV } = require('../services/export.service');

const router = Router();

// GET /api/export/csv
router.get('/csv', verifyJWT, (req, res) => {
  try {
    const csv = generateCSV(req.userId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ingenieria-del-ahorro.csv"');
    return res.status(200).send('\uFEFF' + csv); // BOM for Excel
  } catch (err) {
    return res.status(500).json({ error: 'Error al generar el CSV' });
  }
});

module.exports = router;
