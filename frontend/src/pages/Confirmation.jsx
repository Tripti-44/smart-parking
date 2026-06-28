import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data))
      .catch(() => toast.error('Could not load confirmation'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>;
  if (!booking) return <div className="p-6 text-center text-red-400">Booking not found</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
        <p className="text-gray-500 text-sm mt-1">Your parking slot is reserved</p>
      </div>

      {/* Booking details */}
      <div className="bg-white rounded-xl shadow p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-4 pb-3 border-b">Booking Details</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Booking ID',  value: `#${booking.id}` },
            { label: 'Slot',        value: `${booking.slot?.slot_number} (${booking.slot?.type})` },
            { label: 'Parking Lot', value: booking.slot?.lot?.name },
            { label: 'Address',     value: booking.slot?.lot?.address },
            { label: 'Date',        value: new Date(booking.start_time).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Time',        value: `${new Date(booking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${new Date(booking.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` },
            { label: 'Amount Paid', value: `₹${booking.total_amount}` },
            { label: 'Status',      value: booking.status },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-gray-800 text-right max-w-xs">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code */}
      {booking.qr_code && (
        <div className="bg-white rounded-xl shadow p-5 mb-5 text-center">
          <p className="text-sm font-medium text-gray-600 mb-3">Scan at parking entry gate</p>
          <img src={booking.qr_code} alt="QR Code" className="w-40 h-40 mx-auto rounded-lg border" />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${booking.slot?.lot?.latitude},${booking.slot?.lot?.longitude}`}
          target="_blank" rel="noreferrer"
          className="w-full bg-[#1e3a5f] text-white text-center font-semibold py-3 rounded-xl hover:bg-[#2d5282] transition"
        >
          Navigate to Parking 📍
        </a>
        <button
          onClick={() => navigate('/my-bookings')}
          className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
}
