'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LayoutDashboard, QrCode, MapPin, Plus, FileText, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AttendanceAnalytics from '@/components/AttendanceAnalytics';

export default function SupervisorDashboard() {
  const [cohorts, setCohorts] = useState([]);
  const [reports, setReports] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', cohort: '', lat: 0, lng: 0, radius: 100 });
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [cohortsRes, reportsRes] = await Promise.all([
        api.get('/cohorts'),
        api.get('/attendance/reports')
      ]);
      setCohorts(cohortsRes.data);
      setReports(reportsRes.data);
    };
    fetchData();
  }, []);

  const setLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setNewForm({ ...newForm, lat: position.coords.latitude, lng: position.coords.longitude });
      }, (err) => {
          alert('Location access denied');
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'supervisor_attendance.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/attendance', {
          title: newForm.title,
          cohort: newForm.cohort,
          location: { lat: newForm.lat, lng: newForm.lng, radius: newForm.radius }
      });
      setActiveForm(res.data);
      setShowFormModal(false);
    } catch (err) {
      alert('Failed to create form');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-emerald-900 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-8">Supervisor</h1>
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-2 p-2 bg-emerald-700 rounded"><LayoutDashboard size={20}/> <span>Dashboard</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-emerald-700 rounded"><Plus size={20}/> <span>New Form</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-emerald-700 rounded"><FileText size={20}/> <span>Attendance</span></a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Attendance Tracking</h2>
          <div className="space-x-2">
            <button onClick={() => setShowFormModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
              Create Attendance Form
            </button>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <Download size={20} className="inline mr-1"/> Export
            </button>
          </div>
        </header>

        {activeForm && (
            <div className="bg-white p-8 rounded shadow mb-8 flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-4">Active Form: {activeForm.title}</h3>
                <div className="p-4 bg-gray-100 rounded">
                    <QRCodeSVG value={`${window.location.origin}/attendance/${activeForm._id}`} size={256} />
                </div>
                <p className="mt-4 text-gray-600">Scan to mark attendance</p>
                <p className="text-sm text-blue-600 break-all">{window.location.origin}/attendance/{activeForm._id}</p>
            </div>
        )}

        <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">Performance Analytics</h3>
            <AttendanceAnalytics />
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Recent Submissions</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(record => (
                <tr key={record._id} className="border-b">
                  <td className="py-2">{record.participant?.name}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2">{new Date(record.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">New Attendance Form</h3>
                <form onSubmit={handleCreateForm} className="space-y-4">
                    <div>
                        <label className="block text-sm">Form Title</label>
                        <input type="text" className="w-full border p-2 rounded" value={newForm.title} onChange={e => setNewForm({...newForm, title: e.target.value})} required placeholder="Morning Attendance" />
                    </div>
                    <div>
                        <label className="block text-sm">Cohort</label>
                        <select className="w-full border p-2 rounded" value={newForm.cohort} onChange={e => setNewForm({...newForm, cohort: e.target.value})}>
                            <option value="">Select Cohort</option>
                            {cohorts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <label className="block text-sm">Location (Lat, Lng)</label>
                            <input type="text" readOnly className="w-full border p-2 rounded bg-gray-50" value={`${newForm.lat.toFixed(4)}, ${newForm.lng.toFixed(4)}`} />
                        </div>
                        <button type="button" onClick={setLocation} className="p-2 bg-blue-600 text-white rounded"><MapPin/></button>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Create Form</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
