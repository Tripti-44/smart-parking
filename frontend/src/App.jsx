import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Auth pages
import Login    from './pages/Login';
import Register from './pages/Register';

// User pages
import Home           from './pages/Home';
import LotList        from './pages/LotList';
import SlotSelection  from './pages/SlotSelection';
import Payment        from './pages/Payment';
import Confirmation   from './pages/Confirmation';
import MyBookings     from './pages/MyBookings';
import LiveMap        from './pages/LiveMap';
import PaymentHistory from './pages/PaymentHistory';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import ManageLots     from './pages/ManageLots';
import AdminUsers     from './pages/AdminUsers';
import Analytics      from './pages/Analytics';

import Layout from './components/Layout';

// ── Guards ──────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated)       return <Navigate to="/login"  replace />;
  if (user?.role !== 'admin') return <Navigate to="/"       replace />;
  return children;
};

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/*
         * ALL authenticated routes share ONE Layout (sidebar).
         * Admin pages are nested here too — no separate layout wrapper.
         */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* ── User pages ── */}
          <Route index                         element={<Home />} />
          <Route path="lots"                   element={<LotList />} />
          <Route path="lots/:lotId/slots"      element={<SlotSelection />} />
          <Route path="payment/:bookingId"     element={<Payment />} />
          <Route path="confirmation/:bookingId" element={<Confirmation />} />
          <Route path="my-bookings"            element={<MyBookings />} />
          <Route path="live-map"               element={<LiveMap />} />
          <Route path="payment-history"        element={<PaymentHistory />} />

          {/* ── Admin pages (wrapped in AdminOnly guard) ── */}
          <Route
            path="admin"
            element={<AdminOnly><AdminDashboard /></AdminOnly>}
          />
          <Route
            path="admin/manage-lots"
            element={<AdminOnly><ManageLots /></AdminOnly>}
          />
          <Route
            path="admin/users"
            element={<AdminOnly><AdminUsers /></AdminOnly>}
          />
          <Route
            path="admin/analytics"
            element={<AdminOnly><Analytics /></AdminOnly>}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
