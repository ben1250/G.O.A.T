const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceForm', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  reasonForAbsence: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
