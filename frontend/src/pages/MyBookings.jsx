import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TABS = ['upcoming', 'completed', 'cancelled'];

const STATUS_BADGE = {
  confirmed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  completed:  'bg-blue-100 text-blue-700',
  cancelled:  'bg-red-100 text-red-600',
  expired:    'bg-gray-100 text-gray-600',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab]           = useState('upcoming');
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled. Refund initiated.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const filtered = bookings.filter((b) => {
    if (tab === 'upcoming')   return ['confirmed', 'pending'].includes(b.status);
    if (tab === 'completed')  return b.status === 'completed';
    if (tab === 'cancelled')  return ['cancelled', 'expired'].includes(b.status);
    return true;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">My Bookings</h2>
      <p className="text-gray-500 text-sm mb-6">All your parking reservations</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400 text-lg">No {tab} bookings</p>
          <button onClick={() => navigate('/lots')} className="mt-4 text-blue-600 text-sm hover:underline">
            Find a parking lot →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{b.slot?.lot?.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{b.slot?.lot?.city}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 mb-4">
                <div><p className="text-gray-400">Slot</p><p className="font-medium text-gray-700">{b.slot?.slot_number} ({b.slot?.type})</p></div>
                <div><p className="text-gray-400">Date</p><p className="font-medium text-gray-700">{new Date(b.start_time).toLocaleDateString('en-IN')}</p></div>
                <div><p className="text-gray-400">Time</p><p className="font-medium text-gray-700">{new Date(b.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div>
                <div><p className="text-gray-400">Amount</p><p className="font-medium text-green-600">₹{b.total_amount}</p></div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {['confirmed', 'pending'].includes(b.status) && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="text-xs px-4 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition"
                  >
                    Cancel Booking
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${b.slot?.lot?.latitude},${b.slot?.lot?.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs px-4 py-1.5 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#2d5282] transition"
                  >
                    Navigate 📍
                  </a>
                )}
                {['completed', 'cancelled'].includes(b.status) && (
                  <button
                    onClick={() => navigate('/lots')}
                    className="text-xs px-4 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                  >
                    Book Again
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
