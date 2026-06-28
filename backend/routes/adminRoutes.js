const express = require('express');
const router  = express.Router();
const {
  getDashboardStats,
  getRevenueByDay,
  getAllUsers,
  getAllBookings,
  getSlotStats,
  getRevenueByLot,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes are protected
router.use(protect, adminOnly);

router.get('/stats',          getDashboardStats);
router.get('/revenue',        getRevenueByDay);
router.get('/users',          getAllUsers);
router.get('/bookings',       getAllBookings);
router.get('/slot-stats',     getSlotStats);
router.get('/revenue-by-lot', getRevenueByLot);

module.exports = router;
