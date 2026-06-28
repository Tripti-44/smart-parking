import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortBy,  setSortBy]  = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = users
    .filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchRole = filter === 'all' || u.role === filter;
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  const SortIcon = ({ col }) => (
    <span className={`ml-1 text-[10px] ${sortBy === col ? 'text-blue-500' : 'text-gray-300'}`}>
      {sortBy === col ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  const totalSpent = users.reduce((s, u) => s + parseFloat(u.total_spent || 0), 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage all registered users</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',    value: users.length,                                  color: 'text-gray-800',   bg: 'bg-gray-50   border-gray-200'   },
          { label: 'Regular Users',  value: users.filter((u)=>u.role==='user').length,     color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200'   },
          { label: 'Admins',         value: users.filter((u)=>u.role==='admin').length,    color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
          { label: 'Total Spending', value: `₹${totalSpent.toLocaleString('en-IN')}`,      color: 'text-green-700',  bg: 'bg-green-50  border-green-200'  },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'user', 'admin'].map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === r ? 'bg-[#1e3a5f] text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  { label: '#',              col: 'id' },
                  { label: 'User',           col: 'name' },
                  { label: 'Phone',          col: 'phone' },
                  { label: 'Role',           col: 'role' },
                  { label: 'Bookings',       col: 'total_bookings' },
                  { label: 'Total Spent',    col: 'total_spent' },
                  { label: 'Joined',         col: 'created_at' },
                ].map((h) => (
                  <th
                    key={h.col}
                    onClick={() => handleSort(h.col)}
                    className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  >
                    {h.label}<SortIcon col={h.col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-gray-400 text-xs">{u.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm">{u.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${u.total_bookings > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {u.total_bookings}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-600">
                    ₹{Number(u.total_spent || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-300">
                    No users found {search && `for "${search}"`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
