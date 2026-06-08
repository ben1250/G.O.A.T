const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments, getDepartment } = require('../controllers/deptController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('ADMIN'), createDepartment);
router.get('/', getDepartments); // Public or restricted? User mentioned login page selection.
router.get('/:id', auth, getDepartment);

module.exports = router;
