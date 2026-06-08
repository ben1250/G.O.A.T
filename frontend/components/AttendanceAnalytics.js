'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AttendanceAnalytics({ departmentId }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/attendance/reports');
        const records = res.data;

        // Group by date
        const grouped = records.reduce((acc, record) => {
          const date = new Date(record.timestamp).toLocaleDateString();
          if (!acc[date]) acc[date] = { date, present: 0, absent: 0 };
          acc[date][record.status]++;
          return acc;
        }, {});

        setData(Object.values(grouped));

        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        setStats({ present, absent });
      } catch (err) {
        console.error('Analytics fetch failed');
      }
    };
    fetchAnalytics();
  }, [departmentId]);

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm h-80">
          <h3 className="font-bold mb-4 text-gray-700">Attendance Trends</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" />
              <Bar dataKey="absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm h-80 flex flex-col items-center">
          <h3 className="font-bold mb-4 text-gray-700">Overall Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
