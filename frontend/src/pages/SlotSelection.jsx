import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../utils/api';

const socket = io('http://localhost:5000', { autoConnect: false });

const STATUS_CLASS = {
  available:   'slot-available',
  booked:      'slot-booked',
  selected:    'slot-selected',
  maintenance: 'slot-maintenance',
};

export default function SlotSelection() {
  const { lotId }   = useParams();
  const navigate    = useNavigate();
  const [lot, setLot]         = useState(null);
  const [slots, setSlots]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [startTime, setStartTime]   = useState('');
  const [endTime, setEndTime]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/lots/${lotId}`), api.get(`/slots/lot/${lotId}`)])
      .then(([lotRes, slotRes]) => {
        setLot(lotRes.data);
        setSlots(slotRes.data);
      })
      .catch(() => toast.error('Failed to load lot details'))
      .finally(() => setLoading(false));

    socket.connect();
    socket.on('slotUpdated', ({ slotId, status }) => {
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, status } : s))
      );
      if (selected?.id === slotId && status !== 'available') {
        toast.error('Your selected slot was just booked by someone else!');
        setSelected(null);
      }
    });

    return () => { socket.off('slotUpdated'); socket.disconnect(); };
  }, [lotId]);

  const handleSlotClick = (slot) => {
    if (slot.status !== 'available') return;
    setSelected((prev) => (prev?.id === slot.id ? null : slot));
  };

  const calcAmount = () => {
    if (!startTime || !endTime || !selected) return 0;
    const hrs = (new Date(endTime) - new Date(startTime)) / 3600000;
    return hrs > 0 ? (hrs * selected.price_per_hour).toFixed(2) : 0;
  };

  const handleBook = async () => {
    if (!selected)    return toast.error('Please select a slot');
    if (!startTime)   return toast.error('Please select start time');
    if (!endTime)     return toast.error('Please select end time');
    if (new Date(endTime) <= new Date(startTime))
      return toast.error('End time must be after start time');

    setBooking(true);
    try {
      const { data } = await api.post('/bookings', {
        slot_id: selected.id,
        start_time: startTime,
        end_time: endTime,
      });
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${data.booking.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const displayed = typeFilter === 'All' ? slots : slots.filter((s) => s.type === typeFilter);

  if (loading) return <div className="p-6 text-center text-gray-400">Loading slots...</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{lot?.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{lot?.address}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
          Live
        </span>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-5">
        {['All', '2W', '4W', 'EV'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              typeFilter === t ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Slot grid */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="grid grid-cols-8 gap-2 mb-4">
              {displayed.map((slot) => {
                const isSelected = selected?.id === slot.id;
                const cls = isSelected ? STATUS_CLASS.selected : STATUS_CLASS[slot.status];
                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    title={`${slot.slot_number} (${slot.type}) — ${slot.status}`}
                    className={`${cls} rounded-md h-10 flex items-center justify-center text-xs font-semibold text-white`}
                  >
                    {slot.slot_number}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
              {[
                { cls: 'bg-green-400',  label: 'Available' },
                { cls: 'bg-red-400',    label: 'Booked' },
                { cls: 'bg-yellow-400', label: 'Selected' },
                { cls: 'bg-gray-400',   label: 'Maintenance' },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`w-3 h-3 rounded ${l.cls} inline-block`}></span>
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <div className="w-full lg:w-72">
          <div className="bg-white rounded-xl shadow p-5 sticky top-6">
            <h3 className="font-semibold text-gray-700 mb-4">Booking Summary</h3>

            {selected ? (
              <div className="text-sm text-gray-600 space-y-2 mb-4">
                <div className="flex justify-between"><span>Slot</span><span className="font-semibold">{selected.slot_number}</span></div>
                <div className="flex justify-between"><span>Type</span><span>{selected.type}</span></div>
                <div className="flex justify-between"><span>Rate</span><span>₹{selected.price_per_hour}/hr</span></div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">Click a green slot to select it</p>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                <input
                  type="datetime-local" value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Time</label>
                <input
                  type="datetime-local" value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime || new Date().toISOString().slice(0, 16)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {calcAmount() > 0 && (
              <div className="flex justify-between text-sm font-semibold text-gray-800 border-t pt-3 mb-4">
                <span>Total Amount</span>
                <span className="text-green-600">₹{calcAmount()}</span>
              </div>
            )}

            <button
              onClick={handleBook} disabled={booking || !selected}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-40"
            >
              {booking ? 'Booking...' : 'Proceed to Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
