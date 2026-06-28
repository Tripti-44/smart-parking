import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PIE_COLORS  = ['#1e3a5f', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
const LOT_COLORS  = ['#1e3a5f', '#2d5282', '#3b6cb7', '#5a8fd6', '#85b7eb'];

export default function Analytics() {
  const [revenue,    setRevenue]    = useState([]);
  const [stats,      setStats]      = useState(null);
  const [slotStats,  setSlotStats]  = useState([]);
  const [lotRevenue, setLotRevenue] = useState([]);
  const [allBookings,setAllBookings]= useState([]);
  const [days,       setDays]       = useState(7);
  const [statusFilter,setStatusFilter]=useState('all');
  const [loading,    setLoading]    = useState(true);

  const fetchAll = (d) => {
    setLoading(true);
    Promise.all([
      api.get(`/admin/revenue?days=${d}`),
      api.get('/admin/stats'),
      api.get('/admin/slot-stats'),
      api.get('/admin/revenue-by-lot'),
      api.get('/admin/bookings?limit=50'),
    ])
      .then(([r, s, ss, lr, ab]) => {
        setRevenue(r.data);
        setStats(s.data);
        setSlotStats(ss.data);
        setLotRevenue(lr.data);
        setAllBookings(ab.data.bookings || []);
      })
      .catch(() => toast.error('Could not load analytics'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(days); }, []);

  const handleDays = (d) => { setDays(d); fetchAll(d); };

  // Slot type distribution (approx from total slots)
  const totalSlots = slotStats.reduce((a, s) => a + parseInt(s.total_slots || 0), 0);
  const slotTypeData = [
    { name: '4-Wheeler', value: Math.round(totalSlots * 0.50) },
    { name: '2-Wheeler', value: Math.round(totalSlots * 0.35) },
    { name: 'EV',        value: Math.round(totalSlots * 0.15) },
  ];

  // Booking status breakdown
  const statusBreakdown = ['confirmed','completed','cancelled','pending','expired'].map((s) => ({
    name: s,
    count: allBookings.filter((b) => b.status === s).length,
  })).filter((s) => s.count > 0);

  const filteredBookings = statusFilter === 'all'
    ? allBookings
    : allBookings.filter((b) => b.status === statusFilter);

  const STATUS_BADGE = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-600',
    expired:   'bg-gray-100 text-gray-500',
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Crunching numbers...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Full performance breakdown of SmartPark</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => handleDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                days === d ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',     value: `₹${Number(stats?.total_revenue||0).toLocaleString('en-IN')}`, color: 'text-green-600',  bg: 'bg-green-50  border-green-200' },
          { label: `Revenue (${days}d)`, value: `₹${revenue.reduce((a,r)=>a+parseFloat(r.revenue||0),0).toLocaleString('en-IN')}`, color:'text-blue-600', bg:'bg-blue-50 border-blue-200'},
          { label: 'Total Bookings',    value: stats?.total_bookings||0,           color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Avg / Booking',     value: stats?.total_bookings > 0 ? `₹${Math.round(stats.total_revenue / stats.total_bookings)}` : '₹0', color:'text-orange-600', bg:'bg-orange-50 border-orange-200'},
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border p-5 ${k.bg}`}>
            <p className="text-xs text-gray-500 mb-2">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue + Bookings Area chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Revenue & Bookings — Last {days} Days</h3>
        {revenue.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No data for this period. Make some test bookings first.</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis yAxisId="rev" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} width={60} />
              <YAxis yAxisId="bk"  orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n) => [n==='Revenue' ? `₹${v}` : v, n]} />
              <Legend />
              <Area yAxisId="rev" type="monotone" dataKey="revenue"  name="Revenue"  stroke="#1e3a5f" fill="url(#revGrad)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Area yAxisId="bk"  type="monotone" dataKey="bookings" name="Bookings" stroke="#22c55e" fill="url(#bkGrad)"  strokeWidth={2}   dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row 2 — Pie + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Slot type pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Slot Type Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={slotTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {slotTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Slots']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {slotTypeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{d.name}</p>
                    <p className="text-xs text-gray-400">{d.value} slots</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking status pie */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Booking Status Breakdown</h3>
          {statusBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No booking data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={3}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, _, p) => [v, p.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {statusBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">{d.name}</p>
                      <p className="text-xs text-gray-400">{d.count} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by lot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Revenue by Lot</h3>
        {lotRevenue.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lotRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="lot_name" tick={{ fontSize: 10 }} tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `₹${v}` : v, n === 'revenue' ? 'Revenue' : 'Bookings']} />
              <Legend />
              <Bar dataKey="revenue"  fill="#1e3a5f" radius={[4,4,0,0]} name="Revenue (₹)" />
              <Bar dataKey="bookings" fill="#22c55e" radius={[4,4,0,0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Lot-wise occupancy bars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-5">Lot-wise Slot Occupancy</h3>
        <div className="space-y-4">
          {slotStats.map((row) => {
            const occ = parseFloat(row.occupancy || 0);
            return (
              <div key={row.lot_name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{row.lot_name}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="text-green-600 font-medium">{row.available} free</span>
                    <span className="text-red-500 font-medium">{row.booked} booked</span>
                    <span>{occ}% occupied</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${occ>80?'bg-red-400':occ>50?'bg-amber-400':'bg-green-400'}`}
                    style={{ width: `${occ}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All bookings table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">All Bookings</h3>
          <div className="flex gap-2">
            {['all','confirmed','completed','cancelled','pending'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1 rounded-full border capitalize transition ${
                  statusFilter===s ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-gray-500 border-gray-300'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID','User','Lot','Slot','Duration','Amount','Payment','Status','Date'].map((h)=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const hrs = ((new Date(b.end_time) - new Date(b.start_time))/3600000).toFixed(1);
                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5 text-gray-400 text-xs">#{b.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-800 text-xs">{b.user_name}</p>
                      <p className="text-gray-400 text-[10px]">{b.user_email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs max-w-[120px] truncate">{b.lot_name}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{b.slot_number}</span>
                      <span className="text-gray-400 ml-1">{b.slot_type}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{hrs}h</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 text-xs">₹{b.total_amount}</td>
                    <td className="px-4 py-3.5 text-xs">
                      {b.payment_status ? (
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          b.payment_status==='paid'?'bg-green-100 text-green-700':b.payment_status==='refunded'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-500'
                        }`}>{b.payment_status}</span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[b.status]||'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length===0 && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-300 text-sm">No bookings found</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Showing {filteredBookings.length} bookings
          </div>
        </div>
      </div>
    </div>
  );
}
