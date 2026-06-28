import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = ({ d, extra }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
    className={extra}
  >
    {d}
  </svg>
);

const Icons = {
  dashboard:  <Icon d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>} />,
  bookings:   <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>} />,
  find:       <Icon d={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>} />,
  map:        <Icon d={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></>} />,
  payment:    <Icon d={<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>} />,
  adminDash:  <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />,
  lots:       <Icon d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>} />,
  users:      <Icon d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
  analytics:  <Icon d={<><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>} />,
  logout:     <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />,
};

// ── Nav link data ─────────────────────────────────────────────────────────────
const MAIN_LINKS = [
  { to: '/',                label: 'Dashboard',       icon: Icons.dashboard, end: true },
  { to: '/my-bookings',     label: 'My Bookings',     icon: Icons.bookings },
  { to: '/lots',            label: 'Find Parking',    icon: Icons.find },
  { to: '/live-map',        label: 'Live Map',        icon: Icons.map },
  { to: '/payment-history', label: 'Payment History', icon: Icons.payment },
];

const ADMIN_LINKS = [
  { to: '/admin',               label: 'Admin Dashboard', icon: Icons.adminDash, end: true },
  { to: '/admin/manage-lots',   label: 'Manage Lots',     icon: Icons.lots },
  { to: '/admin/users',         label: 'Users',           icon: Icons.users },
  { to: '/admin/analytics',     label: 'Analytics',       icon: Icons.analytics },
];

// ── Single nav item ───────────────────────────────────────────────────────────
function NavItem({ to, label, icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg mx-2 text-sm transition-all ${
          isActive
            ? 'bg-[#2d5282] text-white font-semibold'
            : 'text-[#a8c0d6] hover:bg-[#243f5c] hover:text-white'
        }`
      }
    >
      <span className="flex-shrink-0 w-[18px]">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function Layout() {
  const dispatch         = useDispatch();
  const navigate         = useNavigate();
  const { user }         = useSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin          = user?.role === 'admin';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* ── Sidebar ── */}
      <aside
        className={`
          bg-[#1a2f4a] flex flex-col flex-shrink-0
          transition-all duration-200
          ${collapsed ? 'w-16' : 'w-60'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#243f5c]">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-base tracking-wide">SmartPark</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#5a7a96] hover:text-white transition p-1 rounded ml-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">

          {/* MAIN section */}
          {!collapsed && (
            <p className="px-4 pt-1 pb-2 text-[10px] font-semibold text-[#5a7a96] uppercase tracking-widest">
              Main
            </p>
          )}
          {MAIN_LINKS.map((l) => (
            <NavItem key={l.to} {...l} collapsed={collapsed} />
          ))}

          {/* ADMIN section — only visible to admins */}
          {isAdmin && (
            <>
              <div className="mx-4 border-t border-[#243f5c] my-3" />
              {!collapsed && (
                <p className="px-4 pb-2 text-[10px] font-semibold text-[#5a7a96] uppercase tracking-widest">
                  Admin
                </p>
              )}
              {ADMIN_LINKS.map((l) => (
                <NavItem key={l.to} {...l} collapsed={collapsed} />
              ))}
            </>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-[#243f5c] px-2 py-3">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                <p className="text-[#5a7a96] text-[10px] capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-[#a8c0d6] hover:bg-[#243f5c] hover:text-red-300 transition text-sm"
          >
            {Icons.logout}
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
