import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Home() {
  const { user }          = useSelector((s) => s.auth);
  const [lots, setLots]   = useState([]);
  const [city, setCity]   = useState('');
  const [loading, setLoading] = useState(true);
  const navigate          = useNavigate();

  const fetchLots = async (c = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/lots', { params: c ? { city: c } : {} });
      setLots(data);
    } catch {
      toast.error('Could not load parking lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLots(); }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Find and book your parking spot instantly</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Search by city</p>
        <div className="flex gap-3">
          <input
            value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Delhi, Bangalore"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchLots(city)}
            className="bg-[#1e3a5f] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2d5282] transition"
          >
            Search
          </button>
          <button
            onClick={() => { setCity(''); fetchLots(); }}
            className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Lots',       value: lots.length },
          { label: 'Available Slots',  value: lots.reduce((a, l) => a + (l.available_slots || 0), 0) },
          { label: 'Cities Covered',   value: [...new Set(lots.map((l) => l.city))].length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-[#1e3a5f]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lots grid */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Available Parking Lots</h3>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading lots...</div>
      ) : lots.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No lots found for "{city}"</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lots.map((lot) => (
            <div key={lot.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{lot.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{lot.city}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  lot.available_slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {lot.available_slots > 0 ? `${lot.available_slots} free` : 'Full'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-1">{lot.address}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#1e3a5f]">₹{lot.price_per_hour}/hr</span>
                <button
                  onClick={() => navigate(`/lots/${lot.id}/slots`)}
                  disabled={lot.available_slots === 0}
                  className="bg-[#1e3a5f] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#2d5282] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
