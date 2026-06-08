const express = require('express');
const router = express.Router();
const { createCohort, getCohorts, getParticipants } = require('../controllers/cohortController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('ADMIN', 'DEPT_HEAD'), createCohort);
router.get('/', auth, getCohorts);
router.get('/participants', auth, getParticipants);

module.exports = router;
