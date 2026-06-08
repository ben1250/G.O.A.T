const ExcelJS = require('exceljs');

const exportAttendanceToExcel = async (records) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Reports');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Participant Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Department', key: 'dept', width: 20 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Reason', key: 'reason', width: 30 }
  ];

  records.forEach(record => {
    worksheet.addRow({
      date: record.timestamp.toLocaleDateString(),
      name: record.participant.name,
      email: record.participant.email,
      role: record.participant.role,
      dept: record.form.department.name || 'N/A',
      status: record.status,
      reason: record.reasonForAbsence || ''
    });
  });

  return workbook;
};

module.exports = { exportAttendanceToExcel };
