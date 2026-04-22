const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/auth.service');

const router = Router();

// POST /auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El correo no es válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    }

    try {
      const { name, email, password } = req.body;
      const result = await authService.registerUser(name, email, password);
      return res.status(201).json(result);
    } catch (err) {
      if (err.status === 409) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('El correo es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    }

    try {
      const { email, password } = req.body;
      const result = await authService.loginUser(email, password);
      return res.status(200).json(result);
    } catch (err) {
      if (err.status === 401) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

module.exports = router;
