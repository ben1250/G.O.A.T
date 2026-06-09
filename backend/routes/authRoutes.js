const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

router.post('/register', auth, authorize('ADMIN', 'DEPT_HEAD'), register);
router.post('/login', login);
router.get('/me', auth, getMe);

module.exports = router;
