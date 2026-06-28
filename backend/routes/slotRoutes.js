const express = require('express');
const router = express.Router();
const { getSlotsByLot, getSlotById, updateSlotStatus, createSlot } = require('../controllers/slotController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/lot/:lotId', getSlotsByLot);
router.get('/detail/:id', protect, getSlotById);
router.post('/', protect, adminOnly, createSlot);
router.patch('/:id/status', protect, adminOnly, updateSlotStatus);

module.exports = router;
