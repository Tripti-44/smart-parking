import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_STYLES = {
  paid:     'bg-green-100 text-green-700',
  refunded: 'bg-blue-100 text-blue-700',
  failed:   'bg-red-100 text-red-600',
  pending:  'bg-yellow-100 text-yellow-700',
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/payments/my')
      .then(({ data }) => setPayments(data))
      .catch(() => toast.error('Could not load payment history'))
      .finally(() => setLoading(false));
  }, []);

  const total = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment History</h2>
      <p className="text-gray-500 text-sm mb-6">All your transactions on SmartPark</p>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Transactions', value: payments.length,                                    color: 'text-gray-800' },
          { label: 'Total Paid',         value: `₹${total.toLocaleString('en-IN')}`,                color: 'text-green-600' },
          { label: 'Refunds',            value: payments.filter((p) => p.status === 'refunded').length, color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-gray-400">No payment records yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Payment ID', 'Booking', 'Lot', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-gray-500 text-xs font-mono">
                    {p.razorpay_payment_id || `PAY-${p.id}`}
                  </td>
                  <td className="px-5 py-4 text-gray-700">#{p.booking_id}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-[160px] truncate">
                    {p.booking?.slot?.lot?.name || '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-800">₹{p.amount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
