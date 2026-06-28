import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const EMPTY = {
  name: '', address: '', city: '', latitude: '', longitude: '',
  total_slots: '', price_per_hour: '', opening_time: '06:00', closing_time: '23:00',
};

const SLOT_STATUS_COLOR = {
  available:   'bg-green-400',
  booked:      'bg-red-400',
  maintenance: 'bg-gray-400',
};

export default function ManageLots() {
  const [lots,        setLots]        = useState([]);
  const [slots,       setSlots]       = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [slotStats,   setSlotStats]   = useState([]);
  const [activeTab,   setActiveTab]   = useState('lots');
  const [showModal,   setShowModal]   = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);

  const fetchLots = () =>
    api.get('/lots').then(({ data }) => setLots(data)).finally(() => setLoading(false));

  const fetchSlotStats = () =>
    api.get('/admin/slot-stats').then(({ data }) => setSlotStats(data));

  useEffect(() => { fetchLots(); fetchSlotStats(); }, []);

  const openSlots = (lot) => {
    setSelectedLot(lot);
    setActiveTab('slots');
    api.get(`/slots/lot/${lot.id}`).then(({ data }) => setSlots(data));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };

  const openEdit = (lot) => {
    setForm({
      name: lot.name, address: lot.address, city: lot.city,
      latitude: lot.latitude, longitude: lot.longitude,
      total_slots: lot.total_slots, price_per_hour: lot.price_per_hour,
      opening_time: lot.opening_time || '06:00',
      closing_time: lot.closing_time || '23:00',
    });
    setEditId(lot.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/lots/${editId}`, form);
        toast.success('Lot updated successfully!');
      } else {
        await api.post('/lots', form);
        toast.success('New lot added!');
      }
      setShowModal(false);
      fetchLots();
      fetchSlotStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const changeSlotStatus = async (slotId, status) => {
    try {
      await api.patch(`/slots/${slotId}/status`, { status });
      toast.success(`Slot marked ${status}`);
      if (selectedLot) {
        api.get(`/slots/lot/${selectedLot.id}`).then(({ data }) => setSlots(data));
        fetchSlotStats();
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const tabs = [
    { key: 'lots',  label: `Parking Lots (${lots.length})` },
    { key: 'slots', label: 'Slot Management' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Lots & Slots</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add parking lots, edit details, toggle slot status</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2d5282] transition shadow"
        >
          <span className="text-lg leading-none">+</span> Add New Lot
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === t.key
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LOTS TAB ── */}
      {activeTab === 'lots' && (
        loading ? (
          <div className="text-center py-16 text-gray-400">Loading lots...</div>
        ) : lots.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 mb-3">No parking lots added yet</p>
            <button onClick={openAdd} className="text-sm text-blue-600 hover:underline">+ Add your first lot</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {lots.map((lot) => {
              const stat = slotStats.find((s) => s.lot_name === lot.name);
              const occ  = stat?.occupancy || 0;
              return (
                <div key={lot.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">{lot.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{lot.city}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                      lot.available_slots > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {lot.available_slots > 0 ? `${lot.available_slots} free` : 'Full'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-1">{lot.address}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Total', value: lot.total_slots,        color: 'text-gray-700' },
                      { label: 'Free',  value: lot.available_slots,     color: 'text-green-600' },
                      { label: 'Price', value: `₹${lot.price_per_hour}/hr`, color: 'text-blue-600' },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Occupancy bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Occupancy</span><span>{occ}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${occ > 80 ? 'bg-red-400' : occ > 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                        style={{ width: `${occ}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">🕐 {lot.opening_time} – {lot.closing_time}</p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(lot)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => openSlots(lot)}
                      className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#1e3a5f] text-white hover:bg-[#2d5282] font-medium transition"
                    >
                      Manage Slots
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── SLOTS TAB ── */}
      {activeTab === 'slots' && (
        <div>
          {/* Lot selector */}
          <div className="flex gap-2 flex-wrap mb-5">
            <span className="text-sm text-gray-500 self-center mr-1">Select lot:</span>
            {lots.map((l) => (
              <button
                key={l.id}
                onClick={() => openSlots(l)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${
                  selectedLot?.id === l.id
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {l.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {!selectedLot ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-400">Select a parking lot above to manage its slots</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedLot.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{slots.length} total slots</p>
                  </div>
                  {/* Legend */}
                  <div className="flex gap-3">
                    {[['bg-green-400','Available'],['bg-red-400','Booked'],['bg-gray-400','Maintenance']].map(([c,l])=>(
                      <span key={l} className="flex items-center gap-1 text-xs text-gray-500">
                        <span className={`w-3 h-3 rounded ${c}`}/>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Slot grid */}
                <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-12 gap-2">
                  {slots.map((s) => (
                    <div key={s.id} className="group relative">
                      <div className={`${SLOT_STATUS_COLOR[s.status]} rounded-lg h-12 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition`}>
                        <span className="text-white font-bold text-xs">{s.slot_number}</span>
                        <span className="text-white/70 text-[9px]">{s.type}</span>
                      </div>
                      {/* Hover action */}
                      {s.status !== 'booked' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex gap-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-1 whitespace-nowrap">
                          {s.status !== 'available' && (
                            <button
                              onClick={() => changeSlotStatus(s.id, 'available')}
                              className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            >
                              ✓ Free
                            </button>
                          )}
                          {s.status !== 'maintenance' && (
                            <button
                              onClick={() => changeSlotStatus(s.id, 'maintenance')}
                              className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                            >
                              🔧 Maint.
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Slot stats summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Available',    value: slots.filter(s=>s.status==='available').length,    color: 'text-green-600 bg-green-50 border-green-200' },
                  { label: 'Booked',       value: slots.filter(s=>s.status==='booked').length,       color: 'text-red-600 bg-red-50 border-red-200' },
                  { label: 'Maintenance',  value: slots.filter(s=>s.status==='maintenance').length,  color: 'text-gray-600 bg-gray-50 border-gray-200' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{editId ? 'Edit Parking Lot' : 'Add New Parking Lot'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lot Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Andheri East Parking"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} required placeholder="Street, Area, Pincode"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="Mumbai"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                {/* Lat / Lng */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude *</label>
                    <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} required placeholder="19.1136"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude *</label>
                    <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} required placeholder="72.8697"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>

                {/* Slots / Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Total Slots *</label>
                    <input name="total_slots" type="number" min="1" value={form.total_slots} onChange={handleChange} required placeholder="40"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price/Hour (₹) *</label>
                    <input name="price_per_hour" type="number" min="1" value={form.price_per_hour} onChange={handleChange} required placeholder="40"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>

                {/* Timings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Opening Time</label>
                    <input name="opening_time" type="time" value={form.opening_time} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Closing Time</label>
                    <input name="closing_time" type="time" value={form.closing_time} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#2d5282] transition disabled:opacity-60">
                  {saving ? 'Saving...' : editId ? 'Update Lot' : 'Add Lot'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
