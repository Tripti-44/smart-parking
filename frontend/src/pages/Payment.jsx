import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const [booking, setBooking]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data))
      .catch(() => toast.error('Could not load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data: order } = await api.post('/payments/create-order', { booking_id: bookingId });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || order.key,
        amount:      order.amount,
        currency:    order.currency,
        name:        'SmartPark',
        description: `Booking #${bookingId}`,
        order_id:    order.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              booking_id:          bookingId,
            });
            toast.success('Payment successful!');
            navigate(`/confirmation/${bookingId}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#1e3a5f' },
        modal: { ondismiss: () => { setPaying(false); toast('Payment cancelled'); } },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setPaying(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Loading booking details...</div>;
  if (!booking) return <div className="p-6 text-center text-red-400">Booking not found</div>;

  const gst     = (booking.total_amount * 0.18).toFixed(2);
  const total   = (parseFloat(booking.total_amount) + parseFloat(gst)).toFixed(2);
  const hours   = ((new Date(booking.end_time) - new Date(booking.start_time)) / 3600000).toFixed(1);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4">← Back</button>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h2>

      {/* Order summary */}
      <div className="bg-white rounded-xl shadow p-5 mb-5">
        <h3 className="font-semibold text-gray-700 mb-4 pb-3 border-b">Order Summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between"><span>Lot</span><span className="font-medium">{booking.slot?.lot?.name}</span></div>
          <div className="flex justify-between"><span>Slot</span><span className="font-medium">{booking.slot?.slot_number} ({booking.slot?.type})</span></div>
          <div className="flex justify-between"><span>Date</span><span>{new Date(booking.start_time).toLocaleDateString('en-IN')}</span></div>
          <div className="flex justify-between"><span>Time</span>
            <span>{new Date(booking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {new Date(booking.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between"><span>Duration</span><span>{hours} hrs</span></div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Base amount</span><span>₹{booking.total_amount}</span></div>
          <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{gst}</span></div>
          <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t"><span>Total</span><span className="text-green-600">₹{total}</span></div>
        </div>
      </div>

      {/* Pay button */}
      <button
        onClick={handlePay} disabled={paying}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl text-base transition disabled:opacity-60"
      >
        {paying ? 'Opening payment...' : `Pay ₹${total} via Razorpay`}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        🔒 Secured by Razorpay — UPI, Cards, Net Banking accepted
      </p>
    </div>
  );
}
