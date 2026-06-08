const express = require('express');
const router = express.Router();
const { createForm, getForm, submitAttendance, getReports, checkParticipant, downloadReport } = require('../controllers/attendanceController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('DEPT_HEAD', 'SUPERVISOR'), createForm);
router.get('/reports', auth, getReports);
router.get('/export', auth, downloadReport);
router.get('/check', checkParticipant);
router.get('/:id', getForm);
router.post('/:id/submit', submitAttendance);

module.exports = router;
