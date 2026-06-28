import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../utils/api';

const socket = io('http://localhost:5000', { autoConnect: false });

export default function LiveMap() {
  const [lots, setLots]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/lots')
      .then(({ data }) => { setLots(data); if (data.length) setSelected(data[0]); })
      .catch(() => toast.error('Could not load lots'))
      .finally(() => setLoading(false));

    socket.connect();
    // When a slot status changes, refresh available count
    socket.on('slotUpdated', () => {
      api.get('/lots').then(({ data }) => setLots(data));
    });
    return () => { socket.off('slotUpdated'); socket.disconnect(); };
  }, []);

  const mapSrc = selected
    ? `https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}&z=16&output=embed`
    : null;

  if (loading) return <div className="p-6 text-center text-gray-400">Loading map...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Live Parking Map</h2>
          <p className="text-sm text-gray-500 mt-0.5">Click a lot below to see its location</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
          Live updates on
        </span>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left — lot cards */}
        <div className="w-72 flex-shrink-0 space-y-3 overflow-y-auto">
          {lots.map((lot) => (
            <div
              key={lot.id}
              onClick={() => setSelected(lot)}
              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                selected?.id === lot.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 text-sm leading-tight">{lot.name}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                  lot.available_slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {lot.available_slots > 0 ? `${lot.available_slots} free` : 'Full'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{lot.city}</p>

              {/* Mini slot bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${lot.total_slots ? (lot.available_slots / lot.total_slots) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{lot.available_slots}/{lot.total_slots} slots</span>
                <span>₹{lot.price_per_hour}/hr</span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/lots/${lot.id}/slots`); }}
                disabled={lot.available_slots === 0}
                className="mt-3 w-full bg-[#1e3a5f] text-white text-xs py-1.5 rounded-lg hover:bg-[#2d5282] transition disabled:opacity-40"
              >
                Book Slot
              </button>
            </div>
          ))}
        </div>

        {/* Right — Google Map */}
        <div className="flex-1 bg-gray-200 rounded-xl overflow-hidden min-h-[400px]">
          {mapSrc ? (
            <iframe
              title="parking-map"
              src={mapSrc}
              width="100%" height="100%"
              style={{ border: 0, minHeight: 400 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a lot to view on map
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
