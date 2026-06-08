const mongoose = require('mongoose');

const attendanceFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    radius: { type: Number, default: 100 } // meters
  },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceForm', attendanceFormSchema);
