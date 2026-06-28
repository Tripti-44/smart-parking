import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_BADGE = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-600',
  expired:   'bg-gray-100 text-gray-500',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [revenue,  setRevenue]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [slotStats,setSlotStats]= useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/revenue?days=7'),
      api.get('/admin/bookings?limit=8'),
      api.get('/admin/slot-stats'),
    ])
      .then(([s, r, b, ss]) => {
        setStats(s.data);
        setRevenue(r.data);
        setBookings(b.data.bookings || []);
        setSlotStats(ss.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: `₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`,
      sub:   `₹${Number(stats?.today_revenue || 0).toLocaleString('en-IN')} today`,
      icon:  '₹',
      color: 'bg-green-50 text-green-600',
      border:'border-green-200',
    },
    {
      label: 'Total Bookings',
      value: stats?.total_bookings || 0,
      sub:   `${stats?.pending_bookings || 0} pending`,
      icon:  '📋',
      color: 'bg-blue-50 text-blue-600',
      border:'border-blue-200',
    },
    {
      label: 'Registered Users',
      value: stats?.total_users || 0,
      sub:   'active accounts',
      icon:  '👥',
      color: 'bg-purple-50 text-purple-600',
      border:'border-purple-200',
    },
    {
      label: 'Occupancy Rate',
      value: `${stats?.occupancy_percent || 0}%`,
      sub:   'slots currently booked',
      icon:  '🅿',
      color: 'bg-orange-50 text-orange-600',
      border:'border-orange-200',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/analytics')}
          className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          Full Analytics →
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className={`bg-white rounded-xl border ${k.border} shadow-sm p-5`}>
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-medium text-gray-500">{k.label}</p>
              <span className={`text-lg w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}>
                {k.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue line chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Revenue — Last 7 Days</h3>
            <button onClick={() => navigate('/admin/analytics')} className="text-xs text-blue-500 hover:underline">View all</button>
          </div>
          {revenue.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} width={55} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 4, fill: '#1e3a5f' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Slot occupancy bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Lot Occupancy</h3>
            <button onClick={() => navigate('/admin/manage-lots')} className="text-xs text-blue-500 hover:underline">Manage</button>
          </div>
          {slotStats.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No lots found</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={slotStats} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="lot_name" tick={{ fontSize: 10 }} width={120} tickFormatter={(v) => v.split(' ')[0]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Occupancy']} />
                <Bar dataKey="occupancy" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Slot status summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Slot Status by Lot</h3>
          <button onClick={() => navigate('/admin/manage-lots')} className="text-xs text-blue-500 hover:underline">Manage Slots</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                {['Lot Name', 'City', 'Total', 'Available', 'Booked', 'Maintenance', 'Occupancy'].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slotStats.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="py-3 pr-4 font-medium text-gray-800">{row.lot_name}</td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{row.city}</td>
                  <td className="py-3 pr-4 text-gray-700">{row.total_slots}</td>
                  <td className="py-3 pr-4">
                    <span className="text-green-600 font-semibold">{row.available}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-red-500 font-semibold">{row.booked}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-400">{row.maintenance}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${row.occupancy > 80 ? 'bg-red-400' : row.occupancy > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                          style={{ width: `${row.occupancy || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{row.occupancy || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Recent Bookings</h3>
          <button onClick={() => navigate('/admin/analytics')} className="text-xs text-blue-500 hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                {['ID', 'User', 'Lot', 'Slot', 'Duration', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const hrs = ((new Date(b.end_time) - new Date(b.start_time)) / 3600000).toFixed(1);
                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 text-gray-400 text-xs">#{b.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-800 text-xs">{b.user_name}</p>
                      <p className="text-gray-400 text-[10px]">{b.user_email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 text-xs max-w-[120px] truncate">{b.lot_name}</td>
                    <td className="py-3 pr-4 text-xs">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">{b.slot_number}</span>
                      <span className="text-gray-400 ml-1">{b.slot_type}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{hrs}h</td>
                    <td className="py-3 pr-4 font-semibold text-green-600 text-xs">₹{b.total_amount}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-300 text-sm">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
