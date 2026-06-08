'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LayoutDashboard, Users, FileText, Download, PieChart } from 'lucide-react';
import AttendanceAnalytics from '@/components/AttendanceAnalytics';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [reportsRes, deptsRes] = await Promise.all([
        api.get('/attendance/reports'),
        api.get('/departments')
      ]);
      setReports(reportsRes.data);
      setDepartments(deptsRes.data);
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-indigo-900 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-2 p-2 bg-indigo-700 rounded"><LayoutDashboard size={20}/> <span>Dashboard</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-indigo-700 rounded"><Users size={20}/> <span>Departments</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-indigo-700 rounded"><FileText size={20}/> <span>Reports</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-indigo-700 rounded"><PieChart size={20}/> <span>Analytics</span></a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold">Global Overview</h2>
          <button onClick={handleExport} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            <Download size={20}/> <span>Export All Data</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 uppercase text-sm">Total Departments</h3>
            <p className="text-3xl font-bold">{departments.length}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 uppercase text-sm">Total Participants</h3>
            <p className="text-3xl font-bold">{new Set(reports.map(r => r.participant?._id)).size}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500 uppercase text-sm">Attendance Records</h3>
            <p className="text-3xl font-bold">{reports.length}</p>
          </div>
        </div>

        <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Analytics</h3>
            <AttendanceAnalytics />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Recent Attendance</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map(record => (
                <tr key={record._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{record.participant?.name}</td>
                  <td className="py-2">{record.form?.department?.name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2">{new Date(record.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
