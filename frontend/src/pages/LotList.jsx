import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TYPES = ['All', '2W', '4W', 'EV'];

export default function LotList() {
  const [lots, setLots]     = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/lots')
      .then(({ data }) => setLots(data))
      .catch(() => toast.error('Failed to load lots'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">All Parking Lots</h2>
      <p className="text-gray-500 text-sm mb-6">Choose a lot to view available slots</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === t
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t === 'All' ? 'All Types' : t === '2W' ? '2-Wheeler' : t === '4W' ? '4-Wheeler' : 'EV Charging'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lots.map((lot) => (
            <div key={lot.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex flex-col gap-3">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{lot.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{lot.address}</p>
                </div>
                <span className={`self-start text-xs font-semibold px-2 py-1 rounded-full ${
                  lot.available_slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {lot.available_slots}/{lot.total_slots} free
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>🕐 {lot.opening_time} – {lot.closing_time}</span>
                <span>📍 {lot.city}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <span className="font-bold text-[#1e3a5f]">₹{lot.price_per_hour} / hr</span>
                <button
                  onClick={() => navigate(`/lots/${lot.id}/slots`)}
                  disabled={lot.available_slots === 0}
                  className="bg-[#1e3a5f] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#2d5282] transition disabled:opacity-40"
                >
                  View Slots
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
