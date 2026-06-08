'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13+ App Router uses next/navigation
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SUPERVISOR');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments');
      }
    };
    fetchDepts();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
        department: role === 'SUPERVISOR' ? selectedDept : undefined
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      const userRole = res.data.user.role;
      if (userRole === 'ADMIN') router.push('/admin/dashboard');
      else if (userRole === 'DEPT_HEAD') router.push('/dept-head/dashboard');
      else router.push('/supervisor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-3xl font-bold text-center">Attendance System Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="w-full px-3 py-2 mt-1 border rounded-md"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="SUPERVISOR">Supervisor</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {role === 'SUPERVISOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Working Department</label>
              <select
                className="w-full px-3 py-2 mt-1 border rounded-md"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
