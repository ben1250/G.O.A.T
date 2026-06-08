const AttendanceForm = require('../models/AttendanceForm');
const AttendanceRecord = require('../models/AttendanceRecord');
const Participant = require('../models/Participant');
const { exportAttendanceToExcel } = require('../utils/exportData');

exports.createForm = async (req, res) => {
  try {
    const { title, cohort, location, expiresAt } = req.body;
    const form = new AttendanceForm({
      title,
      department: req.user.department,
      cohort,
      createdBy: req.user.id,
      location,
      expiresAt
    });
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getForm = async (req, res) => {
    try {
        const form = await AttendanceForm.findById(req.params.id).populate('department cohort');
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.submitAttendance = async (req, res) => {
  try {
    const { email, name, role, phone, status, reasonForAbsence, location, cohort } = req.body;
    const formId = req.params.id;
    const form = await AttendanceForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Location check (geofencing)
    if (status === 'present' && location && form.location) {
        const distance = getDistance(location.lat, location.lng, form.location.lat, form.location.lng);
        if (distance > form.location.radius) {
            return res.status(403).json({ message: 'You are outside the allowed location range' });
        }
    }

    let participant = await Participant.findOne({ email });
    if (!participant) {
        if (!name || !role) return res.status(400).json({ message: 'Participant not found, please provide full details' });
        participant = new Participant({ name, email, role, phone, department: form.department, cohort: cohort || form.cohort });
        await participant.save();
    }

    const record = new AttendanceRecord({
      form: formId,
      participant: participant._id,
      status,
      reasonForAbsence,
      location
    });
    await record.save();
    res.status(201).json({ message: 'Attendance recorded successfully', participant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
    try {
        const query = req.user.role === 'ADMIN' ? {} : { department: req.user.department };
        // Aggregation for reports...
        const records = await AttendanceRecord.find().populate({
            path: 'form',
            match: query
        }).populate('participant');

        const filteredRecords = records.filter(r => r.form !== null);
        res.json(filteredRecords);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.checkParticipant = async (req, res) => {
    try {
        const { email } = req.query;
        const participant = await Participant.findOne({ email });
        res.json({ exists: !!participant, participant });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.downloadReport = async (req, res) => {
    try {
        const query = req.user.role === 'ADMIN' ? {} : { department: req.user.department };
        const records = await AttendanceRecord.find().populate({
            path: 'form',
            match: query,
            populate: { path: 'department' }
        }).populate('participant');

        const filteredRecords = records.filter(r => r.form !== null);
        const workbook = await exportAttendanceToExcel(filteredRecords);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Haversine formula for distance
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
