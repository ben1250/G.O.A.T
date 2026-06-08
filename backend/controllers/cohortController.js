const Cohort = require('../models/Cohort');
const Participant = require('../models/Participant');

exports.createCohort = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const department = req.user.department; // From auth middleware
    if (!department) return res.status(400).json({ message: 'User has no department assigned' });

    const cohort = new Cohort({ name, department, startDate, endDate });
    await cohort.save();
    res.status(201).json(cohort);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCohorts = async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' ? {} : { department: req.user.department };
    const cohorts = await Cohort.find(query).populate('department');
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getParticipants = async (req, res) => {
    try {
        const query = req.user.role === 'ADMIN' ? {} : { department: req.user.department };
        const participants = await Participant.find(query).populate('department cohort');
        res.json(participants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
