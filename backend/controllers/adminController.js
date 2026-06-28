const { sequelize } = require('../config/db');
const User    = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Slot    = require('../models/Slot');
const ParkingLot = require('../models/ParkingLot');

// ─── GET /api/admin/stats ───────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [[revRow]]  = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS total_revenue FROM payments WHERE status='paid'`
    );
    const [[bkRow]]   = await sequelize.query(
      `SELECT COUNT(*) AS total_bookings FROM bookings`
    );
    const [[usrRow]]  = await sequelize.query(
      `SELECT COUNT(*) AS total_users FROM users WHERE role='user'`
    );
    const [[occRow]]  = await sequelize.query(
      `SELECT ROUND(
         SUM(CASE WHEN status='booked' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0)
       ,1) AS occupancy_percent FROM slots`
    );
    const [[todayRow]] = await sequelize.query(
      `SELECT COALESCE(SUM(amount),0) AS today_revenue
       FROM payments WHERE status='paid' AND DATE(paid_at)=CURDATE()`
    );
    const [[pendingRow]] = await sequelize.query(
      `SELECT COUNT(*) AS pending FROM bookings WHERE status='pending'`
    );

    res.json({
      total_revenue:     revRow.total_revenue,
      total_bookings:    bkRow.total_bookings,
      total_users:       usrRow.total_users,
      occupancy_percent: occRow.occupancy_percent || 0,
      today_revenue:     todayRow.today_revenue,
      pending_bookings:  pendingRow.pending,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/revenue?days=7 ─────────────────────────────────────────
const getRevenueByDay = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const [rows] = await sequelize.query(
      `SELECT
         DATE(paid_at)  AS date,
         COUNT(*)       AS bookings,
         SUM(amount)    AS revenue
       FROM payments
       WHERE status='paid'
         AND paid_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(paid_at)
       ORDER BY date ASC`,
      { replacements: [days] }
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/users ───────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
              COUNT(b.id) AS total_bookings,
              COALESCE(SUM(p.amount),0) AS total_spent
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       LEFT JOIN payments p ON p.booking_id = b.id AND p.status='paid'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/bookings?page=1&limit=20&status=all ────────────────────
const getAllBookings = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const offset = (page - 1) * limit;

    const where = status && status !== 'all' ? `WHERE b.status='${status}'` : '';

    const [rows] = await sequelize.query(
      `SELECT b.id, b.status, b.start_time, b.end_time, b.total_amount, b.created_at,
              u.name AS user_name, u.email AS user_email,
              s.slot_number, s.type AS slot_type,
              l.name AS lot_name, l.city,
              p.amount AS paid_amount, p.status AS payment_status, p.razorpay_payment_id
       FROM bookings b
       LEFT JOIN users u    ON u.id = b.user_id
       LEFT JOIN slots s    ON s.id = b.slot_id
       LEFT JOIN parking_lots l ON l.id = s.lot_id
       LEFT JOIN payments p ON p.booking_id = b.id
       ${where}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      { replacements: [limit, offset] }
    );

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM bookings b ${where}`
    );

    res.json({ bookings: rows, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/slot-stats ──────────────────────────────────────────────
const getSlotStats = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT
         l.name AS lot_name, l.city,
         COUNT(s.id)  AS total_slots,
         SUM(CASE WHEN s.status='available'   THEN 1 ELSE 0 END) AS available,
         SUM(CASE WHEN s.status='booked'      THEN 1 ELSE 0 END) AS booked,
         SUM(CASE WHEN s.status='maintenance' THEN 1 ELSE 0 END) AS maintenance,
         ROUND(SUM(CASE WHEN s.status='booked' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(s.id),0),1) AS occupancy
       FROM parking_lots l
       LEFT JOIN slots s ON s.lot_id = l.id
       GROUP BY l.id
       ORDER BY occupancy DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/admin/revenue-by-lot ─────────────────────────────────────────
const getRevenueByLot = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT l.name AS lot_name, l.city,
              COUNT(b.id) AS bookings,
              COALESCE(SUM(p.amount),0) AS revenue
       FROM parking_lots l
       LEFT JOIN slots s    ON s.lot_id = l.id
       LEFT JOIN bookings b ON b.slot_id = s.id
       LEFT JOIN payments p ON p.booking_id = b.id AND p.status='paid'
       GROUP BY l.id
       ORDER BY revenue DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueByDay,
  getAllUsers,
  getAllBookings,
  getSlotStats,
  getRevenueByLot,
};
