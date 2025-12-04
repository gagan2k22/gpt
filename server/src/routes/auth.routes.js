const express = require('express');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter.middleware');
const { validateEmail, validatePassword } = require('../middleware/validation.middleware');

router.post('/register', registerLimiter, validateEmail, validatePassword, register);
router.post('/login', loginLimiter, validateEmail, login);

module.exports = router;
