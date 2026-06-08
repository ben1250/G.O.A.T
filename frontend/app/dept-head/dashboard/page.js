'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LayoutDashboard, Users, PlusCircle, Download, FileBarChart } from 'lucide-react';

export default function DeptHeadDashboard() {
  const [cohorts, setCohorts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [reports, setReports] = useState([]);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [newCohort, setNewCohort] = useState({ name: '', startDate: '', endDate: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cohortsRes, participantsRes, reportsRes] = await Promise.all([
          api.get('/cohorts'),
          api.get('/cohorts/participants'),
          api.get('/attendance/reports')
        ]);
        setCohorts(cohortsRes.data);
        setParticipants(participantsRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data');
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/attendance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'department_attendance.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cohorts', newCohort);
      setCohorts([...cohorts, res.data]);
      setShowCohortModal(false);
    } catch (err) {
      alert('Failed to create cohort');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-slate-800 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-8">Dept Head</h1>
        <nav className="space-y-2">
          <a href="#" className="flex items-center space-x-2 p-2 bg-slate-700 rounded"><LayoutDashboard size={20}/> <span>Overview</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded"><PlusCircle size={20}/> <span>Cohorts</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded"><Users size={20}/> <span>Participants</span></a>
          <a href="#" className="flex items-center space-x-2 p-2 hover:bg-slate-700 rounded"><FileBarChart size={20}/> <span>Analytics</span></a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Department Management</h2>
          <div className="space-x-2">
            <button onClick={() => setShowCohortModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Create Cohort
            </button>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <Download size={20} className="inline mr-1"/> Export Data
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cohorts.map(cohort => (
                <div key={cohort._id} className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                    <h3 className="font-bold text-lg">{cohort.name}</h3>
                    <p className="text-gray-500">{new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}</p>
                    <p className="mt-2 font-semibold">Participants: {participants.filter(p => p.cohort?._id === cohort._id).length}</p>
                </div>
            ))}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Department Members</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Cohort</th>
                <th className="pb-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(member => (
                <tr key={member._id} className="border-b">
                  <td className="py-2">{member.name}</td>
                  <td className="py-2 capitalize">{member.role}</td>
                  <td className="py-2">{member.cohort?.name || 'N/A'}</td>
                  <td className="py-2">{member.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCohortModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Create New Cohort</h3>
                <form onSubmit={handleCreateCohort} className="space-y-4">
                    <input type="text" placeholder="Cohort Name" className="w-full border p-2 rounded" value={newCohort.name} onChange={e => setNewCohort({...newCohort, name: e.target.value})} required />
                    <div className="flex gap-2">
                        <input type="date" className="w-full border p-2 rounded" value={newCohort.startDate} onChange={e => setNewCohort({...newCohort, startDate: e.target.value})} />
                        <input type="date" className="w-full border p-2 rounded" value={newCohort.endDate} onChange={e => setNewCohort({...newCohort, endDate: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCohortModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
