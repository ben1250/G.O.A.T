'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { CheckCircle, XCircle, MapPin, Send } from 'lucide-react';

export default function AttendancePage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Registration data
  const [regData, setRegData] = useState({ name: '', role: 'intern', phone: '' });
  // Attendance data
  const [status, setStatus] = useState('present');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.get(`/attendance/${id}`);
        setForm(res.data);
      } catch (err) {
        setError('Attendance form not found or inactive');
      }
    };
    fetchForm();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Location access denied')
      );
    }
  }, [id]);

  const checkEmail = async () => {
    setChecking(true);
    try {
      const res = await api.get(`/attendance/check?email=${email}`);
      if (res.data.exists) {
        setParticipant(res.data.participant);
      } else {
        setParticipant('new');
      }
    } catch (err) {
      setError('Error checking email');
    }
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        email,
        status,
        reasonForAbsence: status === 'absent' ? reason : undefined,
        location,
        ...(participant === 'new' ? regData : {})
      };
      await api.post(`/attendance/${id}/submit`, payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Attendance Recorded!</h2>
          <p className="text-gray-600 mt-2">Thank you for checking in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{form?.title || 'Loading...'}</h1>
          <p className="text-blue-100">{form?.department?.name}</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {!participant ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Enter your email to start</label>
              <input
                type="email"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <button
                onClick={checkEmail}
                disabled={!email || checking}
                className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center"
              >
                {checking ? 'Checking...' : 'Next'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {participant === 'new' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-semibold text-gray-800">First time? Please register:</h3>
                  <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} required />
                  <select className="w-full p-3 border rounded-xl" value={regData.role} onChange={e => setRegData({...regData, role: e.target.value})}>
                    <option value="intern">Intern</option>
                    <option value="attachee">Attachee</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                  <input type="tel" placeholder="Phone Number" className="w-full p-3 border rounded-xl" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="font-semibold text-blue-800">Welcome back, {participant.name}!</p>
                  <p className="text-sm text-blue-600">Please mark your status for today.</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStatus('present')}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${status === 'present' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                >
                  <CheckCircle />
                  <span className="font-bold">Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('absent')}
                  className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${status === 'absent' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
                >
                  <XCircle />
                  <span className="font-bold">Absent</span>
                </button>
              </div>

              {status === 'absent' && (
                <textarea
                  className="w-full p-3 border rounded-xl"
                  placeholder="Reason for absence..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} />
                {location ? 'Location detected' : 'Detecting location...'}
              </div>

              <button
                type="submit"
                disabled={loading || (status === 'present' && !location)}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : <>Submit <Send size={20}/></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
